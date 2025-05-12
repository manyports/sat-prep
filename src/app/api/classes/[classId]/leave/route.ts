import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { connectToMongoose } from '@/lib/mongodb';
import Class from '@/models/Class';
import mongoose from 'mongoose';

export async function POST(
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
    
    const classData = await Class.findById(params.classId);
    
    if (!classData) {
      return NextResponse.json(
        { success: false, message: 'Class not found' },
        { status: 404 }
      );
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    
    const isMember = classData.members.some(m => m.equals(userId));
    if (!isMember) {
      return NextResponse.json(
        { success: false, message: 'You are not a member of this class' },
        { status: 400 }
      );
    }

    if (classData.instructor.equals(userId)) {
      return NextResponse.json(
        { success: false, message: 'Instructors cannot leave their own class. Please delete the class instead.' },
        { status: 400 }
      );
    }

    await Class.findByIdAndUpdate(
      params.classId,
      { $pull: { members: userId } }
    );

    return NextResponse.json({
      success: true,
      message: 'You have left the class successfully'
    });
  } catch (error) {
    console.error('Class leave error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to leave class' },
      { status: 500 }
    );
  }
} 