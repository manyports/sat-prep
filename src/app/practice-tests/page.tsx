"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy, ArrowRight } from "lucide-react"
import { Grid, GridItem } from "@/components/grid"
import { cn } from "@/lib/utils"

export default function PracticeTestsPage() {
  const [activeFilter, setActiveFilter] = useState("all")
  
  const practiceSets = [
    {
      id: "sat-practice-10",
      title: "Official SAT Practice Test #10",
      duration: "3 hours 15 minutes",
      tags: ["Reading", "Writing", "Math"],
      type: "official"
    },
    {
      id: "sat-practice-9",
      title: "Official SAT Practice Test #9",
      duration: "3 hours 15 minutes",
      tags: ["Reading", "Writing", "Math"],
      type: "official"
    },
    {
      id: "sat-practice-8",
      title: "Official SAT Practice Test #8",
      duration: "3 hours 15 minutes",
      tags: ["Reading", "Writing", "Math"],
      type: "official"
    },
    {
      id: "sat-practice-7",
      title: "Official SAT Practice Test #7",
      duration: "3 hours 15 minutes",
      tags: ["Reading", "Writing", "Math"],
      type: "official"
    },
    {
      id: "mini-reading",
      title: "Mini Test - Reading",
      duration: "35 minutes",
      tags: ["Reading"],
      type: "mini"
    },
    {
      id: "mini-writing",
      title: "Mini Test - Writing",
      duration: "35 minutes",
      tags: ["Writing"],
      type: "mini"
    },
    {
      id: "mini-math",
      title: "Mini Test - Math",
      duration: "35 minutes",
      tags: ["Math"],
      type: "mini"
    },
    {
      id: "diagnostic",
      title: "Diagnostic Test",
      duration: "1 hour 40 minutes",
      tags: ["Reading", "Writing", "Math"],
      type: "diagnostic"
    },
  ]

  const filteredTests = practiceSets.filter(test => {
    if (activeFilter === "all") return true;
    return test.type === activeFilter;
  });

  const filters = [
    { id: "all", label: "All Tests" },
    { id: "official", label: "Official" },
    { id: "mini", label: "Mini Tests" },
    { id: "diagnostic", label: "Diagnostic" }
  ];

  return (
    <div className="bg-white text-black mt-14">
      <div className="container mx-auto px-4">
        <section className="pt-10">
          <Grid noBorder="bottom">
            <GridItem className="text-center py-10 md:py-16">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-gray-900">Practice Tests</h1>
              <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
                Complete practice tests with timed sections to simulate the real SAT experience.
              </p>
            </GridItem>
          </Grid>
        </section>
        <section>
          <Grid>
            <GridItem className="py-4 border-b border-gray-100">
              <div className="flex justify-center overflow-x-auto scrollbar-hide">
                {filters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={cn(
                      "px-3 py-1.5 mx-2 text-sm font-medium whitespace-nowrap transition-colors",
                      activeFilter === filter.id
                        ? "text-blue-900 border-b-2 border-blue-900"
                        : "text-gray-500 hover:text-gray-800"
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </GridItem>
          </Grid>
        </section>
        <section>
          <Grid columns={activeFilter === "mini" ? 4 : 2} noBorder="top">
            {filteredTests.map((test) => (
              <GridItem key={test.id}>
                <div className="p-5 h-full flex flex-col">
                  <h3 className="text-base md:text-lg font-semibold mb-2 text-gray-900">{test.title}</h3>
                  <p className="text-gray-500 text-xs md:text-sm mb-3">{test.duration}</p>
                  <div className="flex flex-wrap gap-1 mb-5">
                    {test.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="bg-gray-50 text-gray-600 text-xs px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex justify-end">
                    <Link href={`/test/${test.id}`}>
                      <Button 
                        className="bg-blue-900 hover:bg-blue-800 text-white text-xs md:text-sm"
                        size="sm"
                      >
                        Start Test
                      </Button>
                    </Link>
                  </div>
                </div>
              </GridItem>
            ))}
          </Grid>
        </section>
        <section className="pb-12 md:pb-16">
          <Grid noBorder="top">
            <GridItem>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-md flex items-center justify-center bg-blue-50">
                      <Trophy className="h-4 w-4 text-blue-900" />
                    </div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Track Your Progress</h2>
                  </div>
                  <p className="text-gray-600 text-sm md:text-base mb-6 leading-relaxed">
                    Our detailed analytics help you identify strengths and weaknesses, track your progress over time, and focus your studying on the areas that need improvement.
                  </p>
                  <Link
                    href="#"
                    className="text-blue-900 hover:text-blue-700 inline-flex items-center gap-1 text-sm font-medium group"
                  >
                    View analytics <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm text-gray-900">Math</span>
                      <span className="text-blue-900 font-bold text-sm">680</span>
                    </div>
                    <div className="w-full bg-gray-50 rounded-full h-1.5">
                      <div className="bg-blue-900 h-1.5 rounded-full" style={{ width: "68%" }}></div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm text-gray-900">Reading & Writing</span>
                      <span className="text-blue-900 font-bold text-sm">720</span>
                    </div>
                    <div className="w-full bg-gray-50 rounded-full h-1.5">
                      <div className="bg-blue-900 h-1.5 rounded-full" style={{ width: "72%" }}></div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm text-gray-900">Overall</span>
                      <span className="text-blue-900 font-bold text-sm">1400</span>
                    </div>
                    <div className="w-full bg-gray-50 rounded-full h-1.5">
                      <div className="bg-blue-900 h-1.5 rounded-full" style={{ width: "87.5%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </GridItem>
          </Grid>
        </section>
      </div>
    </div>
  )
} 