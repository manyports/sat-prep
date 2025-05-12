"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BarChart3, UserCircle, ClipboardCheck, Download, Eye, ArrowUpDown, AlertTriangle, ChevronDown, ChevronUp, BookOpen } from "lucide-react"
import { Grid, GridItem } from "@/components/grid"
import { LatexRenderer } from "@/components/LatexRenderer"
import { useSession } from "next-auth/react"

interface StudentResponse {
  studentId: string;
  studentName: string;
  answers: {
    questionId: string;
    answerId: string;
    isCorrect: boolean;
  }[];
  score: number;
  totalPossible: number;
  completedAt: string;
  timeSpent: number;
}

interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  correctAnswer: string;
  passage?: string;
  answerDistribution: {
    optionId: string;
    optionText: string;
    count: number;
    percentage: number;
  }[];
  correctPercentage: number;
}

interface TestAnalytics {
  testId: string;
  testTitle: string;
  totalStudents: number;
  averageScore: number;
  medianScore: number;
  highestScore: number;
  lowestScore: number;
  averageTimeSpent: number; 
  questionAnalytics: QuestionAnalytics[];
  studentResponses: StudentResponse[];
}

export default function TestAnalyticsPage() {
  const router = useRouter()
  const params = useParams()
  const classId = params.classId as string
  const testId = params.testId as string
  const { data: session, status } = useSession()
  
  const [analytics, setAnalytics] = useState<TestAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<StudentResponse | null>(null)
  const [sortOrder, setSortOrder] = useState<'score' | 'name' | 'date'>('score')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [expandedPassages, setExpandedPassages] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/classes/${classId}/tests/${testId}/analytics`)
        if (!response.ok) {
          throw new Error('Failed to fetch analytics')
        }
        
        const data = await response.json()
        if (data.success) {
          setAnalytics(data.analytics)
        } else {
          throw new Error(data.message || 'Failed to fetch analytics')
        }
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAnalytics()
  }, [classId, testId])
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    )
  }
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const handleViewResponse = (student: StudentResponse) => {
    setSelectedStudent(student)
    setShowResponseDialog(true)
  }
  
  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
  }
  
  const handleSort = (order: 'score' | 'name' | 'date') => {
    if (sortOrder === order) {
      toggleSortDirection()
    } else {
      setSortOrder(order)
      setSortDirection('desc')
    }
  }
  
  const getSortedStudents = () => {
    if (!analytics?.studentResponses) return []
    
    return [...analytics.studentResponses].sort((a, b) => {
      let comparison = 0
      
      switch (sortOrder) {
        case 'score':
          comparison = (a.score / a.totalPossible) - (b.score / b.totalPossible)
          break
        case 'name':
          comparison = a.studentName.localeCompare(b.studentName)
          break
        case 'date':
          comparison = new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
          break
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }
  
  const containsLatex = (text: string): boolean => {
    if (!text || typeof text !== 'string') return false;
    return /\$/.test(text);
  };

  const renderText = (text: string) => {
    if (!text) return null;
    
    if (containsLatex(text)) {
      const regex = /(\$\$|\$)(.*?)(\$\$|\$)/g;
      const parts: React.ReactNode[] = [];
      let currentIndex = 0;
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        if (match.index > currentIndex) {
          parts.push(text.substring(currentIndex, match.index));
        }
        
        const isBlock = match[1] === '$$';
        const latex = match[2];
        
        parts.push(
          <LatexRenderer 
            key={match.index}
            latex={latex}
            isBlock={isBlock}
          />
        );
        
        currentIndex = match.index + match[0].length;
      }
      
      if (currentIndex < text.length) {
        parts.push(text.substring(currentIndex));
      }
      
      return <span className="whitespace-pre-line">{parts}</span>;
    }
    
    return <span className="whitespace-pre-line">{text}</span>;
  };
  
  const togglePassage = (questionId: string) => {
    setExpandedPassages(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  }
  
  const renderStudentDialog = () => {
    if (!analytics || !selectedStudent) return null;
    
    return (
      <div className="max-h-[70vh] overflow-y-auto pr-3">
        <div className="space-y-8 py-4">
          {selectedStudent.answers.map((answer: any, index: number) => {
            const question = analytics.questionAnalytics.find((q: any) => q.questionId === answer.questionId);
            if (!question) return null;
            
            const isPassageExpanded = expandedPassages[question.questionId] || false;
            
            return (
              <div key={answer.questionId} className={`p-4 rounded-lg ${answer.isCorrect ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                <div className="flex justify-between mb-2">
                  <div className="font-medium">Question {index + 1}</div>
                  <div className={`font-medium ${answer.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {answer.isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                </div>
                
                {question.passage && (
                  <div className="mb-4">
                    <div 
                      className="bg-gray-50 rounded p-3 border border-gray-200 cursor-pointer"
                      onClick={() => togglePassage(question.questionId)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-blue-700 text-sm font-medium">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {isPassageExpanded ? 'Hide Passage' : 'View Passage'}
                        </div>
                        {isPassageExpanded ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      
                      {isPassageExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                          {renderText(question.passage)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  {renderText(question.questionText)}
                </div>
                
                <div className="space-y-2">
                  {question.answerDistribution.map((option: any) => {
                    const isStudentAnswer = option.optionId === answer.answerId;
                    const isCorrectAnswer = option.optionId === question.correctAnswer;
                    
                    return (
                      <div key={option.optionId} className={`p-2 rounded ${
                        isStudentAnswer && isCorrectAnswer ? 'bg-green-100 border border-green-200' :
                        isStudentAnswer && !isCorrectAnswer ? 'bg-red-100 border border-red-200' :
                        isCorrectAnswer ? 'bg-green-50 border border-green-100' :
                        'bg-white border border-gray-200'
                      }`}>
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                            isCorrectAnswer 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {option.optionId.toUpperCase()}
                          </div>
                          <div className="flex-1">
                            {renderText(option.optionText)}
                          </div>
                          {isStudentAnswer && (
                            <div className="ml-2 text-sm font-medium">
                              Student's Answer
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const renderOverviewTab = () => {
    if (!analytics) return <div className="py-10 text-center">No data available</div>
    
    return (
      <div className="space-y-6">
        <Grid>
          <GridItem className="py-6">
            <h2 className="text-2xl font-bold mb-6">{analytics.testTitle}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 mb-1">Students</div>
                <div className="text-2xl font-bold">{analytics.totalStudents}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 mb-1">Average Score</div>
                <div className="text-2xl font-bold">{Math.round(analytics.averageScore * 100)}%</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <div className="text-sm text-amber-600 mb-1">Average Time</div>
                <div className="text-2xl font-bold">{formatTime(analytics.averageTimeSpent)}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 mb-1">Highest Score</div>
                <div className="text-2xl font-bold">{Math.round(analytics.highestScore * 100)}%</div>
              </div>
            </div>
          </GridItem>
        </Grid>
        
        <Grid>
          <GridItem className="py-6">
            <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-around p-4">
              {Array.from({ length: 10 }).map((_, i) => {
                const height = Math.random() * 80 + 10
                return (
                  <div key={i} className="w-[8%] flex flex-col items-center">
                    <div 
                      className="bg-blue-600 w-full rounded-t-sm" 
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs mt-2">{`${i*10}-${(i+1)*10}%`}</div>
                  </div>
                )
              })}
            </div>
          </GridItem>
        </Grid>
        
        <Grid>
          <GridItem className="py-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Challenging Questions</h3>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("questions")}>
                View All Questions
              </Button>
            </div>
            <div className="space-y-3">
              {analytics.questionAnalytics
                .sort((a, b) => a.correctPercentage - b.correctPercentage)
                .slice(0, 3)
                .map(question => (
                  <div key={question.questionId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="pr-4 flex-1">
                        <div className="text-sm mb-2">Question:</div>
                        <div className="mb-2">
                          {renderText(question.questionText)}
                        </div>
                      </div>
                      <div className="bg-red-50 text-red-600 text-xl font-bold p-2 rounded">
                        {Math.round(question.correctPercentage * 100)}%
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Most common incorrect answer: {
                        question.answerDistribution
                          .filter(o => o.optionId !== question.correctAnswer)
                          .sort((a, b) => b.count - a.count)[0]?.optionText || "N/A"
                      }
                    </div>
                  </div>
                ))}
            </div>
          </GridItem>
        </Grid>
      </div>
    )
  }
  
  const renderQuestionsTab = () => {
    if (!analytics) return <div className="py-10 text-center">No data available</div>
    
    return (
      <div className="space-y-6">
        <Grid>
          <GridItem className="py-6">
            <h3 className="text-lg font-semibold mb-4">Question Performance</h3>
            {analytics.questionAnalytics.map((question, index) => {
              const isPassageExpanded = expandedPassages[question.questionId] || false;
              
              return (
                <div key={question.questionId} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-3">
                    <div className="font-medium">Question {index + 1}</div>
                    <div className={`px-2 py-1 rounded text-sm font-medium ${
                      question.correctPercentage > 0.7 ? 'bg-green-100 text-green-800' :
                      question.correctPercentage > 0.4 ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {Math.round(question.correctPercentage * 100)}% Correct
                    </div>
                  </div>
                  
                  {question.passage && (
                    <div className="mb-4">
                      <div 
                        className="bg-gray-50 rounded p-3 border border-gray-200 cursor-pointer"
                        onClick={() => togglePassage(question.questionId)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-blue-700 text-sm font-medium">
                            <BookOpen className="h-4 w-4 mr-1" />
                            {isPassageExpanded ? 'Hide Passage' : 'View Passage'}
                          </div>
                          {isPassageExpanded ? (
                            <ChevronUp className="h-4 w-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        
                        {isPassageExpanded && (
                          <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                            {renderText(question.passage)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    {renderText(question.questionText)}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {question.answerDistribution.map(option => (
                      <div key={option.optionId} className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                          option.optionId === question.correctAnswer 
                            ? 'bg-green-100 text-green-800 border border-green-300' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {option.optionId.toUpperCase()}
                        </div>
                        <div className="flex-1 flex items-center">
                          <div className="text-sm mr-3 w-[60%]">
                            {renderText(option.optionText)}
                          </div>
                          <div className="relative h-6 bg-gray-100 rounded-full flex-1">
                            <div 
                              className={`absolute h-full rounded-full ${
                                option.optionId === question.correctAnswer ? 'bg-green-300' : 'bg-blue-300'
                              }`}
                              style={{ width: `${option.percentage * 100}%` }}
                            ></div>
                          </div>
                          <div className="ml-2 text-sm font-medium w-12 text-right">
                            {Math.round(option.percentage * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </GridItem>
        </Grid>
      </div>
    )
  }
  
  const renderStudentsTab = () => {
    if (!analytics) return <div className="py-10 text-center">No data available</div>
    
    const sortedStudents = getSortedStudents()
    
    return (
      <div className="space-y-6">
        <Grid>
          <GridItem className="py-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Student Results</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToCSV(analytics.studentResponses, `${analytics.testTitle.replace(/\s+/g, '-')}-students.csv`)}
              >
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        <span>Student</span>
                        {sortOrder === 'name' && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('score')}
                    >
                      <div className="flex items-center">
                        <span>Score</span>
                        {sortOrder === 'score' && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center">
                        <span>Completed</span>
                        {sortOrder === 'date' && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Spent
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedStudents.map(student => (
                    <tr key={student.studentId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserCircle className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          (student.score / student.totalPossible) > 0.7 ? 'text-green-700' :
                          (student.score / student.totalPossible) > 0.5 ? 'text-amber-700' :
                          'text-red-700'
                        }`}>
                          {student.score}/{student.totalPossible} ({Math.round((student.score / student.totalPossible) * 100)}%)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(student.completedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(student.timeSpent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" onClick={() => handleViewResponse(student)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GridItem>
        </Grid>
      </div>
    )
  }
  
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || !data.length) return;
    
    const headers = ['Student Name', 'Score', 'Percentage', 'Completed Date', 'Time Spent (min:sec)'];
    
    const rows = data.map(student => [
      student.studentName,
      `${student.score}/${student.totalPossible}`,
      `${Math.round((student.score / student.totalPossible) * 100)}%`,
      new Date(student.completedAt).toLocaleDateString(),
      formatTime(student.timeSpent)
    ]);
    
    let csvContent = headers.join(',') + '\n';
    csvContent += rows.map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTestReport = (analytics: any) => {
    if (!analytics) return;
    
    let reportContent = `
      <html>
      <head>
        <title>${analytics.testTitle} - Test Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #2563eb; }
          h2 { color: #4b5563; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; }
          .summary { display: flex; justify-content: space-between; flex-wrap: wrap; }
          .stat-box { background: #f9fafb; border-radius: 8px; padding: 15px; margin: 10px 0; width: 23%; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .stat-label { font-size: 14px; color: #6b7280; }
          .stat-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background-color: #f9fafb; }
          .question { margin-bottom: 25px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
          .q-text { font-weight: bold; margin-bottom: 10px; }
          .option { display: flex; align-items: center; margin: 8px 0; }
          .option-letter { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; 
                          border-radius: 50%; background: #f3f4f6; margin-right: 10px; font-weight: bold; }
          .correct { background: #dcfce7; color: #166534; }
          .bar-container { height: 20px; background: #f3f4f6; border-radius: 10px; width: 200px; margin: 0 10px; }
          .bar { height: 100%; border-radius: 10px; background: #93c5fd; }
          .bar.correct { background: #86efac; }
          .percentage { min-width: 50px; text-align: right; font-weight: 500; }
        </style>
      </head>
      <body>
        <h1>${analytics.testTitle} - Test Report</h1>
        
        <h2>Summary</h2>
        <div class="summary">
          <div class="stat-box">
            <div class="stat-label">Students</div>
            <div class="stat-value">${analytics.totalStudents}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Average Score</div>
            <div class="stat-value">${Math.round(analytics.averageScore * 100)}%</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Average Time</div>
            <div class="stat-value">${formatTime(analytics.averageTimeSpent)}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Highest Score</div>
            <div class="stat-value">${Math.round(analytics.highestScore * 100)}%</div>
          </div>
        </div>
        
        <h2>Question Analysis</h2>
    `;
    
    analytics.questionAnalytics.forEach((question: any, index: number) => {
      reportContent += `
        <div class="question">
          <div class="q-text">Question ${index + 1}: ${question.questionText}</div>
          <div>Correct answer: ${question.correctAnswer.toUpperCase()} (${Math.round(question.correctPercentage * 100)}% correct)</div>
          <div>
            ${question.answerDistribution.map((option: any) => `
              <div class="option">
                <div class="option-letter ${option.optionId === question.correctAnswer ? 'correct' : ''}">${option.optionId.toUpperCase()}</div>
                <div>${option.optionText}</div>
                <div class="bar-container">
                  <div class="bar ${option.optionId === question.correctAnswer ? 'correct' : ''}" style="width: ${option.percentage * 100}%;"></div>
                </div>
                <div class="percentage">${Math.round(option.percentage * 100)}%</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });
    
    reportContent += `
        <h2>Student Results</h2>
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Date Completed</th>
              <th>Time Spent</th>
            </tr>
          </thead>
          <tbody>
            ${analytics.studentResponses.map((student: any) => `
              <tr>
                <td>${student.studentName}</td>
                <td>${student.score}/${student.totalPossible}</td>
                <td>${Math.round((student.score / student.totalPossible) * 100)}%</td>
                <td>${new Date(student.completedAt).toLocaleDateString()}</td>
                <td>${formatTime(student.timeSpent)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    const blob = new Blob([reportContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${analytics.testTitle.replace(/\s+/g, '-')}-report.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="min-h-screen bg-white flex flex-col pt-20">
      <div className="w-full h-[0.25vh] flex">
        {Array(50).fill(0).map((_, i) => (
          <div key={i} className="h-full grow flex items-center">
            <div className={`h-full grow ${
              i % 4 === 0 ? 'bg-[#009CDE]' : 
              i % 4 === 1 ? 'bg-[#FEDB00]' : 
              i % 4 === 2 ? 'bg-[#3c3c3c]' : 
              'bg-[#3350C4]'
            }`}></div>
            <div className="w-1 h-full bg-transparent"></div>
          </div>
        ))}
      </div>
      
      <div className="bg-white border-b border-gray-200 py-1 sm:py-2">
        <div className="container mx-auto px-3 md:px-6">
          <div className="grid grid-cols-2 items-center h-auto sm:h-14 md:h-16">
            <div className="col-span-1">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-sm md:text-lg text-gray-900 font-semibold line-clamp-1">
                  Test Analytics
                </h1>
              </div>
            </div>
            <div className="col-span-1 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="mr-2"
                onClick={() => exportTestReport(analytics)}
              >
                <Download className="h-4 w-4 mr-1" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-3 md:px-6 py-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b">
                <div className="container mx-auto">
                  <TabsList className="bg-transparent h-auto p-0">
                    <TabsTrigger 
                      value="overview" 
                      className={`px-4 py-2 rounded-none text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-800 data-[state=active]:text-blue-800`}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="questions" 
                      className={`px-4 py-2 rounded-none text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-800 data-[state=active]:text-blue-800`}
                    >
                      <ClipboardCheck className="h-4 w-4 mr-2" />
                      Questions
                    </TabsTrigger>
                    <TabsTrigger 
                      value="students" 
                      className={`px-4 py-2 rounded-none text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-800 data-[state=active]:text-blue-800`}
                    >
                      <UserCircle className="h-4 w-4 mr-2" />
                      Students
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              
              <TabsContent value="overview" className="pt-6">
                {renderOverviewTab()}
              </TabsContent>
              
              <TabsContent value="questions" className="pt-6">
                {renderQuestionsTab()}
              </TabsContent>
              
              <TabsContent value="students" className="pt-6">
                {renderStudentsTab()}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedStudent?.studentName}'s Response
            </DialogTitle>
            <DialogDescription>
              Completed on {selectedStudent ? formatDate(selectedStudent.completedAt) : ''} • 
              Score: {selectedStudent ? `${selectedStudent.score}/${selectedStudent.totalPossible} (${Math.round((selectedStudent.score / (selectedStudent.totalPossible || 1)) * 100)}%)` : ''}
            </DialogDescription>
          </DialogHeader>
          
          {renderStudentDialog()}
        </DialogContent>
      </Dialog>
    </div>
  )
} 