"use client"

import TestComponent from "@/components/TestComponent"

export default function FullTestPage({ params }: { params: { testId: string } }) {
  return <TestComponent testId={params.testId} />
} 