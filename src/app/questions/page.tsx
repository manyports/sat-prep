"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Filter, ArrowRight, Clock, TrendingUp } from "lucide-react"
import { Grid, GridItem } from "@/components/grid"
import { useState, useEffect, useRef } from "react"

const mockSuggestions = {
  "alg": ["Algebra", "Algebraic Expressions", "Algebraic Fractions"],
  "geo": ["Geometry", "Geometric Proofs", "Geometric Sequences"],
  "eq": ["Equations", "Equalities", "Equivalent Expressions"],
  "re": ["Reading Comprehension", "Reading Evidence", "Research Analysis"],
  "wr": ["Writing Structure", "Writing Grammar", "Writing Style"],
  "verb": ["Verb Tense Agreement", "Verbal Reasoning", "Verbs and Adverbs"],
  "ma": ["Math - Algebra", "Math - Geometry", "Math - Trigonometry"],
}

const filterCategories = [
  { id: "math", name: "Math", subcategories: ["Algebra", "Geometry", "Trigonometry", "Statistics"] },
  { id: "reading", name: "Reading", subcategories: ["Main Idea", "Inference", "Evidence", "Vocabulary"] },
  { id: "writing", name: "Writing", subcategories: ["Grammar", "Style", "Structure", "Rhetoric"] },
]

const difficultyLevels = ["Easy", "Medium", "Hard"]

export default function QuestionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<{
    categories: string[],
    difficulty: string[]
  }>({
    categories: [],
    difficulty: []
  })
  
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const matches: string[] = []
      
      Object.entries(mockSuggestions).forEach(([key, values]) => {
        if (key.toLowerCase().includes(searchQuery.toLowerCase())) {
          matches.push(...values)
        } else {
          values.forEach(value => {
            if (value.toLowerCase().includes(searchQuery.toLowerCase())) {
              matches.push(value)
            }
          })
        }
      })
      
      setSuggestions(Array.from(new Set(matches)))
      setShowSuggestions(matches.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
      
      if (
        filterRef.current && 
        !filterRef.current.contains(event.target as Node) &&
        event.target instanceof Node &&
        !(event.target as HTMLElement).closest('.filter-button')
      ) {
        setShowFilters(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
}
  
  const toggleFilterCategory = (category: string) => {
    setSelectedFilters(prev => {
      if (prev.categories.includes(category)) {
        return {
          ...prev,
          categories: prev.categories.filter(c => c !== category)
        }
      } else {
        return {
          ...prev,
          categories: [...prev.categories, category]
        }
      }
    })
  }
  
  const toggleFilterDifficulty = (difficulty: string) => {
    setSelectedFilters(prev => {
      if (prev.difficulty.includes(difficulty)) {
        return {
          ...prev,
          difficulty: prev.difficulty.filter(d => d !== difficulty)
        }
      } else {
        return {
          ...prev,
          difficulty: [...prev.difficulty, difficulty]
        }
      }
    })
  }
  
  const clearFilters = () => {
    setSelectedFilters({
      categories: [],
      difficulty: []
    })
  }

  return (
    <div className="bg-white text-black mt-14">
      <section className="container mx-auto px-4 pt-10">
        <Grid noBorder="bottom">
          <GridItem className="flex flex-col items-center justify-center py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">Question Bank</h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-10">
                Explore thousands of SAT questions organized by topic, difficulty, and frequency.
              </p>
              <div className="w-full max-w-2xl mx-auto relative mb-12">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  className="block w-full pl-10 pr-4 py-4 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                  placeholder="Search for questions by topic, difficulty, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.length >= 2 && suggestions.length > 0) {
                      setShowSuggestions(true)
                    }
                  }}
                />
                {showSuggestions && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm border border-gray-200"
                  >
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 hover:bg-blue-50 flex items-center"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Search className="h-4 w-4 text-gray-400 mr-3" />
                        <span className="text-left">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </GridItem>
        </Grid>
      </section>
      <section className="container mx-auto px-4 py-0">
        <Grid connectTo="bottom">
          <GridItem className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Questions</h2>
              <p className="text-gray-600">10,000+ questions available</p>
            </div>
            <div className="relative">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 filter-button"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                {selectedFilters.categories.length + selectedFilters.difficulty.length > 0 && 
                  `(${selectedFilters.categories.length + selectedFilters.difficulty.length})`}
              </Button>
              {showFilters && (
                <div 
                  ref={filterRef}
                  className="absolute right-0 z-10 mt-2 w-64 bg-white shadow-sm rounded-md py-1 text-sm border border-gray-100"
                >
                  <div className="px-3 py-2 border-b border-gray-50 flex justify-between items-center">
                    <span className="font-medium text-xs uppercase text-gray-500">Filters</span>
                    {(selectedFilters.categories.length > 0 || selectedFilters.difficulty.length > 0) && (
                      <button 
                        onClick={clearFilters}
                        className="text-xs text-blue-900 hover:text-blue-700"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="px-3 py-2">
                    <h3 className="font-medium text-xs uppercase text-gray-500 mb-1">Categories</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {filterCategories.map(category => (
                        <button
                          key={category.id}
                          onClick={() => toggleFilterCategory(category.id)}
                          className={`px-2 py-1 rounded-full text-xs ${
                            selectedFilters.categories.includes(category.id)
                              ? 'bg-blue-900 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="px-3 py-2 border-t border-gray-50">
                    <h3 className="font-medium text-xs uppercase text-gray-500 mb-1">Difficulty</h3>
                    <div className="flex gap-1 mt-1">
                      {difficultyLevels.map(level => (
                        <button
                          key={level}
                          onClick={() => toggleFilterDifficulty(level.toLowerCase())}
                          className={`px-2 py-1 rounded-full text-xs ${
                            selectedFilters.difficulty.includes(level.toLowerCase())
                              ? 'bg-blue-900 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>                  
                  <div className="px-3 py-2 border-t border-gray-50">
                    <Button size="sm" className="w-full bg-blue-900 hover:bg-blue-800 text-white text-xs">
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </GridItem>
        </Grid>
        <Grid connectTo="top" columns={3}>
          <GridItem>
            <div className="border-l-4 border-blue-900 pl-4 mb-4">
              <p className="text-sm font-medium text-blue-900">Math - Algebra</p>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Systems of Equations</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Solve the system of equations to find the values of x and y.
            </p>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">~2 min</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">Medium</span>
              </div>
            </div>
            <Link
              href="/test/algebra-systems"
              className="text-blue-900 hover:text-blue-700 inline-flex items-center gap-2 text-sm font-medium"
            >
              View question <ArrowRight className="h-4 w-4" />
            </Link>
          </GridItem>
          <GridItem>
            <div className="border-l-4 border-blue-900 pl-4 mb-4">
              <p className="text-sm font-medium text-blue-900">Reading - Main Idea</p>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Author's Purpose</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Determine the main purpose of the passage and how it relates to the overall theme.
            </p>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">~3 min</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">Hard</span>
              </div>
            </div>
            <Link
              href="/test/reading-purpose"
              className="text-blue-900 hover:text-blue-700 inline-flex items-center gap-2 text-sm font-medium"
            >
              View question <ArrowRight className="h-4 w-4" />
            </Link>
          </GridItem>
          <GridItem>
            <div className="border-l-4 border-blue-900 pl-4 mb-4">
              <p className="text-sm font-medium text-blue-900">Writing - Grammar</p>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Verb Tense Agreement</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Select the correct verb tense to maintain consistency within the paragraph.
            </p>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">~1 min</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">Easy</span>
              </div>
            </div>
            <Link
              href="/test/writing-verbs"
              className="text-blue-900 hover:text-blue-700 inline-flex items-center gap-2 text-sm font-medium"
            >
              View question <ArrowRight className="h-4 w-4" />
            </Link>
          </GridItem>
        </Grid>
        <Grid columns={3} connectTo="top">
          <GridItem>
            <div className="border-l-4 border-blue-900 pl-4 mb-4">
              <p className="text-sm font-medium text-blue-900">Math - Geometry</p>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Similar Triangles</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Calculate the missing side length using properties of similar triangles.
            </p>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">~2 min</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">Medium</span>
              </div>
            </div>
            <Link
              href="/test/geometry-triangles"
              className="text-blue-900 hover:text-blue-700 inline-flex items-center gap-2 text-sm font-medium"
            >
              View question <ArrowRight className="h-4 w-4" />
            </Link>
          </GridItem>
          <GridItem>
            <div className="border-l-4 border-blue-900 pl-4 mb-4">
              <p className="text-sm font-medium text-blue-900">Reading - Inference</p>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Character Motivation</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Based on the passage, what can be inferred about the character's motivation?
            </p>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">~3 min</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">Hard</span>
              </div>
            </div>
            <Link
              href="/test/reading-inference"
              className="text-blue-900 hover:text-blue-700 inline-flex items-center gap-2 text-sm font-medium"
            >
              View question <ArrowRight className="h-4 w-4" />
            </Link>
          </GridItem>
          <GridItem>
            <div className="border-l-4 border-blue-900 pl-4 mb-4">
              <p className="text-sm font-medium text-blue-900">Writing - Style</p>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Concision and Clarity</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Choose the most concise and clear version of the highlighted sentence.
            </p>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">~2 min</span>
              </div>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-xs text-gray-500">Medium</span>
              </div>
            </div>
            <Link
              href="/test/writing-concision"
              className="text-blue-900 hover:text-blue-700 inline-flex items-center gap-2 text-sm font-medium"
            >
              View question <ArrowRight className="h-4 w-4" />
            </Link>
          </GridItem>
        </Grid>
      </section>
      <section className="container mx-auto px-4 pb-12">
        <Grid noBorder="top">
          <GridItem className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Browse by Category</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/test/category/math" className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md hover:border-blue-900 hover:text-blue-900 transition-colors">
                  <div className="w-2 h-2 bg-blue-900 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Math</span>
                </Link>
                <Link href="/test/category/reading" className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md hover:border-blue-900 hover:text-blue-900 transition-colors">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Reading</span>
                </Link>
                <Link href="/test/category/writing" className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md hover:border-blue-900 hover:text-blue-900 transition-colors">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Writing</span>
                </Link>
                <Link href="/test/category/grammar" className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md hover:border-blue-900 hover:text-blue-900 transition-colors">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Grammar</span>
                </Link>
              </div>
            </div>
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 max-w-md">
              <div className="flex items-start gap-3">
                <Search className="h-5 w-5 text-blue-900 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-base font-semibold mb-1 text-gray-900">Advanced Search</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Find exactly what you need with our advanced search tools.
                  </p>
                  <Button size="sm" variant="default" className="bg-blue-900 hover:bg-blue-800 text-white text-xs">
                    Go to Advanced Search
                  </Button>
                </div>
              </div>
            </div>
          </GridItem>
        </Grid>
      </section>
    </div>
  )
} 