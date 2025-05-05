"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Plus, Users, X, Pencil } from "lucide-react"
import { Grid, GridItem } from "@/components/grid"
import { useState } from "react"
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot, 
  InputOTPSeparator 
} from "@/components/ui/input-otp"

const classes = [
  { id: "sat-prep", name: "SAT Prep", members: 24, description: "SAT preparation course with practice tests and personalized tutoring" },
  { id: "algebra-2", name: "Algebra II", members: 18, description: "Advanced algebra concepts including functions, equations, and matrices" },
  { id: "ap-literature", name: "AP Literature", members: 22, description: "College-level literary analysis and critical reading" },
  { id: "physics", name: "Physics", members: 16, description: "Introduction to mechanics, electricity, magnetism, and modern physics" },
]

export default function ClassesPage() {
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [showJoinError, setShowJoinError] = useState(false)
  const [classNameInput, setClassNameInput] = useState("")
  const [classDescription, setClassDescription] = useState("")
  const [showCreateError, setShowCreateError] = useState(false)

  const handleJoinClass = () => {
    if (joinCode.length < 6) {
      setShowJoinError(true)
      return
    }
    
    setShowJoinError(false)
    setJoinCode("")
    setShowJoinModal(false)
  }

  const handleCreateClass = () => {
    if (classNameInput.trim().length < 3) {
      setShowCreateError(true)
      return
    }
    
    setShowCreateError(false)
    setClassNameInput("")
    setClassDescription("")
    setShowCreateModal(false)
  }

  return (
    <div className="bg-white text-black my-14">
      <section className="container mx-auto px-4 pt-10">
        <Grid noBorder="bottom">
          <GridItem className="py-10">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search classes..."
                />
              </div>
            </div>
          </GridItem>
        </Grid>
      </section>

      <section className="container mx-auto px-4 py-0">
        <Grid columns={3} connectTo="top">
          {classes.map((classItem, index) => {
            const bgColors = ["bg-blue-50", "bg-indigo-50", "bg-purple-50", "bg-green-50"];
            const textColors = ["text-blue-700", "text-indigo-700", "text-purple-700", "text-green-700"];
            const bgColor = bgColors[index % bgColors.length];
            const textColor = textColors[index % textColors.length];
            
            const initials = classItem.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
            
            return (
              <GridItem key={classItem.id}>
                <Link 
                  href={`/assignments/${classItem.id}`}
                  className="block h-full p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <div className={`h-12 w-12 rounded-full ${bgColor} flex items-center justify-center text-sm font-medium ${textColor}`}>
                        {initials}
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{classItem.name}</h2>
                    <p className="text-gray-600 mb-6">{classItem.description}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-auto">
                      <Users className="h-4 w-4 mr-2" />
                      {classItem.members} members
                    </div>
                  </div>
                </Link>
              </GridItem>
            );
          })}

          <GridItem>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="w-full h-full p-6 hover:bg-gray-50 transition-colors text-left flex flex-col"
            >
              <div className="mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Pencil className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Create a Class</h2>
              <p className="text-gray-600">
                Start a new class for your students or study group
              </p>
            </button>
          </GridItem>
          <GridItem>
            <button 
              onClick={() => setShowJoinModal(true)}
              className="w-full h-full p-6 hover:bg-gray-50 transition-colors text-left flex flex-col"
            >
              <div className="mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-gray-500" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Join a Class</h2>
              <p className="text-gray-600">
                Enter a class code to join an existing class
              </p>
            </button>
          </GridItem>
        </Grid>
      </section>

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Grid columns={1} className="max-w-xl w-full" hideDecorators>
            <GridItem className="p-0">
              <Grid columns={1} noBorder="all" hideDecorators>
                <GridItem className="p-8 text-center border-b border-gray-100">
                  <h2 className="text-3xl font-bold text-gray-900">Join a Class</h2>
                </GridItem>
                <GridItem className="p-12 flex flex-col items-center">
                  <p className="text-xl text-gray-600 mb-8 text-center">
                    Enter the 6-digit class code
                  </p>
                  <div className="w-full flex justify-center mb-8">
                    <InputOTP 
                      maxLength={6}
                      value={joinCode}
                      onChange={(value) => {
                        setJoinCode(value)
                        if (showJoinError) setShowJoinError(false)
                      }}
                    >
                      <InputOTPGroup className="gap-4">
                        <InputOTPSlot index={0} className="h-16 w-16 text-xl" />
                        <InputOTPSlot index={1} className="h-16 w-16 text-xl" />
                        <InputOTPSlot index={2} className="h-16 w-16 text-xl" />
                        <InputOTPSeparator className="mx-1" />
                        <InputOTPSlot index={3} className="h-16 w-16 text-xl" />
                        <InputOTPSlot index={4} className="h-16 w-16 text-xl" />
                        <InputOTPSlot index={5} className="h-16 w-16 text-xl" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
            
                  {showJoinError && (
                    <p className="text-sm text-red-600 mb-8 text-center">
                      Please enter a valid 6-digit class code
                    </p>
                  )}
                </GridItem>
                <GridItem className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowJoinModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-blue-900 hover:bg-blue-800"
                    onClick={handleJoinClass}
                  >
                    Join Class
                  </Button>
                </GridItem>
              </Grid>
              <button 
                onClick={() => setShowJoinModal(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </GridItem>
          </Grid>
        </div>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Grid columns={1} className="max-w-xl w-full" hideDecorators>
            <GridItem className="p-0">
              <Grid columns={1} noBorder="all" hideDecorators>
                <GridItem className="p-8 text-center border-b border-gray-100">
                  <h2 className="text-3xl font-bold text-gray-900">Create a Class</h2>
                </GridItem>
                <GridItem className="p-10 flex flex-col">
                  <div className="space-y-6 w-full">
                    <div>
                      <label htmlFor="class-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Class Name
                      </label>
                      <input 
                        id="class-name"
                        type="text" 
                        className={`w-full px-4 py-2 text-gray-900 border ${showCreateError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-md focus:outline-none focus:ring-2`}
                        placeholder="e.g. Physics Study Group"
                        value={classNameInput}
                        onChange={(e) => {
                          setClassNameInput(e.target.value)
                          if (showCreateError) setShowCreateError(false)
                        }}
                      />
                      {showCreateError && (
                        <p className="mt-1 text-sm text-red-600">
                          Class name must be at least 3 characters
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="class-description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description (optional)
                      </label>
                      <textarea 
                        id="class-description"
                        className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe what this class is for"
                        rows={3}
                        value={classDescription}
                        onChange={(e) => setClassDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </GridItem>
                <GridItem className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-blue-900 hover:bg-blue-800"
                    onClick={handleCreateClass}
                  >
                    Create Class
                  </Button>
                </GridItem>
              </Grid>              
              <button 
                onClick={() => setShowCreateModal(false)}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </GridItem>
          </Grid>
        </div>
      )}
    </div>
  )
}