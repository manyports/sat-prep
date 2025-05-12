"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Grid, GridItem } from "@/components/grid"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, BookmarkIcon, MoreVertical, Pencil, ChevronDown, Clock, CheckCircle2 } from "lucide-react"
import { LatexRenderer } from "@/components/LatexRenderer"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
  passage?: string | null;
  images?: {
    id: string;
    url: string;
    alt?: string;
    fileKey?: string;
  }[];
}

interface Section {
  id: string;
  title: string;
  duration: string;
  questions: Question[];
}

interface TestData {
  id: string;
  title: string;
  duration: string;
  sections: Section[];
}

export interface TestComponentProps {
  testId: string;
  sectionId?: string; 
}

export default function TestComponent({ testId, sectionId }: TestComponentProps) {
  const router = useRouter()
  const [test, setTest] = useState<TestData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({})
  const [markedForReview, setMarkedForReview] = useState<string[]>([])
  const [crossedOutOptions, setCrossedOutOptions] = useState<{[key: string]: string[]}>({})
  const [crossOutModeActive, setCrossOutModeActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [testComplete, setTestComplete] = useState(false)
  const [showDirections, setShowDirections] = useState(true)
  const [userName, setUserName] = useState("Student Name")
  const [showQuestionPreview, setShowQuestionPreview] = useState(false)
  const [showTime, setShowTime] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resultsSaving, setResultsSaving] = useState(false)
  const [resultsSaved, setResultsSaved] = useState(false)
  const [showFinishConfirmation, setShowFinishConfirmation] = useState(false)
  const questionPreviewRef = useRef<HTMLDivElement>(null);
  const isSectionOnly = Boolean(sectionId);

  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        
        const pathParts = window.location.pathname.split('/');
        let classId = '';
        
        if (pathParts.includes('assignments')) {
          const assignmentsIndex = pathParts.indexOf('assignments');
          if (assignmentsIndex >= 0 && assignmentsIndex + 1 < pathParts.length) {
            classId = pathParts[assignmentsIndex + 1];
          }
        } else {
          classId = localStorage.getItem('currentClassId') || '';
        }
        
        if (classId) {
          const response = await fetch(`/api/classes/${classId}/tests/${testId}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch test data from API');
          }
          
          const data = await response.json();
          
          if (data.success && data.test) {
            const testData: TestData = {
              id: data.test._id || data.test.id,
              title: data.test.title || 'Untitled Test',
              duration: data.test.timeLimit ? `${data.test.timeLimit} minutes` : '60 minutes',
              sections: [
                {
                  id: 'section-1',
                  title: 'Main Section',
                  duration: data.test.timeLimit ? `${data.test.timeLimit} minutes` : '60 minutes',
                  questions: data.test.questions?.map((q: any) => ({
                    id: q.id || `q-${Math.random().toString(36).substr(2, 9)}`,
                    text: q.text || 'No question text',
                    options: q.options || [
                      { id: 'a', text: 'Option A' },
                      { id: 'b', text: 'Option B' },
                      { id: 'c', text: 'Option C' },
                      { id: 'd', text: 'Option D' }
                    ],
                    correctAnswer: q.correctAnswer || 'a',
                    passage: q.passage || null,
                    images: q.images || []
                  })) || []
                }
              ]
            };
            
            setTest(testData);
            
            if (data.test.timeLimit) {
              setTimeRemaining(parseInt(data.test.timeLimit) * 60);
            } else {
              setTimeRemaining(60 * 60);
            }
            
            localStorage.setItem('currentClassId', classId);
          } else {
            throw new Error('Invalid test data format');
          }
        } else {
          console.warn('No class ID found, falling back to sample test data');
          const sampleData = await import("../data/sample-test.json").catch(() => 
            import("@/data/sample-test.json")
          );
          setTest(sampleData);
          
          if (sectionId) {
            const sectionIndex = sampleData.sections.findIndex((section: Section) => section.id === sectionId);
            if (sectionIndex !== -1) {
              setCurrentSectionIndex(sectionIndex);
              const minutes = parseInt(sampleData.sections[sectionIndex].duration.split(" ")[0]);
              setTimeRemaining(minutes * 60);
            } else {
              console.error("Section not found");
            }
          } else {
            const minutes = parseInt(sampleData.sections[0].duration.split(" ")[0]);
            setTimeRemaining(minutes * 60);
          }
        }
      } catch (error) {
        console.error("Error loading test data:", error);
        setError("Failed to load test data. Please try again later.");
        
        try {
          const sampleData = await import("../data/sample-test.json").catch(() => 
            import("@/data/sample-test.json")
          );
          setTest(sampleData);
          
          if (sectionId) {
            const sectionIndex = sampleData.sections.findIndex((section: Section) => section.id === sectionId);
            if (sectionIndex !== -1) {
              setCurrentSectionIndex(sectionIndex);
              const minutes = parseInt(sampleData.sections[sectionIndex].duration.split(" ")[0]);
              setTimeRemaining(minutes * 60);
            }
          } else {
            const minutes = parseInt(sampleData.sections[0].duration.split(" ")[0]);
            setTimeRemaining(minutes * 60);
          }
        } catch (fallbackError) {
          console.error("Failed to load fallback data:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchTest();
  }, [testId, sectionId]);

  useEffect(() => {
    if (!timeRemaining || testComplete) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev && prev > 0) {
          return prev - 1
        } else {
          clearInterval(timer)
          return 0
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, testComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answerId
    }))
  }

  const handleMarkForReview = (questionId: string) => {
    setMarkedForReview((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId)
      } else {
        return [...prev, questionId]
      }
    })
  }

  const toggleCrossOutMode = () => {
    setCrossOutModeActive(!crossOutModeActive);
  };

  const handleCrossOut = (questionId: string, optionId: string) => {
    setCrossedOutOptions((prev) => {
      const questionCrossedOut = prev[questionId] || [];
      
      if (questionCrossedOut.includes(optionId)) {
        return {
          ...prev,
          [questionId]: questionCrossedOut.filter(id => id !== optionId)
        };
      } else {
        return {
          ...prev,
          [questionId]: [...questionCrossedOut, optionId]
        };
      }
    });
  };

  const goToNextQuestion = () => {
    const currentSection = test?.sections[currentSectionIndex]
    if (!currentSection) return

    const isLastQuestion = currentQuestionIndex === currentSection.questions.length - 1 && 
      (isSectionOnly || currentSectionIndex === (test?.sections.length || 0) - 1);

    if (isLastQuestion) {
      setShowFinishConfirmation(true);
    } else if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else if (!isSectionOnly && currentSectionIndex < (test?.sections.length || 0) - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
      setCurrentQuestionIndex(0)
      if (test) {
        const minutes = parseInt(test.sections[currentSectionIndex + 1].duration.split(" ")[0])
        setTimeRemaining(minutes * 60)
      }
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (!isSectionOnly && currentSectionIndex > 0 && test) {
      setCurrentSectionIndex(currentSectionIndex - 1)
      const prevSectionQuestions = test.sections[currentSectionIndex - 1].questions
      setCurrentQuestionIndex(prevSectionQuestions.length - 1)
    }
  }

  const toggleDirections = () => {
    setShowDirections(!showDirections)
  }

  const toggleQuestionPreview = () => {
    setShowQuestionPreview(!showQuestionPreview)
  }

  const handleQuestionNavigationClick = (event: React.MouseEvent) => {
    event.stopPropagation() 
    toggleQuestionPreview()
  }

  useEffect(() => {
    if (!showQuestionPreview) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (questionPreviewRef.current && !questionPreviewRef.current.contains(event.target as Node)) {
        setShowQuestionPreview(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQuestionPreview]);

  const toggleTimeDisplay = () => {
    setShowTime(!showTime)
  }

  const renderWithLatex = (text: string | null | undefined) => {
    if (!text) return <span></span>;
    
    if (text.includes('$$') || text.includes('$')) {
      const parts = [];
      let currentIndex = 0;
      
      const regex = /(\$\$|\$)(.*?)(\$\$|\$)/g;
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

  useEffect(() => {
    if (test && !testComplete && !startTime) {
      const now = Date.now();
      setStartTime(now);
    }
  }, [test, testComplete, startTime]);

  const saveTestResults = async () => {
    if (!test) {
      console.error('No test data available when saving results');
      return;
    }
    
    setResultsSaving(true);
    
    try {
      const totalQuestions = test.sections.reduce((sum, section) => sum + section.questions.length, 0);
      const answeredQuestions = Object.keys(userAnswers).length;
      const correctAnswers = test.sections.reduce((sum, section) => {
        return sum + section.questions.filter(q => 
          userAnswers[q.id] && userAnswers[q.id] === q.correctAnswer
        ).length;
      }, 0);
      
      const percentageCorrect = Math.round((correctAnswers / totalQuestions) * 100);
      
      const classId = localStorage.getItem('currentClassId') || '';
      
      if (!classId) {
        console.error('No class ID found when saving results');
        return;
      }
      
      if (!testId) {
        console.error('No test ID available, cannot save results');
        return;
      }
      
      const originalTestId = testId.includes('-') ? testId.split('-')[0] : testId;
      
      const testResults = {
        testId: testId, 
        originalTestId, 
        answers: userAnswers,
        score: percentageCorrect,
        correctCount: correctAnswers,
        totalCount: totalQuestions,
        completedAt: new Date().toISOString()
      };
      
      const response = await fetch(`/api/classes/${classId}/tests/${testId}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testResults),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save test results: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setResultsSaved(true);
      } else {
        throw new Error(data.error || 'Failed to save test results');
      }
    } catch (error) {
      console.error('Error saving test results:', error);
    } finally {
      setResultsSaving(false);
    }
  };

  const confirmFinishTest = () => {
    setShowFinishConfirmation(false);
    saveTestResults();
    setTestComplete(true);
  }

  if (loading) {
    return (
      <div className="bg-white text-black min-h-screen flex flex-col pt-20">
        <div className="w-full h-[0.25vh] flex">
          {Array(20).fill(0).map((_, i) => (
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
            <div className="grid grid-cols-3 items-center h-auto sm:h-14 md:h-16">
              <div className="col-span-1">
                <div className="h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
              </div>
              <div className="col-span-1 flex flex-col items-center justify-center">
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-8 bg-gray-200 rounded-full mt-1 animate-pulse"></div>
              </div>
              <div className="col-span-1 flex justify-end space-x-4 sm:space-x-6">
                <div className="flex flex-col items-center">
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded mt-1 animate-pulse"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-12 bg-gray-200 rounded mt-1 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-3 md:px-6">
            <div className="py-2 md:py-3">
              <div className="flex items-center">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 ml-1 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-grow">
          <div className="container mx-auto px-3 md:px-6 h-full">
            <div className="flex flex-col md:flex-row h-full">
              <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200 py-3 md:py-6 px-3 md:px-6 md:pr-8 overflow-y-auto h-[40vh] md:h-full">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i+5} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-1/2 py-3 md:py-6 px-3 md:px-6 md:pl-8 overflow-y-auto h-[calc(60vh-10rem)] md:h-full">
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 bg-gray-900 rounded animate-pulse"></div>
                  <div className="h-5 w-28 bg-gray-200 rounded ml-3 animate-pulse"></div>
                  <div className="ml-auto h-7 w-7 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-full flex mb-4">
                  {Array(15).fill(0).map((_, i) => (
                    <div key={i} className="h-[2px] grow flex items-center">
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
                <div className="h-24 bg-gray-200 rounded mb-6 animate-pulse"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white border-t border-gray-200 py-3 md:py-4">
          <div className="container mx-auto px-3 md:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 hidden md:block">
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-8 w-32 bg-gray-900 rounded animate-pulse"></div>
              </div>
              <div className="flex-1 flex justify-end space-x-2">
                <div className="h-8 w-20 bg-blue-800 rounded-full animate-pulse"></div>
                <div className="h-8 w-16 bg-blue-800 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white text-black min-h-screen flex flex-col items-center justify-center pt-20">
        <div className="w-full h-[0.25vh] flex">
          {Array(20).fill(0).map((_, i) => (
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
        
        <div className="max-w-md mx-auto px-4 py-10 text-center">
          <div className="text-red-500 mb-4 text-xl">Error Loading Test</div>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="bg-white text-black min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg text-gray-800 mb-4">Test not found</p>
        <Link href="/practice-tests">
          <Button variant="outline">Back to Practice Tests</Button>
        </Link>
      </div>
    )
  }

  if (testComplete) {
    const totalQuestions = test.sections.reduce((sum, section) => sum + section.questions.length, 0);
    const answeredQuestions = Object.keys(userAnswers).length;
    const correctAnswers = test.sections.reduce((sum, section) => {
      return sum + section.questions.filter(q => 
        userAnswers[q.id] && userAnswers[q.id] === q.correctAnswer
      ).length;
    }, 0);
    
    const percentageCorrect = Math.round((correctAnswers / totalQuestions) * 100);
    const estimatedPoints = Math.round((correctAnswers / totalQuestions) * 100);
    
    const classId = localStorage.getItem('currentClassId') || '';
    
    return (
      <div className="bg-white text-black min-h-screen">
        <div className="w-full h-[0.25vh] flex">
          {Array(20).fill(0).map((_, i) => (
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
        
        <div className="container mx-auto px-4">
          <Grid noBorder="bottom">
            <GridItem className="py-6">
              <Link 
                href={classId ? `/assignments/${classId}` : "/practice-tests"}
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {classId ? 'Back to Class' : 'Back to Practice Tests'}
              </Link>
            </GridItem>
          </Grid>
          
          <Grid className="mb-0 pb-0 mt-[1.2rem]
          
          ">
            <GridItem className="text-center py-10">

              <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
                {isSectionOnly ? "Section Complete" : "Test Complete"}
              </h1>
              <p className="text-gray-600 mb-4">
                {isSectionOnly 
                  ? `You've completed the ${test.sections[currentSectionIndex].title} section of ${test.title}.`
                  : `You've completed ${test.title}. Here are your results.`
                }
              </p>
            
              {resultsSaving ? (
                <div className="inline-flex items-center px-3 py-1 mb-6 bg-blue-50 text-blue-800 rounded-full text-sm">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving your results...
                </div>
              ) : resultsSaved ? (
                <div className="inline-flex items-center px-3 py-1 mb-6 bg-green-50 text-green-800 rounded-full text-sm">
                  <svg className="h-4 w-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Results saved successfully
                </div>
              ) : (
                <div className="inline-flex items-center px-3 py-1 mb-6 bg-yellow-50 text-yellow-800 rounded-full text-sm">
                  <svg className="h-4 w-4 mr-1 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  Results not saved
                </div>
              )}
            </GridItem>
          </Grid>
          
          <Grid hideDecorators noBorder="top" className="mb-0 pb-0">
            <GridItem className="py-0">
              <div className="max-w-full mx-auto">
                <Grid columns={4} className="bg-gradient-to-r from-blue-50 to-white my-16">
                  <GridItem className="px-6 py-8 border-r border-gray-100">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Score</p>
                    <p className="text-4xl font-bold text-blue-900 mt-2">{percentageCorrect}%</p>
                  </GridItem>
                  <GridItem className="px-6 py-8 border-r border-gray-100">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Points</p>
                    <p className="text-4xl font-bold text-blue-900 mt-2">{estimatedPoints}</p>
                  </GridItem>
                  <GridItem className="px-6 py-8 border-r border-gray-100">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Correct</p>
                    <p className="text-4xl font-bold text-blue-900 mt-2">{correctAnswers}/{totalQuestions}</p>
                  </GridItem>
                  <GridItem className="px-6 py-8">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Completed</p>
                    <p className="text-4xl font-bold text-blue-900 mt-2">{answeredQuestions}/{totalQuestions}</p>
                  </GridItem>
                </Grid>
              </div>
            </GridItem>
          </Grid>
          
          <Grid connectTo="top">
            <GridItem className="flex justify-center py-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={classId ? `/assignments/${classId}` : (isSectionOnly ? `/test/${testId}` : "/practice-tests")}>
                  <Button variant="outline" className="min-w-[150px]">
                    {classId ? 'Return to Class' : (isSectionOnly ? "Back to Test" : "All Practice Tests")}
                  </Button>
                </Link>
                <Button 
                  className="bg-blue-800 hover:bg-blue-900 text-white min-w-[150px]"
                  onClick={() => router.push(`/test/${testId}/results`)}
                >
                  View Detailed Results
                </Button>
              </div>
            </GridItem>
          </Grid>
        </div>
      </div>
    )
  }

  const currentSection = test.sections[currentSectionIndex]
  const currentQuestion = currentSection?.questions[currentQuestionIndex]
  
  if (!currentSection || !currentQuestion) {
    return (
      <div className="bg-white text-black min-h-screen flex items-center justify-center">
        <p>Error loading test content. Please try again.</p>
      </div>
    )
  }

  const hasPassage = Boolean(currentQuestion.passage);

  return (
    <div className="bg-white text-black min-h-screen flex flex-col pt-20">
      <div className="w-full h-[0.25vh] flex">
        {Array(window.innerWidth < 768 ? 20 : 50).fill(0).map((_, i) => (
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
          <div className="grid grid-cols-3 items-center h-auto sm:h-14 md:h-16">
            <div className="col-span-1">
              <h1 className="text-sm md:text-lg text-gray-900 font-semibold line-clamp-1">
                Section {currentSectionIndex + 1}, Module 1: {currentSection.title}
              </h1>
            </div>
            <div className="col-span-1 flex flex-col items-center justify-center">
              {showTime ? (
                <span className="text-xl md:text-2xl text-gray-900 font-semibold">
                  {timeRemaining !== null ? formatTime(timeRemaining) : '0:00'}
                </span>
              ) : (
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
              )}
              <Button 
                onClick={toggleTimeDisplay}
                variant="ghost" 
                className="text-xs px-2 h-5 border border-gray-300 rounded-full mt-0.5"
              >
                {showTime ? 'Hide' : 'Show'}
              </Button>
            </div>
            <div className="col-span-1 flex justify-end space-x-4 sm:space-x-6">
              <button className="flex flex-col items-center">
                <Pencil className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                <span className="text-[10px] text-gray-600">Annotate</span>
              </button>
              
              <button className="flex flex-col items-center">
                <MoreVertical className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                <span className="text-[10px] text-gray-600">More</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-3 md:px-6">
          <div className="py-2 md:py-3">
            <div className="flex items-center">
              <span className="text-xs md:text-sm text-gray-600">Directions</span>
              <ChevronLeft className="h-3 w-3 md:h-4 md:w-4 text-gray-500 inline ml-1 transform rotate-180" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex-grow">
        <div className="container mx-auto px-3 md:px-6 h-full">
          {hasPassage ? (
            <div className="flex flex-col md:flex-row h-full">
              <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200 py-3 md:py-6 px-3 md:px-6 md:pr-8 overflow-y-auto h-[40vh] md:h-full">
                <div className="font-noto-serif text-[11pt] md:text-[12pt] leading-relaxed text-black">
                  {renderWithLatex(currentQuestion.passage)}
                </div>
              </div>
              <div className="w-full md:w-1/2 py-3 md:py-6 px-3 md:px-6 md:pl-8 overflow-y-auto h-[calc(60vh-10rem)] md:h-full">
                <div className="flex items-center mb-[0.1vh]">
                  <div className="flex items-center justify-center">
                    <div className="bg-black text-white w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-bold text-sm md:text-base">
                      {currentQuestionIndex + 1}
                    </div>
                  </div>
                  <button 
                    className="flex items-center ml-2 md:ml-4 text-gray-600"
                    onClick={() => handleMarkForReview(currentQuestion.id)}
                  >
                    <BookmarkIcon className={`h-5 w-5 md:h-6 md:w-6 mr-1 md:mr-2 ${markedForReview.includes(currentQuestion.id) ? 'fill-red-600 text-red-600' : ''}`} />
                    <span className="text-xs md:text-sm">Mark for Review</span>
                  </button>
                  <div className="flex-1 flex justify-end">
                    <button 
                      className={`relative flex items-center justify-center rounded-md w-7 h-7 md:w-9 md:h-9 border border-gray-200 ${
                        crossOutModeActive ? 'bg-blue-800 border border-black text-white' : 'bg-white text-gray-800'
                      }`}
                      onClick={toggleCrossOutMode}
                      aria-label="Toggle cross out mode"
                    >
                      <span className="font-semibold text-[10px] md:text-xs">ABC</span>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg className="w-[85%] h-[85%]" viewBox="0 0 36 36">
                          <line 
                            x1="0" 
                            y1="36" 
                            x2="36" 
                            y2="0" 
                            stroke={crossOutModeActive ? "white" : "black"}
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="w-full flex mb-4">
                  {Array(window.innerWidth < 768 ? 15 : 25).fill(0).map((_, i) => (
                    <div key={i} className="h-[2px] grow flex items-center">
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
                <div className="mb-6 md:mb-8">
                  {currentQuestion.images && currentQuestion.images.length > 0 && (
                    <div className="mb-6">
                      {currentQuestion.images.map(image => (
                        <img 
                          key={image.id}
                          src={image.url} 
                          alt={image.alt || 'Question image'} 
                          className="max-w-full h-auto rounded-md mb-4"
                        />
                      ))}
                    </div>
                  )}
                  <h2 className="font-noto-serif text-[11pt] md:text-[12pt] mb-4 md:mb-6 text-black leading-relaxed">
                    {renderWithLatex(currentQuestion.text)}
                  </h2>
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => {
                      const isOptionCrossedOut = crossedOutOptions[currentQuestion.id]?.includes(option.id);
                      const letter = String.fromCharCode(65 + index);
                      
                      return (
                        <div key={option.id} className="flex items-center">
                          <div 
                            className={`flex items-center border rounded-lg py-2 md:py-3 px-3 md:px-4 cursor-pointer ${
                              userAnswers[currentQuestion.id] === option.id 
                                ? 'border-[#3350C4] border-[0.25rem] bg-blue-50' 
                                : 'border-gray-300'
                            } ${crossOutModeActive ? 'w-[90%]' : 'w-full'}`}
                            onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                          >
                            <div 
                              className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center mr-2 md:mr-3 ${
                                userAnswers[currentQuestion.id] === option.id 
                                  ? 'bg-[#3350C4] text-white' 
                                  : 'bg-white border border-gray-400'
                              }`}
                            >
                              <span className="font-bold text-xs md:text-sm">
                                {letter}
                              </span>
                            </div>
                            <span 
                              className={`font-noto-serif text-[11pt] md:text-[12pt] text-black flex-1 ${
                                isOptionCrossedOut ? 'line-through text-gray-500' : ''
                              }`}
                            >
                              {renderWithLatex(option.text)}
                            </span>
                          </div>
                          {crossOutModeActive && (
                            <div className="w-[10%] flex justify-center">
                              <button 
                                className="w-6 h-6 md:w-7 md:h-7 rounded-full border border-gray-400 flex items-center justify-center"
                                onClick={() => handleCrossOut(currentQuestion.id, option.id)}
                              >
                                <span className={`font-bold text-xs md:text-sm ${isOptionCrossedOut ? 'line-through' : ''}`}>
                                  {letter}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="w-full max-w-2xl mx-auto py-3 md:py-6 px-3 md:px-6 overflow-y-auto h-[calc(100vh-15rem)]">
                <div className="flex items-center mb-[0.1vh]">
                  <div className="flex items-center justify-center">
                    <div className="bg-black text-white w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-bold text-sm md:text-base">
                      {currentQuestionIndex + 1}
                    </div>
                  </div>
                  <button 
                    className="flex items-center ml-2 md:ml-4 text-gray-600"
                    onClick={() => handleMarkForReview(currentQuestion.id)}
                  >
                    <BookmarkIcon className={`h-5 w-5 md:h-6 md:w-6 mr-1 md:mr-2 ${markedForReview.includes(currentQuestion.id) ? 'fill-red-600 text-red-600' : ''}`} />
                    <span className="text-xs md:text-sm">Mark for Review</span>
                  </button>
                  <div className="flex-1 flex justify-end">
                    <button 
                      className={`relative flex items-center justify-center rounded-md w-7 h-7 md:w-9 md:h-9 border border-gray-200 ${
                        crossOutModeActive ? 'bg-blue-800 border border-black text-white' : 'bg-white text-gray-800'
                      }`}
                      onClick={toggleCrossOutMode}
                      aria-label="Toggle cross out mode"
                    >
                      <span className="font-semibold text-[10px] md:text-xs">ABC</span>
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg className="w-[85%] h-[85%]" viewBox="0 0 36 36">
                          <line 
                            x1="0" 
                            y1="36" 
                            x2="36" 
                            y2="0" 
                            stroke={crossOutModeActive ? "white" : "black"}
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
                <div className="w-full flex mb-4">
                  {Array(window.innerWidth < 768 ? 15 : 25).fill(0).map((_, i) => (
                    <div key={i} className="h-[2px] grow flex items-center">
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
                {currentQuestion.images && currentQuestion.images.length > 0 && (
                  <div className="mb-6">
                    {currentQuestion.images.map(image => (
                      <img 
                        key={image.id}
                        src={image.url} 
                        alt={image.alt || 'Question image'} 
                        className="max-w-full h-auto rounded-md mb-4"
                      />
                    ))}
                  </div>
                )}
                <div className="mb-6 md:mb-8">
                  <h2 className="font-noto-serif text-[11pt] md:text-[12pt] mb-4 md:mb-6 text-black leading-relaxed">
                    {renderWithLatex(currentQuestion.text)}
                  </h2>
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => {
                      const isOptionCrossedOut = crossedOutOptions[currentQuestion.id]?.includes(option.id);
                      const letter = String.fromCharCode(65 + index);
                      
                      return (
                        <div key={option.id} className="flex items-center">
                          <div 
                            className={`flex items-center border rounded-lg py-2 md:py-3 px-3 md:px-4 cursor-pointer ${
                              userAnswers[currentQuestion.id] === option.id 
                                ? 'border-[#3350C4] border-[0.25rem] bg-blue-50' 
                                : 'border-gray-300'
                            } ${crossOutModeActive ? 'w-[90%]' : 'w-full'}`}
                            onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                          >
                            <div 
                              className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center mr-2 md:mr-3 ${
                                userAnswers[currentQuestion.id] === option.id 
                                  ? 'bg-[#3350C4] text-white' 
                                  : 'bg-white border border-gray-400'
                              }`}
                            >
                              <span className="font-bold text-xs md:text-sm">
                                {letter}
                              </span>
                            </div>
                            <span 
                              className={`font-noto-serif text-[11pt] md:text-[12pt] text-black flex-1 ${
                                isOptionCrossedOut ? 'line-through text-gray-500' : ''
                              }`}
                            >
                              {renderWithLatex(option.text)}
                            </span>
                          </div>
                          {crossOutModeActive && (
                            <div className="w-[10%] flex justify-center">
                              <button 
                                className="w-6 h-6 md:w-7 md:h-7 rounded-full border border-gray-400 flex items-center justify-center"
                                onClick={() => handleCrossOut(currentQuestion.id, option.id)}
                              >
                                <span className={`font-bold text-xs md:text-sm ${isOptionCrossedOut ? 'line-through' : ''}`}>
                                  {letter}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white border-t border-gray-200 py-3 md:py-4 relative">
        <div className="container mx-auto px-3 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 hidden md:block">
              <span className="text-sm text-gray-700">{userName}</span>
            </div>
            <div className="flex-1 flex justify-center relative">
              <button 
                className="flex items-center bg-black text-white font-medium px-3 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm"
                onClick={handleQuestionNavigationClick}
              >
                <span>Question {currentQuestionIndex + 1} of {currentSection.questions.length}</span>
                <ChevronDown className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
              </button>
              {showQuestionPreview && (
                <div 
                  ref={questionPreviewRef}
                  className="fixed sm:absolute bottom-16 sm:bottom-full left-1/2 sm:left-auto -translate-x-1/2 sm:translate-x-0 sm:mb-2 bg-white shadow-lg border border-gray-200 rounded-lg p-3 md:p-4 z-50 w-[90vw] max-w-[320px] sm:max-w-[320px] md:w-auto md:min-w-[340px]"
                >
                  <div className="mb-2 pb-2 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-medium text-gray-900 text-sm md:text-base">Question Navigation</h3>
                    <span className="text-xs text-gray-500">{userAnswers && Object.keys(userAnswers).length}/{currentSection.questions.length} answered</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 md:gap-2 max-h-[40vh] sm:max-h-[180px] overflow-y-auto p-0.5">
                    {currentSection.questions.map((question, index) => (
                      <button
                        key={question.id}
                        onClick={() => {
                          setCurrentQuestionIndex(index)
                          setShowQuestionPreview(false)
                        }}
                        className={`w-[48px] h-[48px] sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-md text-xs md:text-sm font-medium border relative
                          ${index === currentQuestionIndex ? 'border-blue-800 border-2' : 'border-gray-200'}
                          ${userAnswers[question.id] ? 'bg-[#3350C4] text-white' : ''}
                          ${markedForReview.includes(question.id) ? 'ring-1 ring-red-400' : ''}
                          hover:bg-gray-50 transition-colors
                        `}
                      >
                        {markedForReview.includes(question.id) && (
                          <div className="absolute -top-1 -right-1">
                            <BookmarkIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 fill-red-600 text-red-600" />
                          </div>
                        )}
                        <span>{index + 1}</span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-end sm:hidden">
                    <button 
                      onClick={() => setShowQuestionPreview(false)}
                      className="text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 flex justify-end space-x-2 md:space-x-3">
              {currentQuestionIndex > 0 || currentSectionIndex > 0 ? (
                <Button
                  onClick={goToPreviousQuestion}
                  className="bg-blue-800 hover:bg-blue-900 text-white rounded-full px-5 py-5 text-xs md:text-sm md:px-6 md:py-6"
                >
                  Previous
                </Button>
              ) : null}
              <Button
                onClick={goToNextQuestion}
                className="bg-blue-800 hover:bg-blue-900 text-white rounded-full px-5 py-5 text-xs md:text-sm md:px-6 md:py-6"
              >
                {currentQuestionIndex === currentSection.questions.length - 1 && 
                 (isSectionOnly || currentSectionIndex === (test?.sections.length || 0) - 1) 
                  ? "Finish Test" 
                  : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={showFinishConfirmation} onOpenChange={setShowFinishConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Finish Test</DialogTitle>
            <DialogDescription>
              Are you sure you want to finish the test? You won't be able to change your answers after submission.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 my-4 flex items-start">
            <div className="mr-3 mt-0.5">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium mb-1">Test Summary</p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>Answered questions: {Object.keys(userAnswers).length} of {test?.sections.reduce((sum, section) => sum + section.questions.length, 0)}</li>
                <li>Marked for review: {markedForReview.length}</li>
                <li>Time remaining: {timeRemaining ? formatTime(timeRemaining) : '0:00'}</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="flex space-x-3 sm:space-x-0 gap-2">
            <Button variant="outline" onClick={() => setShowFinishConfirmation(false)}>
              Go Back
            </Button>
            <Button className="bg-blue-800 hover:bg-blue-700" onClick={confirmFinishTest}>
              Submit Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 