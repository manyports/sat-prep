import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { connectToMongoose } from '@/lib/mongodb';
import Message from '@/models/Message';
import Class from '@/models/Class';
import mongoose from 'mongoose';

export async function PUT(
  request: NextRequest,
  { params }: { params: { classId: string; messageId: string } }
) {
  try {
    const session = await getAuth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, messageId } = params;
    if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
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

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    if (message.sender.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to edit this message' }, { status: 403 });
    }

    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    message.content = content.trim();
    await message.save();

    return NextResponse.json({
      success: true,
      message: {
        _id: message._id.toString(),
        content: message.content,
        updatedAt: message.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { classId: string; messageId: string } }
) {
  try {
    const session = await getAuth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { classId, messageId } = params;
    if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
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

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const isInstructor = classData.instructor.toString() === session.user.id;
    if (message.sender.toString() !== session.user.id && !isInstructor) {
      return NextResponse.json({ error: 'Not authorized to delete this message' }, { status: 403 });
    }

    await Message.findByIdAndDelete(messageId);

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
} 