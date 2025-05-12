"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AccessDeniedPage() {
  const router = useRouter()
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-red-600 text-4xl mb-4">
        <AlertTriangle className="h-16 w-16 mx-auto mb-4" />
      </div>
      <h1 className="text-2xl font-bold mb-2 text-center">Access Denied</h1>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        You don't have permission to access this page. Only instructors can access this area.
      </p>
      <Button onClick={() => router.back()}>Go Back</Button>
    </div>
  )
} 