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
import { useClasses } from "@/hooks/useClasses"
import { CreateClassModal } from "@/components/CreateClassModal"

export default function ClassesPage() {
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [joinCode, setJoinCode] = useState("")
  const [showJoinError, setShowJoinError] = useState(false)
  const { classes, loading, error, fetchClasses } = useClasses()

  const handleJoinClass = async () => {
    if (joinCode.length < 6) {
      setShowJoinError(true)
      return
    }
    
    try {
      const response = await fetch(`/api/classes/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invitationCode: joinCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join class');
      }

      const data = await response.json();
      if (data.success) {
        await fetchClasses(); 
        setShowJoinError(false);
        setJoinCode("");
        setShowJoinModal(false);
      }
    } catch (error) {
      console.error('Error joining class:', error);
      setShowJoinError(true);
    }
  }

  if (loading) {
    return (
      <div className="bg-white text-black my-14">
        <section className="container mx-auto px-4 pt-10">
          <Grid noBorder="bottom">
            <GridItem className="py-10">
              <div className="flex justify-between items-center">
                <div className="h-9 bg-gray-200 rounded-md w-48 animate-pulse"></div>
                <div className="w-64 h-10 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            </GridItem>
          </Grid>
        </section>

        <section className="container mx-auto px-4 py-0">
          <Grid columns={3} connectTo="top">
            {[...Array(5)].map((_, index) => (
              <GridItem key={index}>
                <div className="block h-full p-6">
                  <div className="flex flex-col h-full">
                    <div className="mb-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse"></div>
                    </div>
                    <div className="h-7 bg-gray-200 rounded-md w-48 mb-2 animate-pulse"></div>
                    <div className="h-16 bg-gray-200 rounded-md w-full mb-6 animate-pulse"></div>
                    <div className="flex items-center mt-auto">
                      <div className="h-5 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </GridItem>
            ))}
          </Grid>
        </section>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Error loading classes: {error}</div>
      </div>
    )
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
                      {classItem.members.length} members
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Grid columns={1} className="max-w-xl w-full sm:w-[95%] md:w-[90%] lg:w-[85%] xl:w-[75%]" hideDecorators>
            <GridItem className="p-0">
              <Grid columns={1} noBorder="all" hideDecorators>
                <GridItem className="p-4 sm:p-6 md:p-8 text-center border-b border-gray-100">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Join a Class</h2>
                </GridItem>
                <GridItem className="p-6 sm:p-8 md:p-12 flex flex-col items-center">
                  <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 text-center">
                    Enter the 6-digit class code
                  </p>
                  <div className="w-full flex justify-center mb-6 sm:mb-8">
                    <InputOTP 
                      maxLength={6}
                      value={joinCode}
                      onChange={(value) => {
                        setJoinCode(value)
                        if (showJoinError) setShowJoinError(false)
                      }}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="h-12 w-12 sm:h-16 sm:w-16 text-lg sm:text-xl" />
                        <InputOTPSlot index={1} className="h-12 w-12 sm:h-16 sm:w-16 text-lg sm:text-xl" />
                        <InputOTPSlot index={2} className="h-12 w-12 sm:h-16 sm:w-16 text-lg sm:text-xl" />
                        <InputOTPSeparator className="mx-0.5 sm:mx-1" />
                        <InputOTPSlot index={3} className="h-12 w-12 sm:h-16 sm:w-16 text-lg sm:text-xl" />
                        <InputOTPSlot index={4} className="h-12 w-12 sm:h-16 sm:w-16 text-lg sm:text-xl" />
                        <InputOTPSlot index={5} className="h-12 w-12 sm:h-16 sm:w-16 text-lg sm:text-xl" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {showJoinError && (
                    <p className="text-sm text-red-600 mb-6 sm:mb-8 text-center">
                      Please enter a valid 6-digit class code
                    </p>
                  )}
                </GridItem>
                <GridItem className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 sm:space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowJoinModal(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-blue-900 hover:bg-blue-800 w-full sm:w-auto"
                    onClick={handleJoinClass}
                  >
                    Join Class
                  </Button>
                </GridItem>
              </Grid>
              <button 
                onClick={() => setShowJoinModal(false)}
                className="absolute top-3 right-3 sm:top-6 sm:right-6 text-gray-400 hover:text-gray-600 p-2"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </GridItem>
          </Grid>
        </div>
      )}

      <CreateClassModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  )
}