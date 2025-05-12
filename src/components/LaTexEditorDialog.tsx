"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { LatexRenderer } from './LatexRenderer'
import { Label } from './ui/label'
import { X } from 'lucide-react'

interface LaTexEditorDialogProps {
  isOpen: boolean
  onClose: () => void
  onInsert: (latex: string) => void
  initialValue?: string
}

export function LaTexEditorDialog({ 
  isOpen, 
  onClose, 
  onInsert,
  initialValue = ''
}: LaTexEditorDialogProps) {
  const [latex, setLatex] = useState(initialValue)
  const [presets, setPresets] = useState([
    { label: 'Fraction', value: '\\frac{a}{b}' },
    { label: 'Square Root', value: '\\sqrt{x}' },
    { label: 'Power', value: 'x^{n}' },
    { label: 'Integral', value: '\\int_{a}^{b} f(x) \\, dx' },
    { label: 'Sum', value: '\\sum_{i=1}^{n} x_i' },
    { label: 'Limit', value: '\\lim_{x \\to a} f(x)' },
    { label: 'Matrix', value: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
    { label: 'Greek Letters', value: '\\alpha, \\beta, \\gamma, \\theta, \\pi' },
  ])
  
  useEffect(() => {
    if (isOpen) {
      setLatex(initialValue)
    }
  }, [isOpen, initialValue])
  
  const handleInsert = () => {
    onInsert(latex)
    onClose()
  }
  
  const insertPreset = (value: string) => {
    setLatex(prev => prev + value)
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>LaTeX Editor</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4">
          <div>
            <Label htmlFor="latex-input">Enter LaTeX code:</Label>
            <Textarea
              id="latex-input"
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              className="font-mono"
              rows={5}
            />
          </div>
          
          <div>
            <Label>Common Formulas:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {presets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => insertPreset(preset.value)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Preview:</Label>
            <div className="p-4 border rounded-md bg-gray-50 min-h-[60px] flex items-center justify-center">
              {latex ? (
                <LatexRenderer latex={latex} isBlock={true} />
              ) : (
                <span className="text-gray-400">LaTeX preview will appear here</span>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleInsert}>Insert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 