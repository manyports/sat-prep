import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
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

export async function GET(request: NextRequest) {
  try {
    const session = await getAuth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const classesData = await Class.find({
      $or: [
        { instructor: session.user.id },
        { members: session.user.id }
      ]
    }).populate<{ instructor: PopulatedInstructor }>('instructor', 'name email')
      .populate<{ members: PopulatedMember[] }>('members', 'name email');

    const classes = classesData.map(cls => cls as unknown as PopulatedClass);

    return NextResponse.json({
      success: true,
      classes: classes.map(cls => ({
        id: cls._id.toString(),
        name: cls.name,
        description: cls.description,
        instructor: {
          id: cls.instructor._id.toString(),
          name: cls.instructor.name,
          email: cls.instructor.email
        },
        members: cls.members.map(member => ({
          id: member._id.toString(),
          name: member.name,
          email: member.email
        })),
        invitationCode: cls.invitationCode,
        invitationCodeExpires: cls.invitationCodeExpires,
        createdAt: cls.createdAt,
        updatedAt: cls.updatedAt
      }))
    });
  } catch (error) {
    console.error('Classes fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuth();
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, description } = await request.json();

    if (!name || !description) {
      return NextResponse.json(
        { success: false, message: 'Name and description are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    const newClass = await Class.create({
      name,
      description,
      instructor: session.user.id,
      members: [session.user.id]
    });

    const populatedClassDoc = await Class.findById(newClass._id)
      .populate<{ instructor: PopulatedInstructor }>('instructor', 'name email')
      .populate<{ members: PopulatedMember[] }>('members', 'name email');

    if (!populatedClassDoc) {
      return NextResponse.json(
        { success: false, message: 'Failed to create class' },
        { status: 500 }
      );
    }

    const populatedClass = populatedClassDoc as unknown as PopulatedClass;

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
        invitationCode: populatedClass.invitationCode,
        invitationCodeExpires: populatedClass.invitationCodeExpires,
        createdAt: populatedClass.createdAt,
        updatedAt: populatedClass.updatedAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Class creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create class' },
      { status: 500 }
    );
  }
} 