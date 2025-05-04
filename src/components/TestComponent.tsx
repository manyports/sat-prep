"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Grid, GridItem } from "@/components/grid"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronLeft, BookmarkIcon, MoreVertical, Pencil, CheckCircle, Circle, ChevronDown, Clock, BookOpen, Type } from "lucide-react"

interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  correctAnswer: string;
  passage?: string | null;
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
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [markedForReview, setMarkedForReview] = useState<string[]>([])
  const [crossedOutOptions, setCrossedOutOptions] = useState<Record<string, string[]>>({})
  const [crossOutModeActive, setCrossOutModeActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [testComplete, setTestComplete] = useState(false)
  const [showDirections, setShowDirections] = useState(true)
  const [userName, setUserName] = useState("Student Name")
  const [showQuestionPreview, setShowQuestionPreview] = useState(false)
  const [showTime, setShowTime] = useState(true)
  const questionPreviewRef = useRef<HTMLDivElement>(null);
  const isSectionOnly = Boolean(sectionId);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const testData = await import("../data/sample-test.json").catch(() => 
          import("@/data/sample-test.json")
        )
        setTest(testData)
        
        if (sectionId) {
          const sectionIndex = testData.sections.findIndex(section => section.id === sectionId)
          if (sectionIndex !== -1) {
            setCurrentSectionIndex(sectionIndex)
            const minutes = parseInt(testData.sections[sectionIndex].duration.split(" ")[0])
            setTimeRemaining(minutes * 60)
          } else {
            console.error("Section not found")
          }
        } else {
          const minutes = parseInt(testData.sections[0].duration.split(" ")[0])
          setTimeRemaining(minutes * 60)
        }
      } catch (error) {
        console.error("Error loading test data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTest()
  }, [sectionId])

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

    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else if (!isSectionOnly && currentSectionIndex < (test?.sections.length || 0) - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
      setCurrentQuestionIndex(0)
      if (test) {
        const minutes = parseInt(test.sections[currentSectionIndex + 1].duration.split(" ")[0])
        setTimeRemaining(minutes * 60)
      }
    } else {
      setTestComplete(true)
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
    return (
      <div className="bg-white text-black min-h-screen">
        <div className="container mx-auto px-4">
          <Grid noBorder="bottom">
            <GridItem className="py-6">
              <Link 
                href="/practice-tests" 
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Practice Tests
              </Link>
            </GridItem>
          </Grid>
          <Grid noBorder="top">
            <GridItem className="py-10 md:py-16">
              <div className="max-w-2xl mx-auto text-center">
                <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
                  {isSectionOnly ? "Section Complete" : "Test Complete"}
                </h1>
                <p className="text-gray-600 mb-8">
                  {isSectionOnly 
                    ? `You've completed the ${test.sections[currentSectionIndex].title} section of ${test.title}.`
                    : `You've completed ${test.title}. Your results are being processed.`
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href={isSectionOnly ? `/test/${testId}` : "/practice-tests"}>
                    <Button variant="outline" className="border-gray-200">
                      {isSectionOnly ? "Back to Test Selection" : "Back to Practice Tests"}
                    </Button>
                  </Link>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    View Results
                  </Button>
                </div>
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
          <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200 py-3 md:py-6 px-3 md:px-6 md:pr-8 overflow-y-auto h-[40vh] md:h-full">
              {currentQuestion.passage ? (
                <div className="font-noto-serif text-[11pt] md:text-[12pt] leading-relaxed text-black">
                  <p className="whitespace-pre-line mb-4">{currentQuestion.passage}</p>
                </div>
              ) : (
                <div className="font-noto-serif text-[11pt] md:text-[12pt] leading-relaxed text-black">
                  <p className="whitespace-pre-line mb-4">In recommending Rao Phi's collection Sing I Sing, a librarian noted that pieces by the spoken-word poet don't lose their _____ nature when printed: the language has the same pleasant musical quality on the page as it does when performed by Phi.</p>
                </div>
              )}
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
                <h2 className="font-noto-serif text-[11pt] md:text-[12pt] mb-4 md:mb-6 text-black leading-relaxed">
                  {currentQuestion.text}
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
                            {option.text}
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
                  className="bg-blue-800 hover:bg-blue-900 text-white rounded-full px-5 py-5 text-xs md:text-sm md:px-6 md:py-2"
                >
                  Previous
                </Button>
              ) : null}
              <Button
                onClick={goToNextQuestion}
                className="bg-blue-800 hover:bg-blue-900 text-white rounded-full px-5 py-5 text-xs md:text-sm md:px-6 md:py-2"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 