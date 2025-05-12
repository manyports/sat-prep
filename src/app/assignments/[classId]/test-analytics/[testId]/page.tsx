"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, BarChart3, UserCircle, ClipboardCheck, Download, Eye, ArrowUpDown, ChevronDown, ChevronUp, BookOpen } from "lucide-react"
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
    
    const scoreDistribution = Array(10).fill(0);
    const totalStudents = analytics.studentResponses.length;
    
    analytics.studentResponses.forEach(student => {
      const scorePercentage = (student.score / student.totalPossible) * 100;
      const bucketIndex = Math.min(Math.floor(scorePercentage / 10), 9);
      scoreDistribution[bucketIndex]++;
    });
    
    return (
      <div>
        <Grid>
          <GridItem className="py-6">
            <h2 className="text-2xl font-bold mb-8">{analytics.testTitle}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Students</div>
                <div className="text-2xl font-medium">{analytics.totalStudents}</div>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Average Score</div>
                <div className="text-2xl font-medium">{Math.round(analytics.averageScore * 100)}%</div>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Highest Score</div>
                <div className="text-2xl font-medium">{Math.round(analytics.highestScore * 100)}%</div>
              </div>
            </div>
          </GridItem>
        </Grid>
        
        <Grid noBorder="top">
          <GridItem className="py-6">
            <h3 className="text-base font-medium mb-4 text-gray-700">Score Distribution</h3>
            <div className="h-64 bg-white rounded-lg p-4 border border-gray-200">
              <div className="relative h-full w-full flex items-end">
                <div className="absolute inset-0">
                  {[0, 25, 50, 75, 100].map((percent) => (
                    <div 
                      key={percent} 
                      className="absolute w-full border-t border-gray-100" 
                      style={{ bottom: `${percent}%` }}
                    />
                  ))}
                </div>
                <div className="relative z-10 w-full flex justify-around items-end" style={{ height: '100%' }}>
                  {scoreDistribution.map((count, i) => {
                    const heightPercentage = totalStudents === 1 && count === 1 
                      ? 80  
                      : count === 0 
                        ? 0 
                        : Math.min(80, Math.max(10, (count / totalStudents) * 100));
                    
                    return (
                      <div key={i} className="h-full flex flex-col justify-end items-center" style={{ width: '8%' }}>
                        {count > 0 && (
                          <div className="text-xs font-medium text-gray-700 mb-1">{count}</div>
                        )}
                        
                        {count > 0 && (
                          <div 
                            className="bg-blue-800 w-full rounded-t"
                            style={{ 
                              height: `${heightPercentage}%`, 
                              minHeight: '8px'
                            }}
                          />
                        )}
                        
                        <div className="text-xs text-gray-500 mt-2">
                          {`${i*10}-${(i+1)*10}%`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </GridItem>
        </Grid>
        
        <Grid noBorder="top">
          <GridItem className="py-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-medium text-gray-700">Challenging Questions</h3>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("questions")} 
                className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-black">
                View All Questions
              </Button>
            </div>
            <div className="space-y-4">
              {analytics.questionAnalytics
                .sort((a, b) => a.correctPercentage - b.correctPercentage)
                .slice(0, 3)
                .map(question => (
                  <div key={question.questionId} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div className="pr-4 flex-1">
                        <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Question:</div>
                        <div className="mb-2">
                          {renderText(question.questionText)}
                        </div>
                      </div>
                      <div className="bg-white text-black text-xl font-medium p-3 rounded border border-gray-200">
                        {Math.round(question.correctPercentage * 100)}%
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-200">
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
      <div className="space-y-8">
        <Grid>
          <GridItem className="py-6">
            <h3 className="text-base font-medium mb-6 text-gray-700">Question Performance</h3>
            {analytics.questionAnalytics.map((question, index) => {
              const isPassageExpanded = expandedPassages[question.questionId] || false;
              
              return (
                <div key={question.questionId} className="border border-gray-200 rounded-lg p-6 mb-6">
                  <div className="flex justify-between mb-4">
                    <div className="font-medium">Question {index + 1}</div>
                    <div className={`px-3 py-1 rounded text-xs font-medium ${
                      question.correctPercentage > 0.7 ? 'bg-gray-100 text-black' :
                      question.correctPercentage > 0.4 ? 'bg-gray-100 text-black' :
                      'bg-gray-100 text-black'
                    }`}>
                      {Math.round(question.correctPercentage * 100)}% Correct
                    </div>
                  </div>
                  
                  {question.passage && (
                    <div className="mb-5">
                      <div 
                        className="bg-white rounded p-4 border border-gray-200 cursor-pointer"
                        onClick={() => togglePassage(question.questionId)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-gray-700 text-sm font-medium">
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
                  
                  <div className="mb-5">
                    {renderText(question.questionText)}
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {question.answerDistribution.map(option => (
                      <div key={option.optionId} className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                          option.optionId === question.correctAnswer 
                            ? 'bg-blue-800 text-white border border-blue-800' 
                            : 'bg-white text-gray-800 border border-gray-200'
                        }`}>
                          {option.optionId.toUpperCase()}
                        </div>
                        <div className="flex-1 flex items-center">
                          <div className="text-sm mr-3 w-[60%]">
                            {renderText(option.optionText)}
                          </div>
                          <div className="relative h-5 bg-gray-100 rounded-full flex-1">
                            <div 
                              className={`absolute h-full rounded-full ${
                                option.optionId === question.correctAnswer ? 'bg-blue-800' : 'bg-gray-400'
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
      <div className="space-y-8">
        <Grid>
          <GridItem className="py-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-medium text-gray-700">Student Results</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportToCSV(analytics.studentResponses, `${analytics.testTitle.replace(/\s+/g, '-')}-students.csv`)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-black"
              >
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </div>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
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
                        <div className="text-sm font-medium text-gray-900">
                          {student.score > 1 && student.score <= 100 
                            ? `${Math.round((student.score/100) * student.totalPossible)}/${student.totalPossible} (${student.score}%)`
                            : `${student.score}/${student.totalPossible} (${Math.round((student.score / student.totalPossible) * 100)}%)`
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(student.completedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewResponse(student)}
                          className="text-gray-700 hover:text-blue-800"
                        >
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
    
    const headers = ['Student Name', 'Score', 'Percentage', 'Completed Date'];
    
    const rows = data.map(student => {
      const scoreValue = student.score > 1 && student.score <= 100 
        ? Math.round((student.score/100) * student.totalPossible)
        : student.score;
      
      const percentage = student.score > 1 && student.score <= 100
        ? student.score 
        : Math.round((student.score / student.totalPossible) * 100);
      
      return [
        student.studentName,
        `${scoreValue}/${student.totalPossible}`,
        `${percentage}%`,
        new Date(student.completedAt).toLocaleDateString()
      ];
    });
    
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
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            margin: 0; 
            padding: 0;
            line-height: 1.6; 
            color: #111827;
            background-color: #f9fafb;
          }
          .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          h1 { 
            font-weight: 600;
            font-size: 24px;
            margin-bottom: 24px;
            color: #111827;
          }
          h2 { 
            font-weight: 500;
            font-size: 18px;
            margin-top: 32px; 
            margin-bottom: 16px;
            color: #374151; 
          }
          .card {
            background: white;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            margin-bottom: 24px;
            overflow: hidden;
          }
          .card-header {
            padding: 16px 24px;
            border-bottom: 1px solid #e5e7eb;
            background-color: #f9fafb;
          }
          .card-body {
            padding: 20px 24px;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
          }
          .stat-box { 
            background: white; 
            border: 1px solid #e5e7eb;
            border-radius: 8px; 
            padding: 16px; 
          }
          .stat-label { 
            font-size: 12px; 
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280; 
          }
          .stat-value { 
            font-size: 24px; 
            font-weight: 500; 
            margin-top: 4px; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
          }
          th, td { 
            padding: 12px 16px; 
            text-align: left; 
            border-bottom: 1px solid #e5e7eb; 
          }
          th { 
            font-weight: 500;
            color: #6b7280; 
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          tbody tr:hover {
            background-color: #f9fafb;
          }
          .question { 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            padding: 20px; 
            margin-bottom: 16px; 
            background: white;
          }
          .q-text { 
            font-weight: 500; 
            margin-bottom: 16px; 
          }
          .q-meta {
            font-size: 14px;
            color: #6b7280;
            padding-top: 12px;
            margin-top: 12px;
            border-top: 1px solid #e5e7eb;
          }
          .option { 
            display: flex; 
            align-items: center; 
            margin: 12px 0; 
          }
          .option-letter { 
            width: 28px; 
            height: 28px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            border-radius: 50%; 
            margin-right: 12px; 
            font-weight: 500;
            font-size: 14px;
          }
          .option-text {
            flex: 1;
            font-size: 14px;
          }
          .correct { 
            background: #1e40af; 
            color: white;
            border: 1px solid #1e40af;
          }
          .normal {
            background: white;
            border: 1px solid #d1d5db;
            color: #374151;
          }
          .bar-container { 
            height: 8px; 
            background: #f3f4f6; 
            border-radius: 4px; 
            width: 100px; 
            margin: 0 12px; 
          }
          .bar { 
            height: 100%; 
            border-radius: 4px; 
            background: #94a3b8; 
          }
          .bar.correct { 
            background: #1e40af; 
          }
          .percentage { 
            min-width: 40px; 
            text-align: right; 
            font-weight: 500;
            font-size: 14px;
          }
          .color-strip {
            height: 4px;
            background: linear-gradient(90deg, #009CDE 25%, #FEDB00 25%, #FEDB00 50%, #3c3c3c 50%, #3c3c3c 75%, #3350C4 75%);
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div class="color-strip"></div>
        <div class="container">
          <h1>${analytics.testTitle} - Test Report</h1>
          
          <div class="card">
            <div class="card-header">
              <h2 style="margin:0">Summary</h2>
            </div>
            <div class="card-body">
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
                  <div class="stat-label">Highest Score</div>
                  <div class="stat-value">${Math.round(analytics.highestScore * 100)}%</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <h2 style="margin:0">Question Analysis</h2>
            </div>
            <div class="card-body">
    `;
    
    analytics.questionAnalytics.forEach((question: any, index: number) => {
      reportContent += `
        <div class="question">
          <div class="q-text">Question ${index + 1}: ${question.questionText}</div>
          <div>
            ${question.answerDistribution.map((option: any) => `
              <div class="option">
                <div class="option-letter ${option.optionId === question.correctAnswer ? 'correct' : 'normal'}">${option.optionId.toUpperCase()}</div>
                <div class="option-text">${option.optionText}</div>
                <div class="bar-container">
                  <div class="bar ${option.optionId === question.correctAnswer ? 'correct' : ''}" style="width: ${option.percentage * 100}%;"></div>
                </div>
                <div class="percentage">${Math.round(option.percentage * 100)}%</div>
              </div>
            `).join('')}
          </div>
          <div class="q-meta">
            Correct answer: ${question.correctAnswer.toUpperCase()} (${Math.round(question.correctPercentage * 100)}% of students answered correctly)
          </div>
        </div>
      `;
    });
    
    reportContent += `
            </div>
          </div>
        
          <div class="card">
            <div class="card-header">
              <h2 style="margin:0">Student Results</h2>
            </div>
            <div class="card-body">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Date Completed</th>
                  </tr>
                </thead>
                <tbody>
                  ${analytics.studentResponses.map((student: any) => {
                    const scoreValue = student.score > 1 && student.score <= 100 
                      ? Math.round((student.score/100) * student.totalPossible)
                      : student.score;
                    
                    const percentage = student.score > 1 && student.score <= 100
                      ? student.score 
                      : Math.round((student.score / student.totalPossible) * 100);
                    
                    return `
                      <tr>
                        <td>${student.studentName}</td>
                        <td>${scoreValue}/${student.totalPossible}</td>
                        <td>${percentage}%</td>
                        <td>${new Date(student.completedAt).toLocaleDateString()}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
    <div className="min-h-screen bg-white flex flex-col mt-20">
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-auto">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.back()}
                className="text-gray-700 hover:text-blue-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl text-gray-900 font-medium">
                Test Analytics
              </h1>
            </div>
            <div className="flex">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportTestReport(analytics)}
                className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-800"></div>
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-gray-200">
                <div className="container mx-auto">
                  <TabsList className="bg-transparent h-auto p-0">
                    <TabsTrigger 
                      value="overview" 
                      className="px-4 py-2 rounded-none text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-800 data-[state=active]:text-blue-800 transition-colors"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="questions" 
                      className="px-4 py-2 rounded-none text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-800 data-[state=active]:text-blue-800 transition-colors"
                    >
                      <ClipboardCheck className="h-4 w-4 mr-2" />
                      Questions
                    </TabsTrigger>
                    <TabsTrigger 
                      value="students" 
                      className="px-4 py-2 rounded-none text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-800 data-[state=active]:text-blue-800 transition-colors"
                    >
                      <UserCircle className="h-4 w-4 mr-2" />
                      Students
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              
              <TabsContent value="overview" className="pt-8">
                {renderOverviewTab()}
              </TabsContent>
              
              <TabsContent value="questions" className="pt-8">
                {renderQuestionsTab()}
              </TabsContent>
              
              <TabsContent value="students" className="pt-8">
                {renderStudentsTab()}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
      
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="sm:max-w-3xl border border-gray-200 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium">
              {selectedStudent?.studentName}'s Response
            </DialogTitle>
            <DialogDescription className="text-gray-500">
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