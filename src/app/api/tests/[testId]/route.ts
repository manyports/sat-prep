import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToMongoose } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  req: NextRequest,
  { params }: { params: { testId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { testId } = params;
    if (!testId) {
      return NextResponse.json(
        { success: false, error: 'Test ID is required' },
        { status: 400 }
      );
    }

    const originalTestId = testId.includes('-') ? testId.split('-')[0] : testId;

    const { db } = await connectToMongoose();
    
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    let test = null;
    
    try {
      test = await db.collection('tests').findOne({ _id: new ObjectId(originalTestId) });
    } catch (e) {
      console.error('Error finding test by ObjectId:', e);
    }
    
    if (!test) {
      test = await db.collection('tests').findOne({ id: originalTestId });
    }
    
    if (!test && testId !== originalTestId) {
      try {
        test = await db.collection('tests').findOne({ _id: new ObjectId(testId) });
      } catch (e) {
        test = await db.collection('tests').findOne({ id: testId });
      }
    }

    if (!test) {
      return NextResponse.json(
        { success: false, error: 'Test not found' },
        { status: 404 }
      );
    }

    if (test.classId) {
      try {
        let userObjectId;
        try {
          userObjectId = new ObjectId(session.user.id);
        } catch (e) {
          userObjectId = session.user.id;
        }
        
        await db.collection('userstates').updateOne(
          { userId: userObjectId },
          { 
            $set: { 
              currentClassId: test.classId,
              updatedAt: new Date()
            },
            $setOnInsert: { 
              userId: userObjectId,
              createdAt: new Date()
            }
          },
          { upsert: true }
        );
      } catch (err) {
        console.error('Failed to update UserState with current classId:', err);
      }
    }

    return NextResponse.json({ success: true, test });
  } catch (error) {
    console.error('Error fetching test:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test' },
      { status: 500 }
    );
  }
}