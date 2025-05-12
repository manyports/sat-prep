import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { connectToMongoose } from '@/lib/mongodb';
import Class from '@/models/Class';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getAuth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId } = params;
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 });
    }

    await connectToMongoose();

    const classData = await Class.findById(classId);
    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const isMember = classData.members.some(
      (member: mongoose.Types.ObjectId) => member.toString() === session.user.id
    );
    if (!isMember) {
      return NextResponse.json({ error: 'Not a member of this class' }, { status: 403 });
    }

    const channels = classData.channels || ['general', 'assignments', 'questions'];

    return NextResponse.json({
      success: true,
      channels
    });
  } catch (error) {
    console.error('Error fetching channels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getAuth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId } = params;
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 });
    }

    await connectToMongoose();

    const classData = await Class.findById(classId);
    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (classData.instructor.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Only instructors can create channels' }, { status: 403 });
    }

    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Channel name is required' }, { status: 400 });
    }

    const formattedName = name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const channels = classData.channels || ['general', 'assignments', 'questions'];
    if (channels.includes(formattedName)) {
      return NextResponse.json({ error: 'Channel already exists' }, { status: 400 });
    }

    classData.channels = [...channels, formattedName];
    await classData.save();

    return NextResponse.json({
      success: true,
      channelName: formattedName
    });
  } catch (error) {
    console.error('Error creating channel:', error);
    return NextResponse.json(
      { error: 'Failed to create channel' },
      { status: 500 }
    );
  }
} 