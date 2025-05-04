import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, BookOpen, ClipboardCheck, ArrowRight } from "lucide-react"
import { Grid, GridItem } from "@/components/grid"

export default function LandingPage() {
  return (
    <div className="bg-white text-black mt-14">
      <section className="container mx-auto px-4 pt-10">
        <Grid noBorder="bottom">
          <GridItem className="flex flex-col items-center justify-center py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">SAT Prep for the Modern Student</h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-10">
                Question banks, practice tests, and homework assignments designed for results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-blue-900 hover:bg-blue-800 text-white">Start Free Trial</Button>
                <Button variant="outline" className="border-gray-200 text-gray-600 hover:text-gray-900">
                  View Demo
                </Button>
              </div>
            </div>
          </GridItem>
        </Grid>
      </section>
      <section id="features" className="container mx-auto px-4 py-0">
        <Grid connectTo="bottom">
          <GridItem className="text-center py-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Everything you need to succeed</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Comprehensive tools designed for SAT success.</p>
          </GridItem>
        </Grid>
        <Grid columns={3} connectTo="top">
          <GridItem>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 bg-blue-50">
              <Search className="h-6 w-6 text-blue-900" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Question Bank Search</h3>
            <p className="text-gray-600 mb-6">
              Access thousands of SAT questions organized by topic, difficulty, and frequency.
            </p>
            <Link
              href="#"
              className="text-blue-900 hover:text-blue-700 inline-flex items-center gap-2 text-sm font-medium"
            >
              Learn more <ArrowRight className="h-4 w-4" />
            </Link>
          </GridItem>
          <GridItem>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 bg-blue-50">
              <ClipboardCheck className="h-6 w-6 text-blue-900" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Simulated Practice Tests</h3>
            <p className="text-gray-600 mb-6">
              Take full-length, timed practice tests that mirror the actual SAT experience.
            </p>
            <Link
              href="#"
              className="text-blue-900 hover:text-blue-700 inline-flex items-center gap-2 text-sm font-medium"
            >
              Learn more <ArrowRight className="h-4 w-4" />
            </Link>
          </GridItem>
          <GridItem>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6 bg-blue-50">
              <BookOpen className="h-6 w-6 text-blue-900" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Homework Assignments</h3>
            <p className="text-gray-600 mb-6">Personalized homework assignments based on your performance.</p>
            <Link
              href="#"
              className="text-blue-900 hover:text-blue-700 inline-flex items-center gap-2 text-sm font-medium"
            >
              Learn more <ArrowRight className="h-4 w-4" />
            </Link>
          </GridItem>
        </Grid>
      </section>
      <section className="container mx-auto px-4 py-0">
        <Grid columns={3} connectTo="top" noBorder="bottom">
          <GridItem className="text-center">
            <p className="text-5xl font-bold mb-2 text-blue-900">200+</p>
            <p className="text-gray-600">Practice Tests</p>
          </GridItem>
          <GridItem className="text-center">
            <p className="text-5xl font-bold mb-2 text-blue-900">10,000+</p>
            <p className="text-gray-600">Practice Questions</p>
          </GridItem>
          <GridItem className="text-center">
            <p className="text-5xl font-bold mb-2 text-blue-900">95%</p>
            <p className="text-gray-600">Score Improvement</p>
          </GridItem>
        </Grid>
      </section>
      <section id="testimonials" className="container mx-auto px-4">
        <Grid connectTo="bottom">
          <GridItem className="text-center py-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Student Success Stories</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Real results from real students.</p>
          </GridItem>
        </Grid>
        <Grid connectTo="top" noBorder="bottom">
          <GridItem>
            <div className="grid md:grid-cols-2 gap-16 max-w-4xl mx-auto">
              <div className="border-t border-gray-100 pt-8">
                <p className="font-mono text-sm text-blue-900 mb-6">+240 points</p>
                <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                  The practice tests were incredibly similar to the actual SAT. The detailed analytics helped me
                  focus on my weak areas.
                </p>
                <div className="flex items-center">
                  <div>
                    <p className="font-medium text-gray-900">Jane Doe</p>
                    <p className="text-sm text-gray-500">Fake University '26</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-8">
                <p className="font-mono text-sm text-blue-900 mb-6">+320 points</p>
                <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                  The homework assignments were perfectly tailored to my needs. I went from struggling with math to
                  feeling confident on test day.
                </p>
                <div className="flex items-center">
                  <div>
                    <p className="font-medium text-gray-900">John Doe</p>
                    <p className="text-sm text-gray-500">Acme University '25</p>
                  </div>
                </div>
              </div>
            </div>
          </GridItem>
        </Grid>
      </section>
      <section className="container mx-auto px-4">
        <Grid connectTo="bottom">
          <GridItem className="text-center py-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Simple steps to SAT success.</p>
          </GridItem>
        </Grid>
        <Grid connectTo="top" noBorder="bottom">
          <GridItem>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0">
              <div className="border-b md:border-b-0 md:border-r border-gray-100 py-6 md:px-8 flex flex-col">
                <span className="text-sm font-mono text-blue-900 mb-4">01</span>
                <h3 className="text-xl font-medium mb-2">Sign Up</h3>
                <p className="text-gray-600 text-sm">Create your account and select a plan that fits your needs.</p>
              </div>
              <div className="border-b md:border-b-0 md:border-r border-gray-100 py-6 md:px-8 flex flex-col">
                <span className="text-sm font-mono text-blue-900 mb-4">02</span>
                <h3 className="text-xl font-medium mb-2">Take Diagnostic</h3>
                <p className="text-gray-600 text-sm">Complete a diagnostic test to identify your strengths and weaknesses.</p>
              </div>
              <div className="py-6 md:px-8 flex flex-col">
                <span className="text-sm font-mono text-blue-900 mb-4">03</span>
                <h3 className="text-xl font-medium mb-2">Follow Plan</h3>
                <p className="text-gray-600 text-sm">Follow your personalized study plan and track your progress.</p>
              </div>
            </div>
          </GridItem>
        </Grid>
      </section>
      <section id="pricing" className="container mx-auto px-4">
        <Grid connectTo="bottom">
          <GridItem className="text-center py-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Choose the plan that works for you.</p>
          </GridItem>
        </Grid>
        <Grid columns={3} connectTo="top" noBorder="bottom">
          <GridItem className="flex flex-col h-full">
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Basic</h3>
              <p className="text-gray-600 mb-6">For casual preparation</p>
              <p className="text-4xl font-bold mb-6 text-gray-900">
                $9<span className="text-gray-500 text-lg font-normal">/month</span>
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="h-5 w-5 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Access to question bank
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="h-5 w-5 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  5 practice tests
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="h-5 w-5 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Basic analytics
                </li>
              </ul>
            </div>
            <div className="mt-auto">
              <Button className="w-full bg-white hover:bg-gray-50 text-blue-900 border border-gray-200">
                Get Started
              </Button>
            </div>
          </GridItem>
          <GridItem className="relative flex flex-col h-full">
            <div className="absolute top-0 right-0 bg-blue-900 text-white text-xs px-3 py-1 uppercase font-bold">
              Popular
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Premium</h3>
              <p className="text-gray-600 mb-6">For serious students</p>
              <p className="text-4xl font-bold mb-6 text-gray-900">
                $19<span className="text-gray-500 text-lg font-normal">/month</span>
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="h-5 w-5 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Full question bank access
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="h-5 w-5 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited practice tests
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="h-5 w-5 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced analytics
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="h-5 w-5 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Personalized homework
                </li>
              </ul>
            </div>
            <div className="mt-auto">
              <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white">Get Started</Button>
            </div>
          </GridItem>
          <GridItem className="flex flex-col h-full">
            <div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Ultimate</h3>
              <p className="text-gray-600 mb-6">For maximum results</p>
              <p className="text-4xl font-bold mb-6 text-gray-900">
                $29<span className="text-gray-500 text-lg font-normal">/month</span>
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="h-5 w-5 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Everything in Premium
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="h-5 w-5 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  1-on-1 tutoring sessions
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="h-5 w-5 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Essay review
                </li>
                <li className="flex items-center gap-2 text-gray-600">
                  <svg className="h-5 w-5 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
              </ul>
            </div>
            <div className="mt-auto">
              <Button className="w-full bg-white hover:bg-gray-50 text-blue-900 border border-gray-200">
                Get Started
              </Button>
            </div>
          </GridItem>
        </Grid>
      </section>
      <section className="container mx-auto px-4 pb-10">
        <Grid>
          <GridItem className="text-center py-16">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Ready to Boost Your SAT Score?</h2>
              <p className="text-xl text-gray-600 mb-10">
                Join thousands of students who have improved their scores with our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-blue-900 hover:bg-blue-800 text-white">Start Free Trial</Button>
                <Button variant="outline" className="border-gray-200 text-gray-600 hover:text-gray-900">
                  Schedule Demo
                </Button>
              </div>
            </div>
          </GridItem>
        </Grid>
      </section>
    </div>
  )
}
