import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Class from '@/models/Class';
import Message from '@/models/Message';
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

    await connectToDatabase();

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

    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || 'general';

    const messages = await Message.find({ class: classId, channel })
      .populate('sender', 'name email image')
      .sort({ createdAt: 1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      messages: messages.map(msg => ({
        _id: msg._id.toString(),
        content: msg.content,
        sender: {
          _id: msg.sender._id.toString(),
          name: msg.sender.name,
          email: msg.sender.email,
          image: msg.sender.image
        },
        channel: msg.channel,
        createdAt: msg.createdAt,
        updatedAt: msg.updatedAt,
        assignment: msg.assignment ? {
          _id: msg.assignment._id.toString(),
          title: msg.assignment.title,
          description: msg.assignment.description,
          dueDate: msg.assignment.dueDate,
          type: msg.assignment.type
        } : undefined
      }))
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
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

    const { content, channel = 'general' } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

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

    const message = await Message.create({
      class: classId,
      sender: session.user.id,
      content: content.trim(),
      channel,
    });

    await message.populate('sender', 'name email image');

    return NextResponse.json({
      success: true,
      message: {
        _id: message._id.toString(),
        content: message.content,
        sender: {
          _id: message.sender._id.toString(),
          name: message.sender.name,
          email: message.sender.email,
          image: message.sender.image
        },
        channel: message.channel,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
      }
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
} 