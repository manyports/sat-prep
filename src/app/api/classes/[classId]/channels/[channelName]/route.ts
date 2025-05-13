import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { connectToMongoose } from '@/lib/mongodb';
import Class from '@/models/Class';
import Message from '@/models/Message';
import mongoose from 'mongoose';
import { pusher } from '@/lib/pusher';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { classId: string; channelName: string } }
) {
  try {
    const session = await getAuth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, channelName } = params;
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 });
    }

    if (['general', 'assignments', 'questions'].includes(channelName)) {
      return NextResponse.json({ error: 'Cannot delete default channels' }, { status: 400 });
    }

    await connectToMongoose();

    const classData = await Class.findById(classId);
    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (classData.instructor.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Only instructors can delete channels' }, { status: 403 });
    }

    if (!classData.channels || !classData.channels.includes(channelName)) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    classData.channels = classData.channels.filter(ch => ch !== channelName);
    await classData.save();

    await Message.deleteMany({ class: classId, channel: channelName });

    await pusher.trigger(
      `class-${classId}`,
      'channel-deleted',
      {
        channelName
      }
    );

    return NextResponse.json({
      success: true,
      message: `Channel #${channelName} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting channel:', error);
    return NextResponse.json(
      { error: 'Failed to delete channel' },
      { status: 500 }
    );
  }
} 