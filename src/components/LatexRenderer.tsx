"use client"

import { useState, useEffect } from 'react'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface LatexRendererProps {
  latex: string
  isBlock?: boolean
  className?: string
}

export function LatexRenderer({ latex, isBlock = false, className = '' }: LatexRendererProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  try {
    if (isBlock) {
      return <BlockMath math={latex} className={className} />
    }
    return <InlineMath math={latex} className={className} />
  } catch (error) {
    console.error('Error rendering LaTeX:', error)
    return <span className="text-red-500">LaTeX Error: {latex}</span>
  }
} 