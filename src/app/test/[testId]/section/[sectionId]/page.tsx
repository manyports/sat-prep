"use client"

import TestComponent from "@/components/TestComponent"

export default function SectionTestPage({ params }: { params: { testId: string, sectionId: string } }) {
  return <TestComponent testId={params.testId} sectionId={params.sectionId} />
} 