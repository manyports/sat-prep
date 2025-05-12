import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import mongoose, { Types } from 'mongoose'
import User from '@/models/User'
import Class from '@/models/Class'
import { connectToMongoose } from '@/lib/mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { classId: string; testId: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const user = await User.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }
    
    const classDoc = await Class.findById(params.classId)
    
    if (!classDoc) {
      return NextResponse.json(
        { success: false, message: 'Class not found' },
        { status: 404 }
      )
    }
    
    const { db } = await connectToMongoose()
    
    if (!db) {
      throw new Error('Database connection failed')
    }
    
    const originalTestId = params.testId.includes('-') ? params.testId.split('-')[0] : params.testId
    
    const testQuery: any = {
      $or: [
        { id: originalTestId }
      ]
    }
    
    try {
      const objId = new Types.ObjectId(originalTestId)
      testQuery.$or.push({ _id: objId })
    } catch (e) {
      testQuery.$or.push({ _id: originalTestId })
    }
    
    const test = await db.collection('tests').findOne(testQuery)
    
    if (!test) {
      return NextResponse.json(
        { success: false, message: 'Test not found' },
        { status: 404 }
      )
    }
    
    const resultsQuery: any = {
      $or: [
        { testId: params.testId, classId: params.classId },
        { originalTestId: originalTestId, classId: params.classId },
        { testId: originalTestId, classId: params.classId }
      ]
    }
    
    const testResults = await db.collection('testResults').find(resultsQuery).toArray()
    
    const analytics = await generateRealAnalytics(test, testResults)
    
    return NextResponse.json({
      success: true,
      analytics
    })
    
  } catch (error) {
    console.error('Error in test analytics API:', error)
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    )
  }
}

async function generateRealAnalytics(test: any, testResults: any[]) {
  const totalStudents = testResults.length
  
  if (totalStudents === 0) {
    return {
      testId: test._id.toString() || test.id,
      testTitle: test.title || 'Untitled Test',
      totalStudents: 0,
      averageScore: 0,
      medianScore: 0,
      highestScore: 0,
      lowestScore: 0,
      questionAnalytics: (test.questions || []).map((q: any, index: number) => ({
        questionId: q.id || `q-${index}`,
        questionText: q.text || 'No question text',
        correctAnswer: q.correctAnswer || '',
        ...(q.passage && { passage: q.passage }),
        answerDistribution: (q.options || []).map((option: any) => ({
          optionId: option.id || option.optionId,
          optionText: option.text || option.optionText,
          count: 0,
          percentage: 0
        })),
        correctPercentage: 0
      })),
      studentResponses: []
    }
  }
  
  const questions = (test.questions || []).map((q: any, index: number) => {
    const questionId = q.id || `q-${index}`
    const answerDistribution: Record<string, { count: number, optionText: string }> = {}
    
    const options = q.options || []
    options.forEach((option: any) => {
      const optionId = option.id || option.optionId
      answerDistribution[optionId] = { 
        count: 0, 
        optionText: option.text || option.optionText || ''
      }
    })
    
    let correctCount = 0
    testResults.forEach(result => {
      const studentAnswer = result.answers?.[questionId]
      if (studentAnswer) {
        if (!answerDistribution[studentAnswer]) {
          answerDistribution[studentAnswer] = { count: 0, optionText: `Option ${studentAnswer}` }
        }
        answerDistribution[studentAnswer].count++
        
        if (studentAnswer === q.correctAnswer) {
          correctCount++
        }
      }
    })
    
    const correctPercentage = totalStudents > 0 ? correctCount / totalStudents : 0
    
    return {
      questionId,
      questionText: q.text || 'No question text',
      correctAnswer: q.correctAnswer || '',
      ...(q.passage && { passage: q.passage }),
      answerDistribution: Object.entries(answerDistribution).map(([optionId, data]) => ({
        optionId,
        optionText: data.optionText,
        count: data.count,
        percentage: totalStudents > 0 ? data.count / totalStudents : 0
      })),
      correctPercentage
    }
  })
  
  const studentResponses = await Promise.all(testResults.map(async (result) => {
    const score = result.score || 0
    const totalPossible = result.totalCount || test.questions?.length || 1

    let studentName = 'Student';
    try {
      if (result.userId) {
        const user = await User.findById(result.userId).select('name');
        if (user && user.name) {
          studentName = user.name;
        }
      }
    } catch (e) {
      console.warn('Could not find user name for:', result.userId);
    }
    
    const answers = Object.entries(result.answers || {}).map(([questionId, answerId]) => {
      const question = test.questions?.find((q: any) => q.id === questionId)
      const isCorrect = question?.correctAnswer === answerId
      
      return {
        questionId,
        answerId,
        isCorrect
      }
    })
    
    return {
      studentId: result.userId,
      studentName: result.userName || studentName,
      answers,
      score,
      totalPossible,
      completedAt: result.completedAt || result.createdAt || new Date().toISOString()
    }
  }))
  
  let averageScore = 0
  let medianScore = 0
  let highestScore = 0
  let lowestScore = 1
  
  if (totalStudents > 0) {
    const scores = testResults.map(r => {
      const total = r.totalCount || test.questions?.length || 1
      
      if (r.score > 1 && r.score <= 100) {
        return r.score / 100; 
      }
      
      return (r.score || 0) / total
    })
    
    averageScore = scores.reduce((sum, score) => sum + score, 0) / totalStudents
    
    const sortedScores = [...scores].sort((a, b) => a - b)
    medianScore = totalStudents % 2 === 0
      ? (sortedScores[totalStudents/2] + sortedScores[totalStudents/2 - 1]) / 2
      : sortedScores[Math.floor(totalStudents/2)]
    
    highestScore = Math.max(...scores)
    lowestScore = Math.min(...scores)
  }
  
  return {
    testId: test._id.toString() || test.id,
    testTitle: test.title || 'Untitled Test',
    totalStudents,
    averageScore,
    medianScore,
    highestScore,
    lowestScore,
    questionAnalytics: questions,
    studentResponses
  }
} 