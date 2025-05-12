import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import UserState from '@/models/UserState';
import { connectToMongoose } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToMongoose();
    
    const userState = await UserState.findOrCreateByUserId(session.user.id);
    
    return NextResponse.json({ 
      success: true, 
      state: userState 
    });
  } catch (error) {
    console.error('Error fetching user state:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user state' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getAuth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await req.json();
    if (!data) {
      return NextResponse.json(
        { success: false, error: 'No data provided' },
        { status: 400 }
      );
    }

    await connectToMongoose();
    
    let userState = await UserState.findOrCreateByUserId(session.user.id);
    
    if (data.currentClassId !== undefined) {
      userState.currentClassId = data.currentClassId;
    }
    
    if (data.savedTests !== undefined) {
      userState.savedTests = data.savedTests;
    }
    
    if (data.testResults !== undefined) {
      userState.testResults = data.testResults;
    }
    
    await userState.save();
    
    return NextResponse.json({ 
      success: true, 
      state: userState 
    });
  } catch (error) {
    console.error('Error updating user state:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user state' },
      { status: 500 }
    );
  }
} 