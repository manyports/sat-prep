"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { MenuIcon, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])
  
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: "Questions", href: "/questions" },
    { name: "Practice Tests", href: "/practice-tests" },
    { name: "My Class", href: "/assignments" },
    { name: "Pricing", href: "/pricing" },
  ]

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 ${
          scrolled ? 'bg-white/95 backdrop-blur-sm border-b border-slate-100' : 'bg-white'
        } transition-all duration-300`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center">
              <span className="text-[19px] tracking-tight font-medium text-[#0a2472]">satley</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-10">
              {navItems.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href} 
                  className="text-[#111827] hover:text-[#0a2472] text-[14px] font-medium tracking-wide transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="hidden md:flex items-center">
              <Link href="/login" className="mr-8 text-[14px] text-[#111827] hover:text-[#0a2472] font-medium tracking-wide transition-colors duration-200">
                Log in
              </Link>
              <Link href="/signup" className="text-[14px] bg-[#0a2472] hover:bg-[#061a54] text-white px-5 py-2.5 font-medium tracking-wide transition-colors duration-200">
                Sign up
              </Link>
            </div>
            <button 
              className="flex md:hidden items-center justify-center w-10 h-10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="h-5 w-5 text-[#0a2472]" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <MenuIcon className="h-5 w-5 text-[#0a2472]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="fixed inset-0 z-40 bg-white flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="h-16 flex-none"></div>
            <div className="flex-1 flex flex-col justify-between px-6 py-12">
              <nav className="space-y-7">
                {navItems.map((item, index) => (
                  <div key={item.name} className="overflow-hidden">
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link 
                        href={item.href} 
                        className="block text-[#111827] hover:text-[#0a2472] text-[28px] font-medium tracking-tight transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  </div>
                ))}
              </nav>
              <motion.div 
                className="mt-auto pt-8 border-t border-slate-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <div className="flex flex-col space-y-6 items-start">
                  <Link
                    href="/login"
                    className="text-[#111827] hover:text-[#0a2472] text-[17px] font-medium transition-colors duration-200" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-[#0a2472] hover:bg-[#061a54] text-white px-5 py-2.5 text-[15px] font-medium tracking-wide transition-colors duration-200" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 