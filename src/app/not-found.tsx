"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Grid, GridItem } from "@/components/grid"

export default function NotFound() {
  const links = [
    {
      href: "/questions",
      title: "Question Bank",
      description: "Access our comprehensive collection of SAT practice questions."
    },
    {
      href: "/practice-tests",
      title: "Practice Tests",
      description: "Take full-length, timed practice tests that mirror the actual SAT."
    },
    {
      href: "/assignments",
      title: "My Class",
      description: "Access your assigned homework and class materials."
    },
    {
      href: "/pricing",
      title: "Pricing",
      description: "View our subscription plans and pricing options."
    }
  ]

  return (
    <div className="pt-32 pb-16">
      <div className="container mx-auto px-4">
        <Grid noBorder="bottom">
          <GridItem className="py-16 flex items-center justify-center">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-8xl font-bold text-[#0a2472]/80 mb-6">404</h1>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Page not found</h2>
              <p className="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link 
                  href="/" 
                  className="inline-block bg-[#0a2472] hover:bg-[#061a54] text-white px-6 py-3 font-medium tracking-wide transition-colors duration-200"
                >
                  Back to home
                </Link>
              </motion.div>
            </motion.div>
          </GridItem>
        </Grid>
        <div>
          <Grid>
            <GridItem className="pb-8">
              <motion.h2 
                className="text-xl font-semibold text-gray-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                You might be looking for:
              </motion.h2>
            </GridItem>
          </Grid>
          <Grid columns={2} connectTo="top">
            {links.map((link, index) => (
              <GridItem key={link.href}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                  whileHover={{ y: -2 }}
                >
                  <Link 
                    href={link.href} 
                    className="block h-full"
                  >
                    <h3 className="text-lg font-medium mb-2 text-gray-900 hover:text-blue-900">{link.title}</h3>
                    <p className="text-gray-600 text-sm">{link.description}</p>
                  </Link>
                </motion.div>
              </GridItem>
            ))}
          </Grid>
        </div>
      </div>
    </div>
  )
} 