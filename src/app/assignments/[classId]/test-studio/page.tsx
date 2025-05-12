"use client"

import { useState, useEffect, useRef, KeyboardEvent, ClipboardEvent } from "react"
import { Grid, GridItem } from "@/components/grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Pencil,
  MoreVertical,
  Clock,
  BookmarkIcon,
  FileText,
  Settings,
  Search,
  Database,
  Copy,
  Trash2,
  Undo,
  Redo,
  KeyboardIcon,
  HelpCircle,
  List,
  BarChart3,
  ArrowRight,
  Image as ImageIcon,
  Pi,
  X,
  ListChecks,
  Loader2,
  Upload,
  AlertTriangle
} from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { LaTexEditorDialog } from "@/components/LaTexEditorDialog"
import { ImageUploader } from "@/components/ImageUploader"
import { LatexRenderer } from "@/components/LatexRenderer"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useUploadThing } from "@/lib/uploadthing"
import { useSession } from "next-auth/react"

interface Option {
  id: string;
  text: string;
}

interface QuestionImage {
  id: string;
  url: string;
  alt?: string;
  fileKey?: string;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
  correctAnswer: string;
  passage?: string | null;
  pointValue?: number;
  tags?: string[];
  images?: QuestionImage[];
}

interface BankQuestion extends Question {
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastUsed?: string;
}

interface TestMeta {
  id: string;
  title: string;
  description: string;
  timeLimit: number;
  totalPoints: number;
  lastModified: string;
}

interface ShortcutKey {
  key: string;
  description: string;
  action: () => void;
  combo?: string[];
}

export default function TestStudio() {
  const router = useRouter()
  const params = useParams()
  const classId = params.classId as string
  const { data: session, status } = useSession()
  
  const [testMeta, setTestMeta] = useState<TestMeta>({
    id: "new-test",
    title: "SAT Practice Test",
    description: "A comprehensive practice test for SAT preparation",
    timeLimit: 65,
    totalPoints: 100,
    lastModified: new Date().toISOString().split('T')[0]
  })
  
  const [activeSidebar, setActiveSidebar] = useState<'structure' | 'question-bank' | 'settings'>('structure')
  const [searchQuery, setSearchQuery] = useState('')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showUnsavedChanges, setShowUnsavedChanges] = useState(false)
  const [windowWidth, setWindowWidth] = useState(0)
  const [showLatexEditor, setShowLatexEditor] = useState(false)
  const [latexTarget, setLatexTarget] = useState<'question' | 'option' | 'passage'>('question')
  const [editingOptionId, setEditingOptionId] = useState<string>('')
  const [showImageUploader, setShowImageUploader] = useState(false)
  
  const [questionBank, setQuestionBank] = useState<BankQuestion[]>([
    {
      id: "bank-1",
      text: "Which expression is equivalent to 3x² + 6x - 24?",
      options: [
        { id: "a", text: "3(x² + 2x - 8)" },
        { id: "b", text: "3(x - 2)(x + 4)" },
        { id: "c", text: "3(x + 2)(x - 4)" },
        { id: "d", text: "3(x - 2)(x - 4)" }
      ],
      correctAnswer: "c",
      category: "Math",
      difficulty: "medium",
      pointValue: 5,
      tags: ["algebra", "factoring"]
    },
    {
      id: "bank-2",
      text: "What is the main rhetorical strategy used in the second paragraph?",
      options: [
        { id: "a", text: "Statistical evidence" },
        { id: "b", text: "Appeal to authority" },
        { id: "c", text: "Historical analogy" },
        { id: "d", text: "Personal anecdote" }
      ],
      correctAnswer: "b",
      passage: "The renowned physicist Stephen Hawking argued throughout his career that black holes emit radiation, despite the conventional understanding that nothing, not even light, can escape their gravitational pull. This phenomenon, now known as Hawking radiation, fundamentally changed our understanding of these cosmic entities.",
      category: "English",
      difficulty: "hard",
      pointValue: 10,
      tags: ["reading", "rhetoric"]
    },
    {
      id: "bank-3",
      text: "Which of the following best demonstrates Newton's Third Law?",
      options: [
        { id: "a", text: "A ball rolling down a hill speeds up" },
        { id: "b", text: "A rocket propelling forward by expelling gas backward" },
        { id: "c", text: "A book staying at rest on a table" },
        { id: "d", text: "A car slowing down when brakes are applied" }
      ],
      correctAnswer: "b",
      category: "Science",
      difficulty: "medium",
      pointValue: 5,
      tags: ["physics", "newton's laws"]
    },
    {
      id: "bank-4",
      text: "If cos(θ) = 0.5, what is θ in radians?",
      options: [
        { id: "a", text: "π/4" },
        { id: "b", text: "π/3" },
        { id: "c", text: "π/2" },
        { id: "d", text: "2π/3" }
      ],
      correctAnswer: "b",
      category: "Math",
      difficulty: "medium",
      pointValue: 5,
      tags: ["trigonometry"]
    },
  ])
  
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: "q1",
      text: "If x + y = 10 and x - y = 4, what is the value of x?",
      options: [
        { id: "a", text: "3" },
        { id: "b", text: "5" },
        { id: "c", text: "7" },
        { id: "d", text: "9" }
      ],
      correctAnswer: "c",
      pointValue: 5,
      tags: ["algebra", "equations"]
    },
    {
      id: "q2",
      text: "What is the main idea of the passage?",
      options: [
        { id: "a", text: "The author describes a personal experience with nature" },
        { id: "b", text: "The text explores scientific concepts" },
        { id: "c", text: "The passage presents historical events" },
        { id: "d", text: "The narrative discusses cultural trends" }
      ],
      correctAnswer: "a",
      passage: "As I wandered through the ancient forest that morning, the mist still clinging to the trees, I felt a sense of connection I had never experienced before.",
      pointValue: 10,
      tags: ["reading", "main idea"]
    }
  ])
  
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentQuestion = questions[currentIndex] || questions[0] || {
    id: "new",
    text: "",
    options: [
      { id: "a", text: "" },
      { id: "b", text: "" },
      { id: "c", text: "" },
      { id: "d", text: "" }
    ],
    correctAnswer: "a",
    pointValue: 5
  }
  
  const [questionText, setQuestionText] = useState(currentQuestion.text)
  const [passage, setPassage] = useState(currentQuestion.passage || "")
  const [options, setOptions] = useState([...currentQuestion.options])
  const [correctAnswer, setCorrectAnswer] = useState(currentQuestion.correctAnswer)
  const [pointValue, setPointValue] = useState(currentQuestion.pointValue || 5)
  const [tags, setTags] = useState<string[]>(currentQuestion.tags || [])
  const [showTime, setShowTime] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState(testMeta.timeLimit * 60) 
  const questionTextareaRef = useRef<HTMLTextAreaElement>(null)
  const passageTextareaRef = useRef<HTMLTextAreaElement>(null)
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { startUpload, isUploading } = useUploadThing("imageUploader");
  const currentQuestionRef = useRef<Question | null>(null);
  const imagesRef = useRef<Record<string, QuestionImage[]>>({});
  
  const [debugImages, setDebugImages] = useState<boolean>(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [isTestFromAnotherClass, setIsTestFromAnotherClass] = useState(false);
  
  useEffect(() => {
    setWindowWidth(window.innerWidth)
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  useEffect(() => {
    if (!timeRemaining) return
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    
    return () => clearInterval(timer)
  }, [timeRemaining])
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }
  
  const toggleTimeDisplay = () => {
    setShowTime(!showTime)
  }
  
  const selectQuestion = (index: number) => {
    saveChanges()
    
    setCurrentIndex(index)
    const question = questions[index]
    if (question) {
      console.log('Selecting question:', question.id, 'with images:', question.images)
      
      setQuestionText(question.text)
      setPassage(question.passage || "")
      setOptions([...question.options])
      setCorrectAnswer(question.correctAnswer)
      setPointValue(question.pointValue || 5)
      setTags(question.tags || [])
      
      currentQuestionRef.current = question
      
      console.log('Selected question images:', question.images)
    }
  }
  
  const saveChanges = () => {
    console.log('Saving changes for question', currentIndex);
    
    try {
      const updatedQuestions = [...questions];
      const currentQuestion = updatedQuestions[currentIndex];
      
      if (!currentQuestion) {
        console.warn('No question found at index', currentIndex);
        return;
      }
      
      console.log('Current images before update:', currentQuestion.images);
      
      updatedQuestions[currentIndex] = {
        ...currentQuestion,
        text: questionText,
        passage: passage || null,
        options: [...options],
        correctAnswer: correctAnswer,
        pointValue: pointValue,
        tags: tags,
        images: currentQuestion.images || []
      };
      
      setQuestions(updatedQuestions);
      
      currentQuestionRef.current = updatedQuestions[currentIndex];
      
      console.log('Question saved with images:', updatedQuestions[currentIndex].images);
      
      setShowUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error",
        description: "Failed to save changes to question",
        variant: "destructive"
      });
    }
  }
  
  const addNewQuestion = () => {
    const newQuestion: Question = {
      id: `q${questions.length + 1}`,
      text: "New question",
      options: [
        { id: "a", text: "Option A" },
        { id: "b", text: "Option B" },
        { id: "c", text: "Option C" },
        { id: "d", text: "Option D" }
      ],
      correctAnswer: "a",
      pointValue: 5,
      tags: []
    }
    
    const newQuestions = [...questions, newQuestion]
    setQuestions(newQuestions)
    setCurrentIndex(newQuestions.length - 1)
    setQuestionText(newQuestion.text)
    setPassage("")
    setOptions([...newQuestion.options])
    setCorrectAnswer(newQuestion.correctAnswer)
    setPointValue(5)
    setTags([])
  }
  
  const updateOption = (id: string, text: string) => {
    const newOptions = options.map(opt => 
      opt.id === id ? { ...opt, text } : opt
    )
    setOptions(newOptions)
    setShowUnsavedChanges(true)
  }
  
  const prevQuestion = () => {
    if (currentIndex > 0) {
      selectQuestion(currentIndex - 1)
    }
  }
  
  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      selectQuestion(currentIndex + 1)
    }
  }
  
  const handlePaste = async (e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageItems = Array.from(items).filter(item => item.type.startsWith('image/'));
    if (imageItems.length === 0) return;

    e.preventDefault();
    
    const imageItem = imageItems[0];
    const blob = imageItem.getAsFile();
    if (!blob) {
      toast({
        title: "Error",
        description: "Failed to process pasted image",
        variant: "destructive"
      });
      return;
    }

    setUploadingImage(true);
    
    try {
      const file = new File([blob], `pasted-image-${Date.now()}.${blob.type.split('/')[1] || 'png'}`, {
        type: blob.type
      });
      
      const uploadResult = await startUpload([file]);
      
      if (!uploadResult || uploadResult.length === 0) {
        throw new Error("Upload failed");
      }
      
      const uploadedImage = uploadResult[0];
      handleImageAdded(uploadedImage.url, uploadedImage.key);
      
      toast({
        title: "Image uploaded",
        description: "Pasted image has been uploaded and added to the question"
      });
    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Could not upload the pasted image to UploadThing",
        variant: "destructive"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageAdded = (imageUrl: string, fileKey?: string) => {
    setShowImageUploader(false);

    try {
      const newImage: QuestionImage = {
        id: `img-${Date.now()}`,
        url: imageUrl,
        alt: 'Question image',
        fileKey: fileKey || undefined
      };
      
      console.log(`⚡ Adding image to question ${currentIndex}:`, newImage);
      
      setQuestions(prevQuestions => {
        const updatedQuestions = JSON.parse(JSON.stringify(prevQuestions));
        const question = updatedQuestions[currentIndex];
        
        if (!question.images) {
          question.images = [];
        }
        
        question.images.push(newImage);
        
        console.log(`🔄 After adding image: question ${question.id} now has ${question.images.length} images`);
        
        return updatedQuestions;
      });
      
      toast({
        title: "Image added",
        description: "Don't forget to save your changes",
        duration: 4000
      });
      
      setShowUnsavedChanges(true);
      
    } catch (error) {
      console.error('Error adding image:', error);
      toast({
        title: "Error",
        description: "Failed to add image",
        variant: "destructive"
      });
    }
  };
  
  const removeImage = (imageId: string) => {
    try {
      const updatedQuestions = [...questions];
      const questionToUpdate = { ...updatedQuestions[currentIndex] };
      if (questionToUpdate.images && questionToUpdate.images.length > 0) {
        questionToUpdate.images = questionToUpdate.images.filter(img => img.id !== imageId);
        
        updatedQuestions[currentIndex] = questionToUpdate;
        
        setQuestions(updatedQuestions);
        
        currentQuestionRef.current = questionToUpdate;
        
        setShowUnsavedChanges(true);
        
        console.log('Image removed, updated question:', questionToUpdate);
        
        toast({
          title: "Image removed",
          description: "Image has been removed from the question"
        });
      }
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive"
      });
    }
  };
  
  const finishTest = async () => {
    saveChanges();
    
    toast({
      title: "Saving...",
      description: "Your test is being saved"
    });
    
    try {
      const testData = {
        id: testMeta.id,
        title: testMeta.title,
        description: testMeta.description,
        timeLimit: testMeta.timeLimit,
        totalPoints: testMeta.totalPoints,
        questions: questions.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          passage: q.passage || null,
          pointValue: q.pointValue || 5,
          tags: q.tags || [],
          images: q.images?.map(img => ({
            id: img.id,
            url: img.url,
            alt: img.alt || 'Question image',
            fileKey: img.fileKey
          })) || []
        }))
      };
      
      const endpoint = testMeta.id === "new-test" 
        ? `/api/classes/${classId}/tests` 
        : `/api/classes/${classId}/tests/${testMeta.id}`;
        
      const response = await fetch(endpoint, {
        method: testMeta.id === "new-test" ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save test');
      }
      
      const data = await response.json();
      
      toast({ 
        title: "Success", 
        description: "Test saved successfully" 
      });
      
      if (testMeta.id === "new-test" && data.testId) {
        setTestMeta(prev => ({
          ...prev,
          id: data.testId
        }));
      }
      
      setShowUnsavedChanges(false);
      
    } catch (error) {
      console.error('Error saving test:', error);
      toast({ 
        title: "Error", 
        description: "Failed to save test. Please try again.", 
        variant: "destructive" 
      });
    }
  }
  
  const openLatexEditor = (target: 'question' | 'option' | 'passage', optionId?: string) => {
    setLatexTarget(target)
    if (target === 'option' && optionId) {
      setEditingOptionId(optionId)
    }
    setShowLatexEditor(true)
  }
  
  const handleLatexInsert = (latex: string) => {
    const wrappedLatex = `$${latex}$`
    
    if (latexTarget === 'question') {
      setQuestionText(prev => prev + ' ' + wrappedLatex)
    } else if (latexTarget === 'passage') {
      setPassage(prev => prev + ' ' + wrappedLatex)
    } else if (latexTarget === 'option' && editingOptionId) {
      const newOptions = options.map(opt => 
        opt.id === editingOptionId ? { ...opt, text: opt.text + ' ' + wrappedLatex } : opt
      )
      setOptions(newOptions)
    }
    
    setShowUnsavedChanges(true)
  }
  
  const renderWithLatex = (text: string) => {
    if (!text) return null
    
    if (text.includes('[IMG:') || text.includes('@http')) {
      const componentParts = [];
      let currentIndex = 0;
      
      const regex = /(\$[^\$]+\$)|(\[IMG:([^\]]+)\])|(@(https?:\/\/[^\s]+))/g;
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        if (match.index > currentIndex) {
          componentParts.push(<span key={`text-${match.index}`}>{text.substring(currentIndex, match.index)}</span>);
        }
        
        if (match[1]) {
          const latex = match[1].substring(1, match[1].length - 1);
          componentParts.push(<LatexRenderer key={`latex-${match.index}`} latex={latex} />);
        } else if (match[2]) {
          const imageUrl = match[3];
          componentParts.push(
            <img 
              key={`img-${match.index}`}
              src={imageUrl} 
              alt="Question image" 
              className="max-w-full h-auto rounded-md my-2"
            />
          );
        } else if (match[4]) {
          const imageUrl = match[5];
          componentParts.push(
            <img 
              key={`img-${match.index}`}
              src={imageUrl} 
              alt="Question image" 
              className="max-w-full h-auto rounded-md my-2"
              onError={(e) => {
                console.error('Error loading image:', imageUrl);
                e.currentTarget.src = 'https://placehold.co/400x300?text=Image+Error';
              }}
            />
          );
        }
        
        currentIndex = match.index + match[0].length;
      }
      
      if (currentIndex < text.length) {
        componentParts.push(<span key={`text-end`}>{text.substring(currentIndex)}</span>);
      }
      
      return <>{componentParts}</>;
    }
    
    const textParts = text.split(/(\$[^\$]+\$)/g)
    
    return textParts.map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        const latex = part.substring(1, part.length - 1)
        return <LatexRenderer key={index} latex={latex} />
      }
      return <span key={index}>{part}</span>
    })
  }
  
  const shortcuts: ShortcutKey[] = [
    { key: 'n', description: 'Add New Question', action: addNewQuestion, combo: ['Alt'] },
    { key: 's', description: 'Save Changes', action: saveChanges, combo: ['Ctrl'] },
    { key: 'ArrowRight', description: 'Next Question', action: nextQuestion },
    { key: 'ArrowLeft', description: 'Previous Question', action: prevQuestion },
    { key: '1', description: 'Set Correct Answer A', action: () => setCorrectAnswer('a'), combo: ['Alt'] },
    { key: '2', description: 'Set Correct Answer B', action: () => setCorrectAnswer('b'), combo: ['Alt'] },
    { key: '3', description: 'Set Correct Answer C', action: () => setCorrectAnswer('c'), combo: ['Alt'] },
    { key: '4', description: 'Set Correct Answer D', action: () => setCorrectAnswer('d'), combo: ['Alt'] },
    { key: 'b', description: 'Toggle Question Bank', action: () => setActiveSidebar(s => s === 'question-bank' ? 'structure' : 'question-bank'), combo: ['Alt'] },
    { key: 'p', description: 'Toggle Test Settings', action: () => setActiveSidebar(s => s === 'settings' ? 'structure' : 'settings'), combo: ['Alt'] },
    { key: '?', description: 'Show Shortcuts', action: () => setShowShortcuts(true) },
  ]
  
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (
      e.target instanceof HTMLTextAreaElement || 
      e.target instanceof HTMLInputElement
    ) {
      return
    }
    
    if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault()
      setShowShortcuts(true)
      return
    }
    
    const matchingShortcut = shortcuts.find(shortcut => {
      if (shortcut.key !== e.key) return false
      
      if (shortcut.combo) {
        if (shortcut.combo.includes('Ctrl') && !e.ctrlKey) return false
        if (shortcut.combo.includes('Alt') && !e.altKey) return false
        if (shortcut.combo.includes('Shift') && !e.shiftKey) return false
        return true
      }
      
      return !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey
    })
    
    if (matchingShortcut) {
      e.preventDefault()
      matchingShortcut.action()
    }
  }
  
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault()
        setShowShortcuts(true)
        return
      }
    }
    
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])
  
  const addFromBank = (bankQuestion: BankQuestion) => {
    const { category, difficulty, lastUsed, ...questionData } = bankQuestion
    
    saveChanges()
    
    const newQuestion: Question = {
      ...questionData,
      id: `q${questions.length + 1}`,
    }
    
    const newQuestions = [...questions, newQuestion]
    setQuestions(newQuestions)
    
    selectQuestion(newQuestions.length - 1)
    
    setActiveSidebar('structure')
  }
  
  const filteredBankQuestions = questionBank.filter(q => {
    if (!searchQuery) return true
    return (
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })
  
  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'hard': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const calculateTotalPoints = () => {
    return questions.reduce((total, q) => total + (q.pointValue || 5), 0);
  };

  const saveTest = async () => {
    if (!testMeta.title) {
      toast({
        title: "Title Required",
        description: "Please provide a title for your test",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    
    try {
      saveChanges();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const testData = {
        ...testMeta,
        totalPoints: calculateTotalPoints(),
        questions: questions.map(q => {
          console.log('Processing question images:', q.images);
          
          return {
            id: q.id,
            text: q.text,
            options: q.options,
            correctAnswer: q.correctAnswer,
            passage: q.passage || null,
            pointValue: q.pointValue || 5,
            tags: q.tags || [],
            images: Array.isArray(q.images) ? q.images.map(img => ({
              id: img.id,
              url: img.url,
              alt: img.alt || 'Question image',
              fileKey: img.fileKey
            })) : []
          };
        }),
        lastModified: new Date().toISOString()
      };
      
      console.log('Saving test with images:', JSON.stringify(testData.questions.map(q => q.images)));
      
      const shouldCreateNewTest = testMeta.id === "new-test" || isTestFromAnotherClass;
      
      if (!shouldCreateNewTest && testMeta.id) {
        const response = await fetch(`/api/classes/${classId}/tests/${testMeta.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update test');
        }
        
        toast({
          title: "Success!",
          description: "Test updated successfully with images",
        });
      } 
      else {
        const response = await fetch(`/api/classes/${classId}/tests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create test');
        }
        
        const data = await response.json();
        
        if (data.success && data.testId) {
          setTestMeta(prev => ({
            ...prev,
            id: data.testId
          }));
          setIsTestFromAnotherClass(false);
        }
        
        toast({
          title: "Success!",
          description: isTestFromAnotherClass ? 
            "Test copied successfully to this class" : 
            "Test created successfully with images",
        });
      }
      
      setShowUnsavedChanges(false);
      
    } catch (error: any) {
      console.error('Error saving test:', error);
      toast({
        title: "Error",
        description: `Failed to save test: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const loadTest = async (testId: string) => {
    setLoading(true);
    
    try {
      console.log(`Loading test with ID: ${testId}`);
      
      const response = await fetch(`/api/classes/${classId}/tests/${testId}`);
      if (!response.ok) {
        throw new Error(`Error fetching test: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Loaded test data:', data);
      
      if (data.success && data.test) {
        setIsTestFromAnotherClass(data.test.classId !== classId);
        
        if (data.test.classId !== classId) {
          console.log('Test is from another class! Will create a copy when saving.');
          setTestMeta({
            id: "new-test",
            title: `${data.test.title} (Copy)`,
            description: data.test.description || '',
            timeLimit: data.test.timeLimit || 60,
            totalPoints: data.test.totalPoints || 100,
            lastModified: new Date().toISOString().split('T')[0]
          });
        } else {
          setTestMeta({
            id: data.test._id || data.test.id,
            title: data.test.title || '',
            description: data.test.description || '',
            timeLimit: data.test.timeLimit || 60,
            totalPoints: data.test.totalPoints || 100,
            lastModified: data.test.lastModified || new Date().toISOString().split('T')[0]
          });
        }
        
        if (data.test.questions && Array.isArray(data.test.questions)) {
          const hasImages = data.test.questions.some((q: any) => q.images && Array.isArray(q.images) && q.images.length > 0);
          console.log('Test has questions with images:', hasImages);
          
          const processedQuestions = data.test.questions.map((q: any) => {
            console.log(`Processing question ${q.id}, images:`, q.images);
            const processedQuestion = {
              id: q.id || `q${Date.now()}${Math.random().toString(36).substring(2, 7)}`,
              text: q.text || '',
              options: q.options || [
                { id: "a", text: "Option A" },
                { id: "b", text: "Option B" },
                { id: "c", text: "Option C" },
                { id: "d", text: "Option D" }
              ],
              correctAnswer: q.correctAnswer || 'a',
              passage: q.passage || null,
              pointValue: q.pointValue || 5,
              tags: q.tags || [],
              images: Array.isArray(q.images) ? q.images.map((img: any) => ({
                id: img.id || `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                url: img.url,
                alt: img.alt || 'Question image',
                fileKey: img.fileKey
              })) : []
            };
            
            return processedQuestion;
          });
          
          console.log('Processed questions with images:', processedQuestions);
          setQuestions(processedQuestions);
          
          setCurrentIndex(0);
          const firstQuestion = processedQuestions[0];
          if (firstQuestion) {
            setQuestionText(firstQuestion.text || '');
            setPassage(firstQuestion.passage || '');
            setOptions(firstQuestion.options || [
              { id: "a", text: "Option A" },
              { id: "b", text: "Option B" },
              { id: "c", text: "Option C" },
              { id: "d", text: "Option D" }
            ]);
            setCorrectAnswer(firstQuestion.correctAnswer || 'a');
            setPointValue(firstQuestion.pointValue || 5);
            setTags(firstQuestion.tags || []);
          }
        }
        
        setShowUnsavedChanges(false);
      } else {
        throw new Error('Invalid test data');
      }
    } catch (error) {
      console.error('Error loading test:', error);
      toast({
        title: "Error",
        description: "Failed to load test. Please try again.",
        variant: "destructive"
      });
      
      router.push(`/assignments/${classId}/test-selection`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const testId = searchParams.get('testId');
    
    if (testId && testId !== 'new-test') {
      loadTest(testId);
    }
  }, []);
  
  const deleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast({
        title: "Error",
        description: "Cannot delete the last question. Tests must have at least one question.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete question ${index + 1}?`)) {
      return;
    }

    saveChanges();

    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    
    if (index === currentIndex) {
      const newIndex = index > 0 ? index - 1 : 0;
      setCurrentIndex(newIndex);
      
      const newCurrentQuestion = updatedQuestions[newIndex];
      if (newCurrentQuestion) {
        setQuestionText(newCurrentQuestion.text);
        setPassage(newCurrentQuestion.passage || "");
        setOptions([...newCurrentQuestion.options]);
        setCorrectAnswer(newCurrentQuestion.correctAnswer);
        setPointValue(newCurrentQuestion.pointValue || 5);
        setTags(newCurrentQuestion.tags || []);
      }
    } else if (index < currentIndex) {
      setCurrentIndex(currentIndex - 1);
    }
    
    toast({
      title: "Question deleted",
      description: `Question ${index + 1} has been removed from the test.`
    });
  }
  
  useEffect(() => {
    if (questions[currentIndex]) {
      console.log("Current question index changed:", currentIndex);
      console.log("Current question has images:", questions[currentIndex].images);
    }
  }, [currentIndex, questions]);
  
  useEffect(() => {
    if (currentIndex >= 0 && questions[currentIndex]) {
      const currentQuestion = questions[currentIndex];
      const imageCount = currentQuestion.images?.length || 0;
      if (imageCount > 0) {
        console.log(`Question ${currentIndex} has ${imageCount} images:`, currentQuestion.images);
      }
    }
  }, [questions, currentIndex]);
  
  const debugCurrentImages = () => {
    if (currentIndex >= 0 && questions.length > currentIndex) {
      const currentQuestion = questions[currentIndex];
      const imageCount = currentQuestion.images?.length || 0;
      console.log(`Question ${currentIndex} has ${imageCount} images:`, currentQuestion.images);
      toast({
        title: "Image Debug Info",
        description: `Question ${currentIndex + 1} has ${imageCount} images.`
      });
    }
  };
  
  useEffect(() => {
    const newImagesRef: Record<string, QuestionImage[]> = {};
    
    if (questions && questions.length > 0) {
      questions.forEach(question => {
        newImagesRef[question.id] = question.images ? [...question.images] : [];
      });
    }
    
    imagesRef.current = newImagesRef;
  }, [questions]);
  
  return (
    <div className="min-h-screen bg-white flex flex-col pt-20 font-sans" onKeyDown={handleKeyDown} onPaste={handlePaste}>
      <div className="w-full h-[0.25vh] flex">
        {Array(windowWidth < 768 ? 20 : 50).fill(0).map((_, i) => (
          <div key={i} className="h-full grow flex items-center">
            <div className={`h-full grow ${
              i % 4 === 0 ? 'bg-[#009CDE]' : 
              i % 4 === 1 ? 'bg-[#FEDB00]' : 
              i % 4 === 2 ? 'bg-[#3c3c3c]' : 
              'bg-[#3350C4]'
            }`}></div>
            <div className="w-1 h-full bg-transparent"></div>
          </div>
        ))}
      </div>
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              className="text-gray-600 hover:text-gray-900" 
              onClick={() => router.push(`/assignments/${classId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex flex-col">
              <div className="relative group">
                <Input
                  value={testMeta.title}
                  onChange={(e) => setTestMeta({...testMeta, title: e.target.value})}
                  className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 w-auto max-w-md pr-7 group-hover:bg-gray-50"
                  placeholder="Enter test title..."
                />
                <Pencil className="h-4 w-4 text-gray-400 absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{questions.length} questions</span>
                <span>|</span>
                <div className="flex items-center gap-1 hover:text-gray-700 cursor-pointer"
                     onClick={() => setActiveSidebar('settings')}>
                  <span>{testMeta.timeLimit} min</span>
                  <Pencil className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isTestFromAnotherClass && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 rounded-md text-xs font-medium flex items-center">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                From another class - will save as copy
              </div>
            )}
            <Button 
              onClick={saveTest}
              className="bg-blue-800 hover:bg-blue-700 text-white" 
              disabled={saving}
            >
              {saving ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                Saving...
              </>
              ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            <button 
              className={`mr-3 py-3 px-4 ${
                activeSidebar === 'structure' 
                  ? 'border-b-2 border-blue-600 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveSidebar('structure')}
            >
              <span className="flex items-center">
                <List className="h-4 w-4 mr-2" />
                Questions
              </span>
            </button>
            <button 
              className={`mr-3 py-3 px-4 ${
                activeSidebar === 'question-bank' 
                  ? 'border-b-2 border-blue-600 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveSidebar('question-bank')}
            >
              <span className="flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Question Bank
              </span>
            </button>
            <button 
              className={`mr-3 py-3 px-4 ${
                activeSidebar === 'settings' 
                  ? 'border-b-2 border-blue-600 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveSidebar('settings')}
            >
              <span className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Test Settings
              </span>
            </button>
          </div>
        </div>
      </div>
      <div className="flex-grow">
        <div className="container mx-auto px-4 h-full pt-6">
          {activeSidebar === 'settings' ? (
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Test Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
                  <Input
                    value={testMeta.title}
                    onChange={(e) => setTestMeta({...testMeta, title: e.target.value})}
                    className="w-full"
                    placeholder="Enter test title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Textarea
                    value={testMeta.description}
                    onChange={(e) => setTestMeta({...testMeta, description: e.target.value})}
                    className="w-full"
                    placeholder="Enter test description..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Limit (minutes)</label>
                  <Input
                    type="number"
                    value={testMeta.timeLimit}
                    onChange={(e) => setTestMeta({...testMeta, timeLimit: parseInt(e.target.value) || 0})}
                    className="w-full"
                    min="1"
                    max="240"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Points</label>
                  <div className="text-gray-700 py-2 px-3 border border-gray-200 bg-gray-50 rounded-md">
                    {calculateTotalPoints()} points
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    onClick={() => {
                      setActiveSidebar('structure');
                      saveChanges();
                      setShowUnsavedChanges(true);
                    }}
                    className="bg-blue-800 hover:bg-blue-700 text-white"
                  >
                    Apply Settings
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row h-full">
              <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 py-3 md:py-6 px-3 md:px-6 md:pr-8 overflow-y-auto md:h-full">
                {activeSidebar === 'structure' ? (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h2 className="font-medium text-gray-700">Questions</h2>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={addNewQuestion}
                        className="border-gray-300"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                    <div className="grid grid-cols-8 gap-2 mb-6">
                      {questions.map((q, idx) => (
                        <div key={q.id} className="relative group">
                          <button
                            className={`p-2 aspect-square flex flex-col items-center justify-center rounded-md text-sm border ${
                              idx === currentIndex 
                                ? 'bg-blue-800 border-blue-900 text-white' 
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                            onClick={() => selectQuestion(idx)}
                          >
                            <span>{idx + 1}</span>
                            {q.pointValue && (
                              <span className="mt-1 text-[9px] opacity-75">{q.pointValue}pt</span>
                            )}
                          </button>
                          <button
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteQuestion(idx);
                            }}
                            title="Delete question"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                        <div className="flex items-center mb-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openLatexEditor('question')}
                            className="text-xs"
                          >
                            <Pi className="h-3 w-3 mr-1" />
                            Add LaTeX
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowImageUploader(true)}
                            className="text-xs"
                          >
                            <ImageIcon className="h-3 w-3 mr-1" />
                            Add Image
                          </Button>
                        </div>
                        <Textarea
                          ref={questionTextareaRef}
                          value={questionText}
                          onChange={(e) => {
                            setQuestionText(e.target.value)
                            setShowUnsavedChanges(true)
                          }}
                          rows={3}
                          className="w-full resize-none font-noto-serif text-[11pt] md:text-[12pt]"
                        />
                      </div>
                      {questions[currentIndex]?.images && questions[currentIndex].images?.length > 0 && (
                        <div className="mt-4 mb-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Question Images ({questions[currentIndex].images.length})
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            {questions[currentIndex].images.map((image, index) => (
                              <div key={image.id || index} className="relative rounded-md overflow-hidden border border-gray-200 group">
                                <img 
                                  src={image.url} 
                                  alt={image.alt || 'Question image'} 
                                  className="w-full h-auto object-cover aspect-video"
                                  onLoad={() => console.log(`Image loaded: ${image.url}`)}
                                  onError={(e) => {
                                    console.error('Error loading image:', image.url);
                                    e.currentTarget.src = 'https://placehold.co/400x300?text=Image+Error';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                                  <button
                                    onClick={() => removeImage(image.id)}
                                    className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black opacity-70 hover:opacity-100"
                                    aria-label="Remove image"
                                    title="Remove image"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                                  {image.url.split('/').pop()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reading Passage (optional)</label>
                        <div className="flex items-center mb-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openLatexEditor('passage')}
                            className="text-xs"
                          >
                            <Pi className="h-3 w-3 mr-1" />
                            Add LaTeX
                          </Button>
                        </div>
                        <Textarea
                          ref={passageTextareaRef}
                          value={passage}
                          onChange={(e) => {
                            setPassage(e.target.value)
                            setShowUnsavedChanges(true)
                          }}
                          rows={5}
                          placeholder="Enter passage text here..."
                          className="w-full font-noto-serif text-[11pt] md:text-[12pt]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                        <div className="space-y-3">
                          {options.map((option, index) => {
                            const letter = String.fromCharCode(65 + index); 
                            
                            return (
                              <div key={option.id} className="border border-gray-200 rounded-md overflow-hidden">
                                <div className="flex items-center bg-gray-50 px-3 py-1.5 border-b border-gray-200">
                                  <div 
                                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 cursor-pointer
                                      ${correctAnswer === option.id ? 'bg-blue-800 text-white' : 'bg-white border border-gray-300'}`}
                                    onClick={() => {
                                      setCorrectAnswer(option.id);
                                      setShowUnsavedChanges(true);
                                    }}
                                  >
                                    <span className="font-bold text-xs">{letter}</span>
                                  </div>
                                  <span className="text-sm text-gray-700">Option {letter}</span>
                                  <div className="ml-auto flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0"
                                      onClick={() => openLatexEditor('option', option.id)}
                                      title="Add LaTeX"
                                    >
                                      <Pi className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                                <Textarea
                                  value={option.text}
                                  onChange={(e) => updateOption(option.id, e.target.value)}
                                  rows={2}
                                  className="w-full border-0 focus-visible:ring-0 resize-none"
                                  placeholder={`Enter text for option ${letter}...`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-1/2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Point Value</label>
                          <div className="flex items-center">
                            <button 
                              onClick={() => {
                                if (pointValue > 1) {
                                  setPointValue(pointValue - 5)
                                  setShowUnsavedChanges(true)
                                }
                              }} 
                              className="h-8 w-8 rounded-l border border-gray-300 flex items-center justify-center text-gray-500"
                            >
                              -
                            </button>
                            <Input 
                              type="number" 
                              value={pointValue} 
                              onChange={(e) => {
                                setPointValue(Number(e.target.value) || 1)
                                setShowUnsavedChanges(true)
                              }}
                              className="h-8 text-center border-x-0 rounded-none w-20"
                              min={1}
                            />
                            <button 
                              onClick={() => {
                                setPointValue(pointValue + 5)
                                setShowUnsavedChanges(true)
                              }} 
                              className="h-8 w-8 rounded-r border border-gray-300 flex items-center justify-center text-gray-500"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="w-1/2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                          <Input 
                            placeholder="Add tags, comma separated" 
                            value={tags.join(', ')} 
                            onChange={(e) => {
                              setTags(e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))
                              setShowUnsavedChanges(true)
                            }}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="font-medium text-gray-700">Question Bank</h2>
                      <Input 
                        type="search"
                        placeholder="Search..." 
                        className="w-40"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <hr className="border-t border-gray-200" />
                    <div className="space-y-4">
                      {questionBank
                        .filter(q => 
                          q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (q.tags && q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
                        )
                        .map(q => (
                          <div key={q.id} className="border border-gray-200 rounded-md p-3 bg-white hover:border-gray-300">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium mb-1 line-clamp-2">{q.text}</div>
                                <div className="flex items-center text-xs text-gray-500 mb-2">
                                  <span className="flex items-center gap-1 mr-3">
                                    <ListChecks className="w-3 h-3" />
                                    {q.options.length} options
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded-sm text-white ${getDifficultyColor(q.difficulty)}`}>
                                    {q.difficulty}
                                  </span>
                                  {q.category && (
                                    <span className="ml-2 px-1.5 py-0.5 rounded-sm bg-gray-100">
                                      {q.category}
                                    </span>
                                  )}
                                </div>
                                {q.tags && q.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {q.tags.map(tag => (
                                      <span key={tag} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-sm">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addFromBank(q)}
                                className="shrink-0 ml-2 text-xs h-7"
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
              <div className="w-full md:w-2/3 py-3 md:py-6 px-3 md:px-6 md:pl-8 overflow-y-auto h-[calc(60vh-10rem)] md:h-full">
                <div className="flex items-center mb-[0.1vh]">
                  <div className="flex items-center justify-center">
                    <div className="bg-black text-white w-8 h-8 md:w-10 md:h-10 flex items-center justify-center font-bold text-sm md:text-base">
                      {currentIndex + 1}
                    </div>
                  </div>
                  <div className="ml-2 md:ml-4 text-gray-600 flex items-center gap-2">
                    <span className="text-xs md:text-sm">Question Preview</span>
                    {currentQuestion.pointValue && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {currentQuestion.pointValue} points
                      </span>
                    )}
                  </div>
                  <div className="ml-auto flex">
                    <button className="relative flex items-center justify-center rounded-md w-7 h-7 md:w-9 md:h-9 border border-gray-200 bg-white text-gray-800">
                      <MoreVertical className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                
                <div className="w-full flex mb-4">
                  {Array(windowWidth < 768 ? 15 : 25).fill(0).map((_, i) => (
                    <div key={i} className="h-[2px] grow flex items-center">
                      <div className={`h-full grow ${
                        i % 4 === 0 ? 'bg-[#009CDE]' : 
                        i % 4 === 1 ? 'bg-[#FEDB00]' : 
                        i % 4 === 2 ? 'bg-[#3c3c3c]' : 
                        'bg-[#3350C4]'
                      }`}></div>
                      <div className="w-1 h-full bg-transparent"></div>
                    </div>
                  ))}
                </div>
                {passage && (
                  <div className="mb-6">
                    <div className="font-noto-serif text-[11pt] md:text-[12pt] leading-relaxed text-black">
                      <p className="whitespace-pre-line mb-4">{renderWithLatex(passage)}</p>
                    </div>
                  </div>
                )}
                {questions[currentIndex]?.images && questions[currentIndex].images?.length > 0 && (
                  <div className="mt-4 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Images ({questions[currentIndex].images.length})
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {questions[currentIndex].images.map((image, index) => (
                        <div key={image.id || index} className="relative rounded-md overflow-hidden border border-gray-200 group">
                          <img 
                            src={image.url} 
                            alt={image.alt || 'Question image'} 
                            className="w-full h-auto object-cover aspect-video"
                            onLoad={() => console.log(`Image loaded: ${image.url}`)}
                            onError={(e) => {
                              console.error('Error loading image:', image.url);
                              e.currentTarget.src = 'https://placehold.co/400x300?text=Image+Error';
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                            <button
                              onClick={() => removeImage(image.id)}
                              className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black opacity-70 hover:opacity-100"
                              aria-label="Remove image"
                              title="Remove image"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                            {image.url.split('/').pop()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mb-6 md:mb-8">
                  <h2 className="font-noto-serif text-[11pt] md:text-[12pt] mb-4 md:mb-6 text-black leading-relaxed">
                    {renderWithLatex(questionText)}
                  </h2>
                  <div className="space-y-2">
                    {options.map((option, index) => {
                      const letter = String.fromCharCode(65 + index); 
                      
                      return (
                        <div key={option.id} className="flex items-center">
                          <div 
                            className={`flex items-center border rounded-lg py-2 md:py-3 px-3 md:px-4 cursor-pointer w-full ${
                              correctAnswer === option.id 
                                ? 'border-[#3350C4] border-[0.15rem] bg-blue-50' 
                                : 'border-gray-300'
                            }`}
                            onClick={() => {
                              setCorrectAnswer(option.id);
                              setShowUnsavedChanges(true);
                            }}
                          >
                            <div 
                              className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center mr-2 md:mr-3 ${
                                correctAnswer === option.id 
                                  ? 'bg-[#3350C4] text-white' 
                                  : 'bg-white border border-gray-400'
                              }`}
                            >
                              <span className="font-bold text-xs md:text-sm">
                                {letter}
                              </span>
                            </div>
                            <span className="font-noto-serif text-[11pt] md:text-[12pt] text-black flex-1">
                              {renderWithLatex(option.text)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white border-t border-gray-200 py-3 md:py-4">
        <div className="container mx-auto px-3 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 hidden md:flex items-center space-x-2">
              <KeyboardIcon className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">Press ? for shortcuts</span>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-black text-white font-medium px-3 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm">
                Question {currentIndex + 1} of {questions.length}
              </div>
            </div>
            <div className="flex-1 flex justify-end space-x-2 md:space-x-3">
              <Button
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                className="bg-blue-800 hover:bg-blue-900 text-white rounded-full px-5 py-5 text-xs md:text-sm md:px-6 md:py-6"
              >
                Previous
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={currentIndex === questions.length - 1}
                className="bg-blue-800 hover:bg-blue-900 text-white rounded-full px-5 py-5 text-xs md:text-sm md:px-6 md:py-6"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
              <button 
                onClick={() => setShowShortcuts(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 mb-4">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-700">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.combo?.includes('Ctrl') && (
                      <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-xs">Ctrl</span>
                    )}
                    {shortcut.combo?.includes('Alt') && (
                      <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-xs">Alt</span>
                    )}
                    {shortcut.combo?.includes('Shift') && (
                      <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-xs">Shift</span>
                    )}
                    <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-xs">
                      {shortcut.key === 'ArrowLeft' ? '←' :
                       shortcut.key === 'ArrowRight' ? '→' :
                       shortcut.key === 'ArrowUp' ? '↑' :
                       shortcut.key === 'ArrowDown' ? '↓' :
                       shortcut.key}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-gray-200">
              <Button 
                onClick={() => setShowShortcuts(false)}
                className="w-full bg-blue-800 hover:bg-blue-900 text-white"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
      <LaTexEditorDialog 
        isOpen={showLatexEditor}
        onClose={() => setShowLatexEditor(false)}
        onInsert={handleLatexInsert}
        initialValue=""
      />
      {showImageUploader && (
        <Dialog open={showImageUploader} onOpenChange={setShowImageUploader}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Image</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 space-y-4">
                <Upload className="h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Upload a file from your device
                </p>
                <p className="text-xs text-gray-400">
                  JPG, PNG and GIF files are supported
                </p>
                <div className="w-full">
                  <ImageUploader 
                    onImageAdded={(url, fileKey) => {
                      handleImageAdded(url, fileKey);
                    }}
                  />
                </div>
                <div className="w-full pt-4 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-500 mt-2">or</p>
                  <p className="text-sm text-blue-600 mt-1">Enter an image URL</p>
                  <Input 
                    placeholder="https://example.com/image.jpg"
                    className="mt-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.currentTarget as HTMLInputElement;
                        const url = input.value.trim();
                        if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                          handleImageAdded(url);
                          input.value = '';
                        } else {
                          toast({
                            title: "Invalid URL",
                            description: "Please enter a valid URL starting with http:// or https://",
                            variant: "destructive"
                          });
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImageUploader(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {(uploadingImage || isUploading) && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-100 text-blue-800 py-2 px-4 flex items-center justify-center">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>Uploading image...</span>
        </div>
      )}
      <Toaster />
    </div>
  )
} 