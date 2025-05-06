import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import connectToDatabase from '@/lib/mongodb';
import Class from '@/models/Class';
import mongoose from 'mongoose';

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

    const { role } = await request.json();
    if (!role || !['instructor', 'student'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    await connectToDatabase();

    const classData = await Class.findOne({
      _id: new mongoose.Types.ObjectId(classId),
      instructor: new mongoose.Types.ObjectId(session.user.id)
    });

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found or you are not the instructor' },
        { status: 404 }
      );
    }

    if (role === 'instructor') {
      classData.instructor = new mongoose.Types.ObjectId(memberId);
      
      const userObjectId = new mongoose.Types.ObjectId(session.user.id);
      if (!classData.members.some(member => member.equals(userObjectId))) {
        classData.members.push(userObjectId);
      }
    } else {
      const memberObjectId = new mongoose.Types.ObjectId(memberId);
      if (!classData.members.some(member => member.equals(memberObjectId))) {
        classData.members.push(memberObjectId);
      }
    }

    await classData.save();

    return NextResponse.json({
      success: true,
      message: 'Member role updated successfully'
    });
  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { error: 'Failed to update member role' },
      { status: 500 }
    );
  }
} 