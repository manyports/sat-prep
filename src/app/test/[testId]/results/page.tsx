"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Grid, GridItem } from "@/components/grid";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, FileText, Check, X } from "lucide-react";
import { LatexRenderer } from "@/components/LatexRenderer";

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

interface TestData {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number;
  classId: string; 
}

interface TestResults {
  testId: string;
  userId: string;
  score: number;
  correctCount: number;
  totalCount: number;
  answers: Record<string, string>;
  completedAt: string;
}

export default function TestResultsPage({ params }: { params: { testId: string } }) {
  const router = useRouter();
  const [test, setTest] = useState<TestData | null>(null);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const testResponse = await fetch(`/api/tests/${params.testId}`);
        
        if (!testResponse.ok) {
          throw new Error("Failed to load test data");
        }
        
        const testData = await testResponse.json();
        
        if (!testData.success || !testData.test) {
          throw new Error("Invalid test data");
        }
        
        const classId = testData.test.classId;
        
        if (!classId) {
          throw new Error("Test data doesn't include a class ID");
        }
        
        const formattedTest: TestData = {
          id: testData.test._id || testData.test.id,
          title: testData.test.title || "Untitled Test",
          description: testData.test.description || "",
          classId: classId,
          questions: testData.test.questions?.map((q: any) => ({
            id: q.id || `q-${Math.random().toString(36).substring(2, 9)}`,
            text: q.text || "No question text",
            options: q.options || [
              { id: "a", text: "Option A" },
              { id: "b", text: "Option B" },
              { id: "c", text: "Option C" },
              { id: "d", text: "Option D" }
            ],
            correctAnswer: q.correctAnswer || "a",
            passage: q.passage || null
          })) || [],
          timeLimit: testData.test.timeLimit
        };
        
        setTest(formattedTest);
        
        const resultsResponse = await fetch(`/api/classes/${classId}/tests/${params.testId}/results`);
        
        if (!resultsResponse.ok) {
          throw new Error("Failed to load test results");
        }
        
        const resultsData = await resultsResponse.json();
        
        if (resultsData.success) {
          if (resultsData.results) {
            const testIdMatches = 
              resultsData.results.testId === params.testId || 
              (resultsData.results.originalTestId && 
                (resultsData.results.originalTestId === params.testId || 
                params.testId.startsWith(resultsData.results.originalTestId)));
                
            if (testIdMatches) {
              setTestResults(resultsData.results);
            } else {
              console.error("Results found but they don't match the requested test ID");
              throw new Error("No matching test results found for this test");
            }
          } else {
            throw new Error("This test hasn't been taken yet");
          }
        } else {
          throw new Error(resultsData.error || "Failed to load test results");
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.testId, router]);
  
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

  if (loading) {
    return (
      <div className="bg-white text-black min-h-screen pt-20">
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !test || !testResults) {
    return (
      <div className="bg-white text-black min-h-screen pt-20">
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
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto text-center">
            <div className="text-red-600 text-xl mb-4">Error</div>
            <p className="text-gray-700 mb-6">{error || "Could not load test results"}</p>
            
            <div className="space-x-4">
              <Button onClick={() => router.back()}>Go Back</Button>
              <Button 
                variant="outline"
                onClick={() => {
                  if (test?.classId) {
                    router.push(`/assignments/${test.classId}`);
                  } else {
                    router.push('/dashboard');
                  }
                }}
              >
                Back to Class
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-black min-h-screen pt-20">
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
              href={`/assignments/${test.classId}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Class
            </Link>
          </GridItem>
        </Grid>
        
        <Grid connectTo="top">
          <GridItem className="text-center py-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{test.title}</h1>
            <p className="text-gray-600 mb-6">{test.description}</p>
            
            <div className="inline-flex items-center px-4 py-2 mb-6 bg-blue-50 text-blue-900 rounded-full text-sm font-medium">
              <span className="mr-2">Score: {testResults.score}%</span>
              <span className="mx-2 w-px h-4 bg-blue-200"></span>
              <span>{testResults.correctCount} of {testResults.totalCount} correct</span>
            </div>
          </GridItem>
        </Grid>
        
        {test.questions.map((question, index) => {
          const userAnswer = testResults.answers[question.id];
          const isCorrect = userAnswer === question.correctAnswer;
          
          return (
            <Grid key={question.id} connectTo="top" noBorder="bottom" className={index === test.questions.length - 1 ? "" : "mb-0 pb-0"}>
              <GridItem className="pt-4 pb-8">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center mb-4">
                    <div className="bg-black text-white w-8 h-8 flex items-center justify-center font-bold text-sm rounded-full mr-3">
                      {index + 1}
                    </div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {renderWithLatex(question.text)}
                    </h2>
                    <div className="ml-auto">
                      {isCorrect ? (
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="h-5 w-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <X className="h-5 w-5 text-red-600" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {question.passage && (
                    <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                      <div className="text-sm text-gray-500 mb-2 uppercase tracking-wide font-medium">Passage</div>
                      <div className="text-gray-800">
                        {renderWithLatex(question.passage)}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2 mt-4">
                    {question.options.map((option, optIndex) => {
                      const letter = String.fromCharCode(65 + optIndex);
                      const isUserSelectedOption = userAnswer === option.id;
                      const isCorrectOption = question.correctAnswer === option.id;
                      
                      let bgColor = "bg-white";
                      let borderColor = "border-gray-300";
                      let textColor = "text-gray-800";
                      
                      if (isUserSelectedOption && isCorrectOption) {
                        bgColor = "bg-green-50";
                        borderColor = "border-green-300";
                      } else if (isUserSelectedOption && !isCorrectOption) {
                        bgColor = "bg-red-50";
                        borderColor = "border-red-300";
                      } else if (isCorrectOption) {
                        bgColor = "bg-blue-50";
                        borderColor = "border-blue-300";
                      }
                      
                      return (
                        <div
                          key={option.id}
                          className={`flex items-center border rounded-lg py-3 px-4 ${bgColor} ${borderColor}`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-3 ${
                            isCorrectOption
                              ? 'bg-green-100 text-green-800 border border-green-400'
                              : isUserSelectedOption
                                ? 'bg-red-100 text-red-800 border border-red-400'
                                : 'bg-white border border-gray-400'
                          }`}>
                            <span className="font-bold text-sm">
                              {letter}
                            </span>
                          </div>
                          <span className="text-gray-800">
                            {renderWithLatex(option.text)}
                          </span>
                          {isCorrectOption && (
                            <div className="ml-auto">
                              <Check className="h-5 w-5 text-green-600" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </GridItem>
            </Grid>
          );
        })}
        
        <Grid connectTo="top">
          <GridItem className="py-8 text-center">
            <Button 
              onClick={() => router.push(`/assignments/${test.classId}`)}
              className="bg-blue-800 hover:bg-blue-900"
            >
              Return to Class
            </Button>
          </GridItem>
        </Grid>
      </div>
    </div>
  );
} 