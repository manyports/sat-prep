import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { connectToMongoose } from '@/lib/mongodb';
import Class from '@/models/Class';
import mongoose, { Types } from 'mongoose';

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
    if (!Types.ObjectId.isValid(classId)) {
      return NextResponse.json({ error: 'Invalid class ID' }, { status: 400 });
    }

    await connectToMongoose();

    const classData = await Class.findOne({
      _id: new Types.ObjectId(classId),
      instructor: new Types.ObjectId(session.user.id)
    }).exec();

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found or you are not the instructor' },
        { status: 404 }
      );
    }

    const { action } = await request.json();

    if (action === 'generate') {
      try {
        const result = await classData.generateInvitationCode();
        return NextResponse.json({
          success: true,
          invitationCode: result.code,
          expires: result.expires
        });
      } catch (error) {
        console.error('Generate invitation code error:', error);
        return NextResponse.json(
          { error: 'Failed to generate invitation code' },
          { status: 500 }
        );
      }
    } else if (action === 'revoke') {
      try {
        await classData.revokeInvitationCode();
        return NextResponse.json({
          success: true,
          message: 'Invitation code revoked'
        });
      } catch (error) {
        console.error('Revoke invitation code error:', error);
        return NextResponse.json(
          { error: 'Failed to revoke invitation code' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Invitation code error:', error);
    return NextResponse.json(
      { error: 'Failed to manage invitation code' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const { invitationCode } = await request.json();
    if (!invitationCode) {
      return NextResponse.json(
        { error: 'Invitation code is required' },
        { status: 400 }
      );
    }

    await connectToMongoose();

    const classData = await Class.findOne({
      _id: new Types.ObjectId(classId),
      invitationCode,
      invitationCodeExpires: { $gt: new Date() }
    });

    if (!classData) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation code' },
        { status: 404 }
      );
    }

    if (classData.members.some(member => member.equals(new Types.ObjectId(session.user.id)))) {
      return NextResponse.json(
        { error: 'You are already a member of this class' },
        { status: 400 }
      );
    }

    classData.members.push(new Types.ObjectId(session.user.id));
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