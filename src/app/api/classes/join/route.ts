import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Class from '@/models/Class';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { invitationCode } = await request.json();
    if (!invitationCode) {
      return NextResponse.json(
        { error: 'Invitation code is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const classData = await Class.findOne({
      invitationCode,
      invitationCodeExpires: { $gt: new Date() }
    });

    if (!classData) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation code' },
        { status: 404 }
      );
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    if (classData.members.some(memberId => memberId.equals(userId))) {
      return NextResponse.json(
        { error: 'You are already a member of this class' },
        { status: 400 }
      );
    }

    classData.members.push(userId);
    await classData.save();

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the class'
    });
  } catch (error) {
    console.error('Join class error:', error);
    return NextResponse.json(
      { error: 'Failed to join class' },
      { status: 500 }
    );
  }
} 