import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { connectToMongoose } from '@/lib/mongodb';
import Class from '@/models/Class';
import mongoose from 'mongoose';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { classId: string; memberId: string } }
) {
  try {
    const session = await getAuth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, memberId } = params;
    if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(memberId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    await connectToMongoose();

    const classData = await Class.findOne({
      _id: classId,
      instructor: session.user.id
    });

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found or you are not the instructor' },
        { status: 404 }
      );
    }

    classData.members = classData.members.filter(
      (id: mongoose.Types.ObjectId) => id.toString() !== memberId
    );
    await classData.save();

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { classId: string; memberId: string } }
) {
  try {
    const session = await getAuth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, memberId } = params;
    if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(memberId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const { name } = await request.json();

    await connectToMongoose();

    const classData = await Class.findOne({
      _id: classId,
      instructor: session.user.id
    });

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found or you are not the instructor' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Member updated successfully'
    });
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
} 