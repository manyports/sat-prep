import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { Grid, GridItem } from "@/components/grid"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function PricingPage() {
  return (
    <div className="bg-white text-black mt-14">
      <section className="container mx-auto px-4 pt-10">
        <Grid noBorder="bottom">
          <GridItem className="flex flex-col items-center justify-center py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900">Simple, Transparent Pricing</h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-10">
                Choose the plan that works best for your SAT preparation journey.
              </p>
            </div>
          </GridItem>
        </Grid>
      </section>
      <section className="container mx-auto px-4 py-0">
        <Grid columns={3} noBorder="bottom">
          <GridItem className="flex flex-col h-full p-8">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Basic</h3>
              <p className="text-gray-600 mb-6">For casual preparation</p>
              <p className="text-4xl font-bold mb-6 text-gray-900">
                $9<span className="text-gray-500 text-lg font-normal">/month</span>
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-gray-600">
                  <Check className="h-5 w-5 text-blue-900 mt-0.5 flex-shrink-0" />
                  <span>Access to question bank</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <Check className="h-5 w-5 text-blue-900 mt-0.5 flex-shrink-0" />
                  <span>5 practice tests</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <Check className="h-5 w-5 text-blue-900 mt-0.5 flex-shrink-0" />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <Check className="h-5 w-5 text-blue-900 mt-0.5 flex-shrink-0" />
                  <span>Email support</span>
                </li>
              </ul>
            </div>
            <div className="mt-auto">
              <Button className="w-full bg-white hover:bg-gray-50 text-blue-900 border border-gray-200">
                Get Started
              </Button>
            </div>
          </GridItem>
          <GridItem className="relative flex flex-col h-full p-8 bg-blue-50">
            <div className="absolute top-0 right-0 bg-blue-900 text-white text-xs px-3 py-1 uppercase font-bold rounded-bl-lg">
              Popular
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Premium</h3>
              <p className="text-gray-600 mb-6">For serious students</p>
              <p className="text-4xl font-bold mb-6 text-gray-900">
                $19<span className="text-gray-500 text-lg font-normal">/month</span>
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-gray-600">
                  <Check className="h-5 w-5 text-blue-900 mt-0.5 flex-shrink-0" />
                  <span>Full question bank access</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <Check className="h-5 w-5 text-blue-900 mt-0.5 flex-shrink-0" />
                  <span>Unlimited practice tests</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <Check className="h-5 w-5 text-blue-900 mt-0.5 flex-shrink-0" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <Check className="h-5 w-5 text-blue-900 mt-0.5 flex-shrink-0" />
                  <span>Personalized homework</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <Check className="h-5 w-5 text-blue-900 mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
            <div className="mt-auto">
              <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white">Get Started</Button>
            </div>
          </GridItem>
          <GridItem className="flex flex-col h-full p-8">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Pro</h3>
              <p className="text-gray-600 mb-6">For maximum results</p>
              <p className="text-4xl font-bold mb-6 text-gray-900">
                $39<span className="text-gray-500 text-lg font-normal">/month</span>
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-gray-600">
                  <Check className="h-5 w-5 text-blue-900 mt-0.5 flex-shrink-0" />
                  <span>Everything in Premium</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <Check className="h-5 w-5 text-blue-900 mt-0.5 flex-shrink-0" />
                  <span>1-on-1 tutoring sessions</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <Check className="h-5 w-5 text-blue-900 mt-0.5 flex-shrink-0" />
                  <span>Customized study plan</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <Check className="h-5 w-5 text-blue-900 mt-0.5 flex-shrink-0" />
                  <span>Essay review and feedback</span>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <Check className="h-5 w-5 text-blue-900 mt-0.5 flex-shrink-0" />
                  <span>24/7 dedicated support</span>
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
      <section className="container mx-auto px-4">
        <Grid noBorder="bottom">
          <GridItem className="flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-10 text-gray-900 text-center">Frequently Asked Questions</h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-b border-gray-200 last:border-0">
                    <AccordionTrigger className="text-xl font-semibold text-gray-900 px-6 py-5 hover:no-underline">
                      Can I switch plans?
                    </AccordionTrigger>
                    <AccordionContent className="px-6 text-gray-600">
                      Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" className="border-b border-gray-200 last:border-0">
                    <AccordionTrigger className="text-xl font-semibold text-gray-900 px-6 py-5 hover:no-underline">
                      Is there a free trial?
                    </AccordionTrigger>
                    <AccordionContent className="px-6 text-gray-600">
                      Yes, we offer a 7-day free trial on all plans. No credit card required to start your trial.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3" className="border-b border-gray-200 last:border-0">
                    <AccordionTrigger className="text-xl font-semibold text-gray-900 px-6 py-5 hover:no-underline">
                      Do you offer refunds?
                    </AccordionTrigger>
                    <AccordionContent className="px-6 text-gray-600">
                      We offer a 30-day money-back guarantee if you're not satisfied with our service.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4" className="border-b border-gray-200 last:border-0">
                    <AccordionTrigger className="text-xl font-semibold text-gray-900 px-6 py-5 hover:no-underline">
                      Are there any long-term commitments?
                    </AccordionTrigger>
                    <AccordionContent className="px-6 text-gray-600">
                      No, all plans are month-to-month with no long-term commitments. You can cancel anytime.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </GridItem>
        </Grid>
      </section>
      <section className="container mx-auto px-4 pb-16 mb-16">
        <Grid noBorder="bottom">
          <GridItem className="flex flex-col items-center justify-center bg-blue-50 p-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Need a custom plan for your school?</h2>
              <p className="text-xl text-gray-600 mb-8">
                We offer special pricing for schools and educational institutions.
              </p>
              <Button className="bg-blue-900 hover:bg-blue-800 text-white px-8">
                Contact Us
              </Button>
            </div>
          </GridItem>
        </Grid>
      </section>
    </div>
  )
} 