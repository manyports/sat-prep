import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToMongoose } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface QuestionOption {
  id: string;
  text: string;
}

interface QuestionImage {
  id: string;
  url: string;
  alt?: string;
  fileKey?: string;
}

interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correctAnswer: string;
  passage?: string | null;
  pointValue?: number;
  tags?: string[];
  images?: QuestionImage[];
}

interface TestData {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  timeLimit?: number;
  totalPoints?: number;
  questions?: Question[];
  lastModified?: string | Date;
  classId?: string;
  createdBy?: string;
}

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

    const { db } = await connectToMongoose();
    
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    let test;
    try {
      test = await db.collection('tests').findOne({
        _id: new ObjectId(testId),
        classId: classId
      });

      if (!test) {
        test = await db.collection('tests').findOne({
          _id: new ObjectId(testId),
          createdBy: session.user.id
        });
      }
    } catch (e) {
      console.error("Error parsing ObjectId, trying with string ID:", e);
      test = await db.collection('tests').findOne({
        $or: [
          { id: testId, classId: classId },
          { id: testId, createdBy: session.user.id }
        ]
      });
    }

    if (!test) {
      return NextResponse.json(
        { success: false, error: 'Test not found' },
        { status: 404 }
      );
    }
    
    const hasImages = test.questions?.some((q: Question) => 
      Array.isArray(q.images) && q.images.length > 0
    ) || false;
    
    if (test.questions && Array.isArray(test.questions)) {
      const totalImages = test.questions.reduce(
        (count, q) => count + (Array.isArray(q.images) ? q.images.length : 0), 
        0
      );
      
      console.log(`📤 GET Test ${testId}: Found ${totalImages} total images`);
      
      if (totalImages > 0) {
        const imageCountsPerQuestion = test.questions
          .filter((q: Question) => Array.isArray(q.images) && q.images.length > 0)
          .map((q: Question) => `Q${q.id}: ${q.images!.length} images`);
          
        console.log(`📊 Image distribution: ${imageCountsPerQuestion.join(', ')}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      test,
      hasImages
    });
  } catch (error) {
    console.error('Error fetching test:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const data: TestData = await req.json();
    
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
    
    const existingTest = await db.collection('tests').findOne({
      _id: new ObjectId(testId),
      classId: classId
    });

    if (!existingTest) {
      return NextResponse.json(
        { success: false, error: 'Test not found' },
        { status: 404 }
      );
    }

    if (existingTest.createdBy !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to update this test' },
        { status: 403 }
      );
    }

    console.log('Received test data for update:', {
      testId,
      title: data.title,
      questionCount: data.questions?.length || 0,
      hasImages: data.questions?.some((q: Question) => Array.isArray(q.images) && q.images.length > 0) || false
    });

    if (data.questions && Array.isArray(data.questions)) {
      const imageCountsPerQuestion = data.questions.map((q: Question, idx: number) => {
        const imageCount = Array.isArray(q.images) ? q.images.length : 0;
        return `Q${idx+1}(${q.id}): ${imageCount} images`;
      });
      console.log(`📊 IMAGE COUNTS IN API: ${imageCountsPerQuestion.join(', ')}`);
      
      const questionsWithImages = data.questions.filter(q => Array.isArray(q.images) && q.images.length > 0);
      if (questionsWithImages.length > 0) {
        console.log(`🖼️ Found ${questionsWithImages.length} questions with images`);
        questionsWithImages.forEach((q, idx) => {
          console.log(`  Question ${q.id}: ${q.images!.length} images - URLs: ${
            q.images!.map(img => img.url.substring(0, 30) + '...').join(', ')
          }`);
        });
      }
      
      data.questions = data.questions.map((q: Question) => {
        if (!q.images || !Array.isArray(q.images)) {
          console.log(`⚠️ Question ${q.id} had no images array - initializing empty array`);
          return {
            ...q,
            images: []
          };
        }
        return q;
      });
    }

    const updateData = {
      ...data,
      lastModified: new Date()
    };
    
    delete updateData._id;
    
    const hasImages = updateData.questions?.some((q: Question) => Array.isArray(q.images) && q.images.length > 0) || false;
    const totalImageCount = updateData.questions?.reduce(
      (count, q) => count + (Array.isArray(q.images) ? q.images.length : 0), 
      0
    ) || 0;

    console.log(`🔍 Final verification: Test has images: ${hasImages}, Total image count: ${totalImageCount}`);

    const result = await db.collection('tests').updateOne(
      { _id: new ObjectId(testId) },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'No changes were made to the test' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test updated successfully',
      hasImages: hasImages,
      imageCount: totalImageCount
    });
  } catch (error: any) {
    console.error('Error updating test:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to update test: ${error.message || 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { db } = await connectToMongoose();
    
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const existingTest = await db.collection('tests').findOne({
      _id: new ObjectId(testId),
      classId: classId
    });

    if (!existingTest) {
      return NextResponse.json(
        { success: false, error: 'Test not found' },
        { status: 404 }
      );
    }

    if (existingTest.createdBy !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to delete this test' },
        { status: 403 }
      );
    }

    await db.collection('tests').deleteOne({ _id: new ObjectId(testId) });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting test:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete test' },
      { status: 500 }
    );
  }
} 