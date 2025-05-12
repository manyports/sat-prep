import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToMongoose } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { classId: string; testId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { classId, testId } = params;
    if (!classId || !testId) {
      return NextResponse.json(
        { success: false, error: 'Class ID and Test ID are required' },
        { status: 400 }
      );
    }

    const originalTestId = testId.includes('-') ? testId.split('-')[0] : testId;

    const { db } = await connectToMongoose();
    
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const results = await db.collection('testResults').findOne({
      $or: [
        { testId, userId: session.user.id, classId },
        { originalTestId, userId: session.user.id, classId }
      ]
    });

    if (!results) {
      return NextResponse.json({ 
        success: true, 
        results: null,
        message: 'No test results found for this user and test' 
      });
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Error fetching test results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test results' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { classId: string; testId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { classId, testId } = params;
    if (!classId || !testId) {
      return NextResponse.json(
        { success: false, error: 'Class ID and Test ID are required' },
        { status: 400 }
      );
    }

    const data = await req.json();
    
    if (!data.score && data.score !== 0) {
      return NextResponse.json(
        { success: false, error: 'Score is required' },
        { status: 400 }
      );
    }
    
    const originalTestId = data.originalTestId || (testId.includes('-') ? testId.split('-')[0] : testId);

    const { db } = await connectToMongoose();
    
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const test = await db.collection('tests').findOne({
      $or: [
        { _id: new ObjectId(originalTestId) },
        { _id: originalTestId },
        { id: originalTestId }
      ]
    });

    const existingResult = await db.collection('testResults').findOne({
      $or: [
        { testId, userId: session.user.id, classId },
        { originalTestId, userId: session.user.id, classId }
      ]
    });

    if (existingResult) {
      await db.collection('testResults').updateOne(
        { _id: existingResult._id },
        { 
          $set: {
            ...data,
            userId: session.user.id,
            testId,
            originalTestId,
            classId,
            updatedAt: new Date()
          } 
        }
      );
    } else {
      await db.collection('testResults').insertOne({
        ...data,
        userId: session.user.id,
        testId,
        originalTestId,
        classId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test results saved successfully' 
    });
  } catch (error) {
    console.error('Error saving test results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save test results' },
      { status: 500 }
    );
  }
} 