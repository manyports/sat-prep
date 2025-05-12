"use client"

import { useState, useEffect } from "react"
import { Grid, GridItem } from "@/components/grid"
import { Button } from "@/components/ui/button"
import { 
  FileText, 
  Plus, 
  ArrowLeft, 
  Search, 
  Clock, 
  ChevronRight, 
  BookmarkIcon,
  LayoutGrid,
  List,
  Calendar,
  Sparkles,
  BarChart3,
  MessageSquare,
  Trash2,
  AlertTriangle
} from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

interface Test {
  id: string;
  title: string;
  description: string;
  questions: number;
  timeLimit?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  lastUpdated?: string;
  category?: string;
  isCurrentClass: boolean;
}

export default function TestSelectionPage() {
  const router = useRouter()
  const params = useParams()
  const classId = params.classId as string
  const { data: session, status } = useSession()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [windowWidth, setWindowWidth] = useState(0)
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testToDelete, setTestToDelete] = useState<Test | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  const categories = Array.from(new Set(tests.map(test => test.category || '')))
  
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         test.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory ? test.category === selectedCategory : true
    return matchesSearch && matchesCategory
  })

  const handleTestSelection = (testId: string) => {
    router.push(`/assignments/${classId}/test-studio?testId=${testId}`)
  }
  
  const handleSendToChat = (test: Test) => {
    const searchParams = new URLSearchParams(window.location.search);
    const channel = searchParams.get('channel') || 'general';
    
    sessionStorage.setItem('testToEmbed', JSON.stringify({
      id: test.id,
      title: test.title,
      description: test.description,
      questionCount: test.questions,
      timeLimit: test.timeLimit,
      channel: channel
    }));
    
    router.push(`/assignments/${classId}`);
  }
  
  const getDifficultyColor = (difficulty: string | undefined) => {
    switch(difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-blue-100 text-blue-800'
      case 'advanced': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/classes/${classId}/tests`);
        if (!response.ok) {
          throw new Error('Failed to fetch tests');
        }
        
        const data = await response.json();
        if (data.success && Array.isArray(data.tests)) {
          const formattedTests = data.tests.map((test: any) => {
            let formattedDate = test.lastModified || new Date().toISOString();
            try {
              const date = new Date(formattedDate);
              formattedDate = date.toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              });
            } catch (error) {
              console.error('Error formatting date:', error);
            }
            
            return {
              id: test._id || test.id,
              title: test.title,
              description: test.description || '',
              questions: test.questions ? test.questions.length : 0,
              timeLimit: test.timeLimit,
              difficulty: test.difficulty || 'intermediate',
              lastUpdated: formattedDate,
              category: test.category || 'Custom',
              isCurrentClass: test.isCurrentClass !== undefined ? test.isCurrentClass : true
            };
          });
          setTests(formattedTests);
        }
      } catch (error) {
        console.error('Error loading tests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTests();
  }, [classId]);

  const getTestSourceBadge = (test: Test) => {
    if (test.isCurrentClass) {
      return null;
    }
    return (
      <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-md border border-amber-300">
        My test
      </span>
    );
  };

  const handleDeleteTest = async (test: Test, e: React.MouseEvent) => {
    e.stopPropagation();
    setTestToDelete(test);
    setDeleteDialogOpen(true);
  }

  const confirmDeleteTest = async () => {
    if (!testToDelete) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/classes/${classId}/tests/${testToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete test');
      }
      
      setTests(tests.filter(t => t.id !== testToDelete.id));
      
      setDeleteDialogOpen(false);
      setTestToDelete(null);
    } catch (error) {
      console.error('Error deleting test:', error);
    } finally {
      setIsDeleting(false);
    }
  }

  const handleViewAnalytics = (testId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/assignments/${classId}/test-analytics/${testId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col pt-20">
      <div className="w-full h-[0.25vh] flex">
        {Array(windowWidth < 768 ? 20 : 50).fill(0).map((_, i) => (
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
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-sm md:text-lg text-gray-900 font-semibold line-clamp-1">
                  Test Library
                </h1>
              </div>
            </div>
            <div className="col-span-1 flex justify-center">
              <div className="relative w-full max-w-md">
                <Input
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-full border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div className="col-span-1 flex justify-end space-x-3">
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                <button 
                  className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4 text-gray-600" />
                </button>
                <button 
                  className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <Button 
                onClick={() => router.push(`/assignments/${classId}/test-studio`)}
                className="bg-blue-800 hover:bg-blue-900 text-white"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Create Test
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-3 md:px-6 py-6">
        <div className="mb-6 overflow-x-auto hide-scrollbar">
          <div className="flex space-x-2 min-w-max">
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                selectedCategory === null ? 'bg-blue-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
              onClick={() => setSelectedCategory(null)}
            >
              All Tests
            </button>
            {categories.map(category => (
              <button
                key={category}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
                  selectedCategory === category ? 'bg-blue-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            <div
              className="group border border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-blue-500 transition-colors flex flex-col items-center justify-center min-h-[250px] bg-gray-50 hover:bg-blue-50"
              onClick={() => router.push(`/assignments/${classId}/test-studio`)}
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Plus className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">Create New Test</h2>
              <p className="text-gray-500 text-center text-sm">
                Design a custom assessment for your students
              </p>
              <div className="mt-5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" className="border-blue-300 text-blue-600">
                  Get Started
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
            
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={`skeleton-${i}`} className="border border-gray-200 rounded-xl overflow-hidden animate-pulse">
                  <div className="h-2 w-full bg-gray-200"></div>
                  <div className="p-5">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 mr-3"></div>
                      <div className="flex-1">
                        <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 w-5/6 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-3 w-16 bg-gray-200 rounded"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="group border border-gray-200 rounded-xl overflow-hidden hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="h-2 w-full flex">
                    {Array(10).fill(0).map((_, i) => (
                      <div key={i} className={`h-full grow ${
                        i % 4 === 0 ? 'bg-[#009CDE]' : 
                        i % 4 === 1 ? 'bg-[#FEDB00]' : 
                        i % 4 === 2 ? 'bg-[#3c3c3c]' : 
                        'bg-[#3350C4]'
                      }`}></div>
                    ))}
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg ${
                          test.category === 'Math' ? 'bg-blue-100' :
                          test.category === 'English' ? 'bg-green-100' :
                          test.category === 'Science' ? 'bg-purple-100' :
                          test.category === 'SAT Prep' ? 'bg-yellow-100' :
                          'bg-gray-100'
                        } flex items-center justify-center mr-3`}>
                          {test.category === 'Math' ? 
                            <span className="text-blue-600 font-bold">M</span> :
                           test.category === 'English' ? 
                            <span className="text-green-600 font-bold">E</span> :
                           test.category === 'Science' ? 
                            <span className="text-purple-600 font-bold">S</span> :
                           test.category === 'SAT Prep' ? 
                            <span className="text-yellow-600 font-bold">SAT</span> :
                            <FileText className="h-5 w-5 text-gray-600" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-700">{test.title}</h2>
                            {getTestSourceBadge(test)}
                          </div>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getDifficultyColor(test.difficulty)}`}>
                            {test.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{test.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <div className="flex items-center">
                        <BarChart3 className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        <span>{test.questions} questions</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        <span>{test.timeLimit} min</span>
                      </div>
                      <div className="flex items-center text-xs">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        <span>{test.lastUpdated}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-10 gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="col-span-2"
                        onClick={() => handleTestSelection(test.id)}
                      >
                        <FileText className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="col-span-3 text-blue-800"
                        onClick={(e) => handleViewAnalytics(test.id, e)}
                      >
                        <BarChart3 className="h-3.5 w-3.5 mr-1" />
                        Analytics
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="col-span-3 bg-blue-800 hover:bg-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendToChat(test);
                        }}
                      >
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                        Chat
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="col-span-2 bg-red-600 hover:bg-red-700"
                        onClick={(e) => handleDeleteTest(test, e)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className="group border border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 hover:bg-blue-50"
              onClick={() => router.push(`/assignments/${classId}/test-studio`)}
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-gray-900 group-hover:text-blue-700">Create New Test</h2>
                  <p className="text-gray-500 text-sm">Design a custom assessment for your students</p>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={`list-skeleton-${i}`} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 mr-4"></div>
                    <div className="flex-1">
                      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex space-x-5">
                      <div className="h-8 w-20 bg-gray-200 rounded"></div>
                      <div className="h-8 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="group border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-sm transition-all"
                >
                  <div className="h-1 w-full flex">
                    {Array(20).fill(0).map((_, i) => (
                      <div key={i} className={`h-full grow ${
                        i % 4 === 0 ? 'bg-[#009CDE]' : 
                        i % 4 === 1 ? 'bg-[#FEDB00]' : 
                        i % 4 === 2 ? 'bg-[#3c3c3c]' : 
                        'bg-[#3350C4]'
                      }`}></div>
                    ))}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg ${
                        test.category === 'Math' ? 'bg-blue-100' :
                        test.category === 'English' ? 'bg-green-100' :
                        test.category === 'Science' ? 'bg-purple-100' :
                        test.category === 'SAT Prep' ? 'bg-yellow-100' :
                        'bg-gray-100'
                      } flex items-center justify-center mr-4`}>
                        {test.category === 'Math' ? 
                          <span className="text-blue-600 font-bold">M</span> :
                          test.category === 'English' ? 
                          <span className="text-green-600 font-bold">E</span> :
                          test.category === 'Science' ? 
                          <span className="text-purple-600 font-bold">S</span> :
                          test.category === 'SAT Prep' ? 
                          <span className="text-yellow-600 font-bold">SAT</span> :
                          <FileText className="h-5 w-5 text-gray-600" />
                        }
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h2 className="text-base font-semibold text-gray-900">{test.title}</h2>
                          {getTestSourceBadge(test)}
                        </div>
                        <p className="text-gray-500 text-sm line-clamp-1">{test.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-5 text-xs text-gray-500">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center">
                            <BarChart3 className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            <span>{test.questions}</span>
                          </div>
                          <span className="text-gray-400">Questions</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                            <span>{test.timeLimit}</span>
                          </div>
                          <span className="text-gray-400">Minutes</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-10 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="col-span-2"
                          onClick={() => handleTestSelection(test.id)}
                        >
                          <FileText className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline" 
                          size="sm" 
                          className="col-span-3 text-blue-800"
                          onClick={(e) => handleViewAnalytics(test.id, e)}
                        >
                          <BarChart3 className="h-3.5 w-3.5 mr-1" />
                          Analytics
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="col-span-3 bg-blue-800 hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendToChat(test);
                          }}
                        >
                          <MessageSquare className="h-3.5 w-3.5 mr-1" />
                          Chat
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="col-span-2 bg-red-600 hover:bg-red-700"
                          onClick={(e) => handleDeleteTest(test, e)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {!loading && filteredTests.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="bg-blue-50 inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tests found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {searchQuery 
                ? `No tests match your search for "${searchQuery}"` 
                : "There are no tests available yet. Create your first test!"
              }
            </p>
            <Button 
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory(null)
              }}
              variant="outline"
              className="border-blue-300 text-blue-700 mr-2"
            >
              Clear filters
            </Button>
            <Button
              onClick={() => router.push(`/assignments/${classId}/test-studio`)}
              className="bg-blue-800 hover:bg-blue-700"
            >
              Create Test
            </Button>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Test</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{testToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4 flex items-start">
            <div className="mr-3 mt-0.5">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-red-700 font-medium mb-1">Warning</p>
              <p className="text-sm text-red-600">
                This will permanently delete the test and all associated data including student responses and analytics.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex space-x-3 sm:space-x-0 gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTest} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 