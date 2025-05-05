"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { MenuIcon, X, User, LogOut } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession, signOut } from 'next-auth/react'

export function Header() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isProfileMenuOpen && !target.closest('[data-profile-menu]')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleSignOut = async () => {
    setIsProfileMenuOpen(false);
    await signOut({ redirect: true, callbackUrl: '/auth/signout' });
  };

  const navItems = [
    { name: "Question Bank", href: "/questions" },
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
              {status === 'authenticated' ? (
                <div className="relative" data-profile-menu>
                  <button 
                    className="flex items-center space-x-2"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  >
                    <div className="w-9 h-9 bg-[#0a2472] rounded-full flex items-center justify-center text-white">
                      <span className="text-sm font-semibold">
                        {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-[14px] font-medium text-[#111827]">
                      {session.user?.name?.split(' ')[0] || 'User'}
                    </span>
                  </button>
                  
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                      </div>
                      <Link 
                        href="/profile" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        Your Profile
                      </Link>
                      <button 
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 mr-2 text-gray-500" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/auth/signin" className="mr-8 text-[14px] text-[#111827] hover:text-[#0a2472] font-medium tracking-wide transition-colors duration-200">
                    Log in
                  </Link>
                  <Link href="/auth/signup" className="text-[14px] bg-[#0a2472] hover:bg-[#061a54] text-white px-5 py-2.5 font-medium tracking-wide transition-colors duration-200">
                    Sign up
                  </Link>
                </>
              )}
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
                {status === 'authenticated' ? (
                  <div className="flex flex-col space-y-6 items-start">
                    <Link
                      href="/profile"
                      className="text-[#111827] hover:text-[#0a2472] text-[17px] font-medium transition-colors duration-200" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOut({ redirect: true, callbackUrl: '/auth/signout' });
                      }}
                      className="bg-[#0a2472] hover:bg-[#061a54] text-white px-5 py-2.5 text-[15px] font-medium tracking-wide transition-colors duration-200" 
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-6 items-start">
                    <Link
                      href="/auth/signin"
                      className="text-[#111827] hover:text-[#0a2472] text-[17px] font-medium transition-colors duration-200" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="bg-[#0a2472] hover:bg-[#061a54] text-white px-5 py-2.5 text-[15px] font-medium tracking-wide transition-colors duration-200" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 