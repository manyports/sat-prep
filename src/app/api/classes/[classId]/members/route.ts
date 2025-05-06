import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Class from '@/models/Class';
import User from '@/models/User';
import mongoose from 'mongoose';

interface PopulatedMember {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
}

interface PopulatedInstructor {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
}

interface PopulatedClass {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  instructor: PopulatedInstructor;
  members: PopulatedMember[];
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getAuth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { classId } = params;
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json(
        { error: 'Invalid class ID' },
        { status: 400 }
      );
    }

    const { memberId } = await req.json();
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return NextResponse.json(
        { error: 'Invalid member ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const classData = await Class.findById(classId);
    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    if (classData.instructor.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the instructor can add members' },
        { status: 403 }
      );
    }

    const member = await User.findById(memberId);
    if (!member) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (classData.members.includes(memberId)) {
      return NextResponse.json(
        { error: 'User is already a member of this class' },
        { status: 400 }
      );
    }

    classData.members.push(memberId);
    await classData.save();

    const updatedClass = await Class.findById(classId)
      .populate<{ instructor: PopulatedInstructor }>('instructor', 'name email')
      .populate<{ members: PopulatedMember[] }>('members', 'name email');

    if (!updatedClass) {
      return NextResponse.json(
        { error: 'Failed to retrieve updated class' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      class: {
        id: updatedClass._id,
        name: updatedClass.name,
        description: updatedClass.description,
        instructor: {
          id: updatedClass.instructor._id,
          name: updatedClass.instructor.name,
          email: updatedClass.instructor.email,
        },
        members: updatedClass.members.map((member) => ({
          id: member._id,
          name: member.name,
          email: member.email,
        })),
        createdAt: updatedClass.createdAt,
        updatedAt: updatedClass.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error adding member to class:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getAuth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { classId } = params;
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json(
        { error: 'Invalid class ID' },
        { status: 400 }
      );
    }

    const { memberId } = await req.json();
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return NextResponse.json(
        { error: 'Invalid member ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const classData = await Class.findById(classId);
    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    if (classData.instructor.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the instructor can remove members' },
        { status: 403 }
      );
    }

    if (!classData.members.includes(memberId)) {
      return NextResponse.json(
        { error: 'User is not a member of this class' },
        { status: 400 }
      );
    }

    classData.members = classData.members.filter(
      (id: mongoose.Types.ObjectId) => id.toString() !== memberId
    );
    await classData.save();

    const updatedClass = await Class.findById(classId)
      .populate<{ instructor: PopulatedInstructor }>('instructor', 'name email')
      .populate<{ members: PopulatedMember[] }>('members', 'name email');

    if (!updatedClass) {
      return NextResponse.json(
        { error: 'Failed to retrieve updated class' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      class: {
        id: updatedClass._id,
        name: updatedClass.name,
        description: updatedClass.description,
        instructor: {
          id: updatedClass.instructor._id,
          name: updatedClass.instructor.name,
          email: updatedClass.instructor.email,
        },
        members: updatedClass.members.map((member) => ({
          id: member._id,
          name: member.name,
          email: member.email,
        })),
        createdAt: updatedClass.createdAt,
        updatedAt: updatedClass.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error removing member from class:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 