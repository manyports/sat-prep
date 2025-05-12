import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToMongoose } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const classId = params.classId;
    if (!classId) {
      return NextResponse.json(
        { success: false, error: 'Class ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToMongoose();
    
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const tests = await db.collection('tests')
      .find({
        $or: [
          { classId: classId },
          { createdBy: session.user.id }
        ]
      })
      .sort({ lastModified: -1 })
      .toArray();

    const testsWithSource = tests.map(test => ({
      ...test,
      isCurrentClass: test.classId === classId
    }));

    return NextResponse.json({ success: true, tests: testsWithSource });
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { classId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const classId = params.classId;
    if (!classId) {
      return NextResponse.json(
        { success: false, error: 'Class ID is required' },
        { status: 400 }
      );
    }

    const data = await req.json();
    
    if (!data.title) {
      return NextResponse.json(
        { success: false, error: 'Test title is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToMongoose();
    
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const testData = {
      ...data,
      classId,
      createdBy: session.user.id,
      createdAt: new Date(),
      lastModified: new Date()
    };
    
    const result = await db.collection('tests').insertOne(testData);
    
    return NextResponse.json({ 
      success: true, 
      testId: result.insertedId,
      message: 'Test created successfully' 
    });
  } catch (error) {
    console.error('Error creating test:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create test' },
      { status: 500 }
    );
  }
} 