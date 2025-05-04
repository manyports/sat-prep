"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Grid, GridItem } from "@/components/grid"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, BookOpen, Check } from "lucide-react"

interface TestData {
  id: string;
  title: string;
  duration: string;
  sections: {
    id: string;
    title: string;
    duration: string;
    questions: any[];
  }[];
}

export default function TestSelectionPage({ params }: { params: { testId: string } }) {
  const router = useRouter()
  const [test, setTest] = useState<TestData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const testData = await import("../../../data/sample-test.json")
        setTest(testData)
      } catch (error) {
        console.error("Error loading test data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTest()
  }, [])

  const handleStartTest = (sectionId?: string) => {
    if (sectionId) {
      router.push(`/test/${params.testId}/section/${sectionId}`)
    } else {
      router.push(`/test/${params.testId}/full`)
    }
  }

  if (loading) {
    return (
      <div className="bg-white text-black min-h-screen mt-14">
        <div className="container mx-auto px-4 py-10">
          <div className="py-4">
            <div className="w-40 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="text-center py-10">
            <div className="w-64 h-8 bg-gray-200 rounded mx-auto mb-3 animate-pulse"></div>
            <div className="w-32 h-5 bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-100 p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-6 animate-pulse"></div>
                <div className="w-32 h-6 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
                <div className="w-48 h-4 bg-gray-200 rounded mx-auto mb-6 animate-pulse"></div>
                <div className="w-28 h-9 bg-gray-200 rounded mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
          <div className="py-10 max-w-lg mx-auto">
            <div className="w-40 h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 mb-2">
                <div className="w-4 h-4 bg-gray-200 rounded-full mt-0.5 animate-pulse"></div>
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!test) {
    return (
      <div className="bg-white text-black min-h-screen flex flex-col items-center justify-center mt-14">
        <p className="text-lg text-gray-800 mb-4">Test not found</p>
        <Link href="/practice-tests">
          <Button variant="outline">Back to Practice Tests</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white text-black mt-14">
      <div className="container mx-auto px-4 py-10">
        <Grid>
          <GridItem className="py-4">
            <Link 
              href="/practice-tests" 
              className="inline-flex items-center text-gray-600 hover:text-blue-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Practice Tests
            </Link>
          </GridItem>
        </Grid>
        <Grid connectTo="top">
          <GridItem className="text-center py-10">
            <h1 className="text-3xl font-bold mb-3 text-gray-900">{test.title}</h1>
            <div className="flex items-center justify-center text-gray-600 mb-2">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm">{test.duration}</span>
            </div>
          </GridItem>
        </Grid>
        <Grid connectTo="top" columns={3}>
          <GridItem className="flex flex-col h-full">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 bg-blue-50 mx-auto">
              <BookOpen className="h-6 w-6 text-blue-900" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-center text-gray-900">Full Test</h3>
            <p className="text-gray-600 text-sm text-center mb-6">
              Complete all sections as you would in the actual SAT
            </p>
            <div className="mt-auto text-center">
              <Button 
                className="bg-blue-900 hover:bg-blue-800 text-white"
                onClick={() => handleStartTest()}
              >
                Start Full Test
              </Button>
            </div>
          </GridItem>
          {test.sections.map((section) => (
            <GridItem key={section.id} className="flex flex-col h-full">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 bg-blue-50 mx-auto">
                <BookOpen className="h-6 w-6 text-blue-900" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-900">{section.title} Only</h3>
              <p className="text-gray-600 text-sm text-center mb-6">
                {section.duration} - {section.questions.length} questions
              </p>
              <div className="mt-auto text-center">
                <Button 
                  variant="outline"
                  className="border-gray-200 text-blue-900 hover:bg-blue-50"
                  onClick={() => handleStartTest(section.id)}
                >
                  Start {section.title}
                </Button>
              </div>
            </GridItem>
          ))}
        </Grid>
        <Grid connectTo="top">
          <GridItem className="py-10">
            <div className="max-w-lg mx-auto">
              <h3 className="text-lg font-medium mb-4 text-gray-900">Test Information</h3>
              
              <div className="space-y-2">
                {[
                  "You can pause the test at any time",
                  "Questions are automatically saved as you progress",
                  "Review your answers before submitting"
                ].map((info, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 bg-blue-50 rounded-full p-1">
                      <Check className="h-3 w-3 text-blue-900" />
                    </div>
                    <p className="text-sm text-gray-600">{info}</p>
                  </div>
                ))}
              </div>
            </div>
          </GridItem>
        </Grid>
      </div>
    </div>
  )
} 