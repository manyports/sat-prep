import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { connectToMongoose } from '@/lib/mongodb';
import Class, { IClass } from '@/models/Class';
import mongoose from 'mongoose';
import { IUser } from '@/models/User';

interface PopulatedInstructor {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
}

interface PopulatedMember {
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
  invitationCode?: string;
  invitationCodeExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getAuth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(params.classId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid class ID' },
        { status: 400 }
      );
    }

    await connectToMongoose();
    
    const classData = await Class.findOne({
      _id: params.classId,
      $or: [
        { instructor: session.user.id },
        { members: session.user.id }
      ]
    }).populate<{ instructor: PopulatedInstructor }>('instructor', 'name email')
      .populate<{ members: PopulatedMember[] }>('members', 'name email');

    if (!classData) {
      return NextResponse.json(
        { success: false, message: 'Class not found' },
        { status: 404 }
      );
    }

    const populatedClass = classData as unknown as PopulatedClass;

    return NextResponse.json({
      success: true,
      class: {
        id: populatedClass._id.toString(),
        name: populatedClass.name,
        description: populatedClass.description,
        instructor: {
          id: populatedClass.instructor._id.toString(),
          name: populatedClass.instructor.name,
          email: populatedClass.instructor.email
        },
        members: populatedClass.members.map(member => ({
          id: member._id.toString(),
          name: member.name,
          email: member.email
        })),
        createdAt: populatedClass.createdAt,
        updatedAt: populatedClass.updatedAt
      }
    });
  } catch (error) {
    console.error('Class fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch class' },
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
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(params.classId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid class ID' },
        { status: 400 }
      );
    }

    const { name, description } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { success: false, message: 'Name and description are required' },
        { status: 400 }
      );
    }

    await connectToMongoose();
    
    const classData = await Class.findOne({
      _id: params.classId,
      instructor: session.user.id
    });

    if (!classData) {
      return NextResponse.json(
        { success: false, message: 'Class not found or you are not the instructor' },
        { status: 404 }
      );
    }

    const updatedClassDoc = await Class.findByIdAndUpdate(
      params.classId,
      { name, description },
      { new: true }
    ).populate<{ instructor: PopulatedInstructor }>('instructor', 'name email')
      .populate<{ members: PopulatedMember[] }>('members', 'name email');

    if (!updatedClassDoc) {
      return NextResponse.json(
        { success: false, message: 'Failed to update class' },
        { status: 500 }
      );
    }
    
    const updatedClass = updatedClassDoc as unknown as PopulatedClass;

    return NextResponse.json({
      success: true,
      class: {
        id: updatedClass._id.toString(),
        name: updatedClass.name,
        description: updatedClass.description,
        instructor: {
          id: updatedClass.instructor._id.toString(),
          name: updatedClass.instructor.name,
          email: updatedClass.instructor.email
        },
        members: updatedClass.members.map(member => ({
          id: member._id.toString(),
          name: member.name,
          email: member.email
        })),
        createdAt: updatedClass.createdAt,
        updatedAt: updatedClass.updatedAt
      }
    });
  } catch (error) {
    console.error('Class update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update class' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getAuth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(params.classId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid class ID' },
        { status: 400 }
      );
    }

    await connectToMongoose();
    
    const classData = await Class.findOne({
      _id: params.classId,
      instructor: session.user.id
    });

    if (!classData) {
      return NextResponse.json(
        { success: false, message: 'Class not found or you are not the instructor' },
        { status: 404 }
      );
    }

    await Class.findByIdAndDelete(params.classId);

    return NextResponse.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Class deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete class' },
      { status: 500 }
    );
  }
} 