"use client"

import Link from "next/link"
import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Hash, MessageSquare, Clock, Users, Settings, Send, Paperclip, ArrowLeft, FileText, Plus, Menu, X as XIcon, Copy, RefreshCw, MoreVertical, ChevronDown, Check, Pencil, BarChart3 } from "lucide-react"
import { Grid, GridItem } from "@/components/grid"
import { useParams, useRouter } from "next/navigation"
import { useClasses } from "@/hooks/useClasses"
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSession } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IClass } from '@/models/Class'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Member {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface Instructor extends Member {
  role: 'instructor';
}

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  channel: string;
  createdAt: string;
  assignment?: {
    _id: string;
    title: string;
    description: string;
    dueDate: string;
    type: string;
  }
}

interface InviteInfo {
  invitationCode: string;
  expires: string;
}

interface ClassData {
  _id: string;
  name: string;
  description: string;
  instructor: {
    id: string;
    name: string;
  };
  members: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  invitationCode?: string;
  invitationCodeExpires?: string;
}

interface Question {
  id: string;
  text: string;
  options?: string[];
  correctAnswer?: string;
  category?: string;
}

interface Test {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  timeLimit?: number;
}

interface TestEmbedProps {
  testData: {
    id: string;
    title: string;
    description: string;
    questionCount: number;
    timeLimit?: number;
    originalTestId?: string;
  };
  classId: string;
  isInstructor: boolean;
  router: any;
}

interface TestResultData {
  testId: string;
  score: number;
  correctCount: number;
  totalCount: number;
  completedAt: string;
}

function TestEmbed({ testData, classId, isInstructor, router }: TestEmbedProps) {
  const [checkingResults, setCheckingResults] = useState(false);
  const [testResults, setTestResults] = useState<TestResultData | null>(null);
  const uniqueInstanceId = useRef(Math.random().toString(36).substring(2, 9)); 
  
  useEffect(() => {
    const fetchTestResults = async () => {
      if (isInstructor) return;
      
      try {
        setCheckingResults(true);
        
        const testId = String(testData.id);
        
        const timestamp = Date.now();
        const uniqueParam = Math.random().toString(36).substring(2, 15);
        const url = `/api/classes/${classId}/tests/${testId}/results?_t=${timestamp}&uniq=${uniqueParam}`;
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && 
              data.results && 
              data.results.testId === testId && 
              data.results.completedAt) {
            setTestResults(data.results);
          } else {
            setTestResults(null);
          }
        } else {
          setTestResults(null);
        }
      } catch (error) {
        setTestResults(null);
      } finally {
        setCheckingResults(false);
      }
    };
    
    fetchTestResults();
    
    return () => {
      setTestResults(null);
      setCheckingResults(false);
    };
  }, [isInstructor, classId, testData.id]);
  
  const hasTestBeenAttempted = () => {
    const testId = String(testData.id);
    
    const hasResults = testResults !== null && 
           typeof testResults === 'object' &&
           testResults.completedAt !== undefined && 
           testResults.testId !== undefined && 
           String(testResults.testId) === testId && 
           typeof testResults.score === 'number';
    
    return hasResults;
  };
  
  const getTestScore = () => {
    return testResults?.score || 0;
  };
  
  return (
    <div className="border rounded-md p-3 bg-blue-50 border-blue-200">
      <div className="flex items-center gap-2 mb-2">
        <FileText className="h-4 w-4 text-blue-600" />
        <span className="font-medium text-blue-800">{testData.title}</span>
      </div>
      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{testData.description}</p>
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {testData.questionCount} questions
        </span>
        {testData.timeLimit && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {testData.timeLimit} minutes
          </span>
        )}
        
        {hasTestBeenAttempted() && (
          <span className="flex items-center gap-1 bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
            <Check className="h-3 w-3" />
            Score: {getTestScore()}%
          </span>
        )}
      </div>
      
      {checkingResults ? (
        <div className="mt-2 flex items-center text-xs text-blue-600">
          <div className="h-3 w-3 rounded-full border-2 border-t-transparent border-blue-600 animate-spin mr-2"></div>
          Checking status...
        </div>
      ) : (
        <>
          {hasTestBeenAttempted() ? (
            <div className="mt-2 flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => router.push(`/test/${testData.id}/results`)}
              >
                Review Answers
              </Button>
              
              {isInstructor && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => router.push(`/assignments/${classId}/test-studio?testId=${testData.id}`)}
                  >
                    Edit Test
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => router.push(`/assignments/${classId}/test-analytics/${testData.originalTestId || testData.id}`)}
                  >
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Analytics
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="mt-2 flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  if (isInstructor) {
                    router.push(`/assignments/${classId}/test-studio?testId=${testData.id}`);
                  } else {
                    localStorage.setItem('currentClassId', classId);
                    router.push(`/test/${testData.id}/full`);
                  }
                }}
              >
                {isInstructor ? "Edit Test" : "Start Test"}
              </Button>
              
              {isInstructor && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => router.push(`/assignments/${classId}/test-analytics/${testData.originalTestId || testData.id}`)}
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Analytics
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ClassPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string
  const { toast } = useToast()
  const [chatInput, setChatInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [activeChannel, setActiveChannel] = useState("general")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { classes, loading, error } = useClasses()
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { data: session } = useSession();
  const [showMemberDialog, setShowMemberDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [currentClass, setCurrentClass] = useState<ClassData>({
    _id: classId,
    name: '',
    description: '',
    instructor: {
      id: '',
      name: '',
    },
    members: [],
  });
  
  const chatEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  const [showTestMenu, setShowTestMenu] = useState(false);
  const [showTestTypeSelection, setShowTestTypeSelection] = useState(false);
  const [showTestSelection, setShowTestSelection] = useState(false);
  const [existingTests, setExistingTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [currentTestQuestions, setCurrentTestQuestions] = useState<Question[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editMessageContent, setEditMessageContent] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [channels, setChannels] = useState<string[]>(["general", "assignments", "questions"]);
  const [showAddChannelDialog, setShowAddChannelDialog] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [showDeleteChannelDialog, setShowDeleteChannelDialog] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState("");
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [showEditClassDialog, setShowEditClassDialog] = useState(false);
  const [showLeaveClassDialog, setShowLeaveClassDialog] = useState(false);
  const [editClassName, setEditClassName] = useState("");
  const [editClassDescription, setEditClassDescription] = useState("");

  const fetchChannels = async () => {
    try {
      setLoadingChannels(true);
      const response = await fetch(`/api/classes/${classId}/channels`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch channels');
      }
      
      const data = await response.json();
      if (data.success && Array.isArray(data.channels)) {
        setChannels(data.channels);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
      toast({
        title: 'Error',
        description: 'Failed to load channels',
        variant: 'destructive',
      });
    } finally {
      setLoadingChannels(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays < 7) {
      const dayOfWeek = date.toLocaleDateString([], { weekday: 'long' });
      return `${dayOfWeek} ${timeString}`;
    } 
    else if (date.getFullYear() === now.getFullYear()) {
      const dayMonth = date.toLocaleDateString([], { day: 'numeric', month: 'short' });
      return `${dayMonth} ${timeString}`;
    } 
    else {
      const fullDate = date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
      return `${fullDate} ${timeString}`;
    }
  };

  const currentClassData = classes.find(c => c.id === classId)

  useEffect(() => {
    if (!loading && !currentClassData) {
      router.push('/assignments')
    }
  }, [currentClassData, router, loading])

  useEffect(() => {
    const handleScroll = () => {
      if (!messagesContainerRef.current) return
      
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
      
      setShowScrollButton(!isAtBottom)
    }
    
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (currentClassData) {
      setEditClassName(currentClassData.name);
      setEditClassDescription(currentClassData.description);
    }
  }, [currentClassData]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const sendMessage = async () => {
    if (chatInput.trim() === "") return
    
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const optimisticMessage: Message = {
      _id: tempId,
      content: chatInput.trim(),
      sender: {
        _id: session?.user?.id || 'unknown',
        name: session?.user?.name || 'Unknown User',
        email: session?.user?.email || '',
        image: session?.user?.image || undefined,
      },
      channel: activeChannel,
      createdAt: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, optimisticMessage]);
    setChatInput("");
    setTimeout(() => scrollToBottom(), 100);
    
    try {
      console.log('Sending message to server:', {
        content: optimisticMessage.content,
        channel: activeChannel
      });
      
      const response = await fetch(`/api/classes/${classId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: optimisticMessage.content,
          channel: activeChannel,
        }),
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (!response.ok) {
        throw new Error(`Failed to send message: ${responseData.error || 'Unknown error'}`);
      }

      if (responseData.success && responseData.message) {
        console.log('Message saved successfully');
        setMessages(prev => prev.map(msg => 
          msg._id === tempId ? responseData.message : msg
        ));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }
  
  const fetchMessages = async (loadMore = false) => {
    try {
      setMessagesLoading(true);
      
      let oldestId = null;
      if (loadMore && messages.length > 0) {
        oldestId = messages[0]._id;
      }
      
      const url = `/api/classes/${classId}/messages?channel=${activeChannel}&limit=10${oldestId ? `&before=${oldestId}` : ''}`;
      
      const response = await fetch(url, { 
        cache: 'no-store' 
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.messages)) {
        console.log("Received messages:", data.messages.length);
        
        const chronologicalMessages = [...data.messages].reverse();
        
        if (loadMore) {
          const existingIds = new Set(messages.map(m => m._id));
          const messagesArray = chronologicalMessages;
          const uniqueNewMessages = messagesArray.filter(msg => !existingIds.has(msg._id));
          
          console.log("Unique new messages:", uniqueNewMessages.length);
          
          if (uniqueNewMessages.length > 0) {
            setMessages(prev => [...uniqueNewMessages, ...prev]);
          }
        } else {
          setMessages(chronologicalMessages);
        }
        
        setHasMoreMessages(data.hasMore);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive',
      });
    } finally {
      setMessagesLoading(false);
    }
  }

  useEffect(() => {
    if (currentClassData) {
      fetchMessages();
    }
  }, [currentClassData, activeChannel]);
  
  useEffect(() => {
    if (currentClassData) {
      setCurrentClass({
        _id: currentClassData.id,
        name: currentClassData.name,
        description: currentClassData.description,
        instructor: {
          id: currentClassData.instructor.id,
          name: currentClassData.instructor.name,
        },
        members: currentClassData.members.map(m => ({
          id: m.id,
          name: m.name,
          email: m.email,
        })),
        invitationCode: currentClassData.invitationCode,
        invitationCodeExpires: currentClassData.invitationCodeExpires,
      });
    }
  }, [currentClassData]);
  
  const sendTestMessage = async (content: string) => {
    try {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const optimisticMessage: Message = {
        _id: tempId,
        content,
        sender: {
          _id: session?.user?.id || 'unknown',
          name: session?.user?.name || 'Unknown User',
          email: session?.user?.email || '',
          image: session?.user?.image || undefined,
        },
        channel: activeChannel,
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      scrollToBottom();
      
      console.log('Sending test message to server:', {
        content,
        channel: activeChannel,
        type: 'test'
      });
      
      const response = await fetch(`/api/classes/${classId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          channel: activeChannel,
          type: 'test'
        }),
      });

      const responseData = await response.json();
      console.log('Server test message response:', responseData);

      if (!response.ok) {
        throw new Error(`Failed to send test message: ${responseData.error || 'Unknown error'}`);
      }
      
      if (responseData.success && responseData.message) {
        console.log('Test message saved successfully');
        setMessages(prev => prev.map(msg => 
          msg._id === tempId ? responseData.message : msg
        ));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error sending test message:', error);
      
      setMessages(prev => prev.filter(msg => !msg._id.startsWith('temp-')));
      
      toast({
        title: 'Error',
        description: 'Failed to send test message',
        variant: 'destructive',
      });
    }
  }
  
  const renderTestEmbed = (content: string) => {
    try {
      const testData = JSON.parse(content);
      if (testData.type !== 'test') return content;
      
      const isInstructor = currentClassData?.instructor.id === session?.user?.id;
      
      if (!testData.id) {
        return content;
      }
      
      return (
        <div key={`test-container-${testData.id}-${Math.random()}`}>
          <TestEmbed 
            key={`test-${testData.id}-${Math.random()}`}
            testData={testData}
            classId={classId}
            isInstructor={isInstructor}
            router={router}
          />
        </div>
      );
    } catch (error) {
      console.error('Error rendering test embed:', error);
      return content;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const testToEmbed = sessionStorage.getItem('testToEmbed');
      if (testToEmbed) {
        try {
          const testData = JSON.parse(testToEmbed);
          
          const channel = testData.channel || activeChannel;
          
          const testEmbed = {
            type: 'test',
            id: testData.id,
            title: testData.title,
            description: testData.description,
            questionCount: testData.questionCount,
            timeLimit: testData.timeLimit
          };
          
          const content = JSON.stringify(testEmbed);
          
          const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          const optimisticMessage: Message = {
            _id: tempId,
            content,
            sender: {
              _id: session?.user?.id || 'unknown',
              name: session?.user?.name || 'Unknown User',
              email: session?.user?.email || '',
              image: session?.user?.image || undefined,
            },
            channel: channel,
            createdAt: new Date().toISOString(),
          };
          
          if (channel !== activeChannel) {
            setActiveChannel(channel);
          }
          
          setMessages(prev => [...prev, optimisticMessage]);
          
          setTimeout(() => {
            if (chatEndRef.current) {
              chatEndRef.current.scrollIntoView({ behavior: "smooth" });
            }
          }, 100);
          
          (async () => {
            try {
              console.log('Embedding test from session storage:', {
                content,
                channel,
                type: 'test'
              });
              
              const response = await fetch(`/api/classes/${classId}/messages`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  content,
                  channel: channel,
                  type: 'test'
                }),
              });
              
              const responseData = await response.json();
              console.log('Server response for session storage test:', responseData);
              
              if (!response.ok) {
                throw new Error(`Failed to send message: ${responseData.error || 'Unknown error'}`);
              }
              
              if (responseData.success && responseData.message) {
                console.log('Session storage test saved successfully');
                setMessages(prev => prev.map(msg => 
                  msg._id === tempId ? responseData.message : msg
                ));
              } else {
                throw new Error('Invalid response format');
              }
            } catch (error) {
              console.error('Error sending test message from session:', error);
              
              setMessages(prev => prev.filter(msg => msg._id !== tempId));
              
              toast({
                title: 'Error',
                description: 'Failed to send test message',
                variant: 'destructive',
              });
            }
          })();
          
          sessionStorage.removeItem('testToEmbed');
        } catch (error) {
          console.error('Error embedding test from session:', error);
        }
      }
    }
  }, [classId, activeChannel, session]);

  const memoizedMessages = useMemo(() => {
    return messages.map((message) => (
      <div key={message._id} className="flex items-start gap-2 md:gap-3 mb-4">
        <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-900 flex-shrink-0">
          {getInitials(message.sender.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm md:text-base">{message.sender.name}</span>
            <span className="text-xs text-gray-500">{formatTimestamp(message.createdAt)}</span>
            
            {(session?.user?.id === message.sender._id || currentClassData?.instructor.id === session?.user?.id) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="ml-auto text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-full">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[140px]">
                  {session?.user?.id === message.sender._id && (
                    <DropdownMenuItem onClick={() => handleEditMessage(message)}>
                      <div className="flex items-center">
                        <div className="mr-2">
                          <div className="h-3.5 w-3.5 text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                          </div>
                        </div>
                        <span className="text-xs">Edit</span>
                      </div>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleDeleteMessage(message)}>
                    <div className="flex items-center text-red-600">
                      <div className="mr-2">
                        <div className="h-3.5 w-3.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </div>
                      </div>
                      <span className="text-xs">Delete</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="text-gray-700 mt-1 text-sm md:text-base">
            {message.content && message.content.startsWith('{') && message.content.includes('"type":"test"') 
              ? renderTestEmbed(message.content) 
              : message.content}
          </div>
          {message.assignment && (
            <div className="mt-2">
              <Grid columns={1} className="overflow-hidden rounded-md border border-gray-200">
                <GridItem className="p-0">
                  <div className="flex items-center px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <FileText className="h-4 w-4 text-blue-900 mr-2" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{message.assignment.title}</h3>
                        <div className={`ml-2 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                          message.assignment.type === "Math" ? "bg-blue-100 text-blue-800" :
                          message.assignment.type === "Reading" ? "bg-green-100 text-green-800" :
                          message.assignment.type === "Writing" ? "bg-orange-100 text-orange-800" :
                          "bg-purple-100 text-purple-800"
                        }`}>
                          {message.assignment.type}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{message.assignment.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Due {message.assignment.dueDate}
                      </div>
                      <Button size="sm" variant="outline" className="h-7 text-xs px-2 py-0">
                        View
                      </Button>
                    </div>
                  </div>
                </GridItem>
              </Grid>
            </div>
          )}
        </div>
      </div>
    ));
  }, [messages, session, currentClassData, renderTestEmbed]);

  if (loading) {
    return (
      <div className="bg-white text-black mt-12 md:mt-16 lg:mt-20">
        <Grid columns={1} noBorder="all" className="h-auto min-h-[calc(100vh-15rem)]">
          <GridItem className="p-0 pt-4 flex h-full">
            <div className="w-64 bg-gray-50 border-r border-gray-200 h-full overflow-hidden flex-shrink-0">
              <div className="p-4 border-b border-gray-200">
                <div className="h-4 bg-gray-200 rounded-md w-24 mb-4 animate-pulse"></div>
                <div className="flex items-center mt-4">
                  <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse mr-3"></div>
                  <div className="h-6 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                </div>
              </div>
              <div className="overflow-y-auto h-[calc(100%-5rem)]">
                <div className="px-2 py-3">
                  <div className="h-4 bg-gray-200 rounded-md w-16 mb-2 animate-pulse"></div>
                  <div className="space-y-1 mt-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-8 bg-gray-200 rounded-md w-full animate-pulse"></div>
                    ))}
                  </div>
                </div>
                <div className="px-2 pt-4">
                  <div className="h-4 bg-gray-200 rounded-md w-16 mb-2 animate-pulse"></div>
                  <div className="space-y-1 mt-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-8 bg-gray-200 rounded-md w-full animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden min-h-screen">
              <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-5 w-5 bg-gray-200 rounded-md animate-pulse mr-2"></div>
                  <div className="h-6 bg-gray-200 rounded-md w-24 animate-pulse"></div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-white relative">
                <div className="p-3 md:p-4 space-y-4 md:space-y-6">
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-start gap-2 md:gap-3 animate-pulse">
                        <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-3 bg-gray-200 rounded w-12"></div>
                          </div>
                          <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-2 md:px-4 pb-2 md:pb-4">
                <div className="bg-gray-50 rounded-lg border border-gray-200">
                  <div className="px-2 md:px-3 py-2 flex">
                    <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                  <div className="px-2 md:px-3 flex items-end">
                    <div className="w-full h-10 bg-gray-200 rounded-md animate-pulse"></div>
                  </div>
                  <div className="px-3 md:px-4 py-1.5 md:py-2 text-xs text-gray-500 border-t border-gray-100">
                    Press Enter to send
                  </div>
                </div>
              </div>
            </div>
          </GridItem>
        </Grid>
      </div>
    )
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>
  }
  
  if (!currentClassData) {
    return null 
  }

  const getChannelClass = (channel: string) => {
    return activeChannel === channel 
      ? "bg-blue-100 text-blue-900 font-medium" 
      : "text-gray-700 hover:bg-gray-100";
  }

  const getClassColor = () => {
    const classIndex = classes.findIndex(c => c.id === classId);
    const bgColors = ["bg-blue-50", "bg-indigo-50", "bg-purple-50", "bg-green-50"];
    const textColors = ["text-blue-700", "text-indigo-700", "text-purple-700", "text-green-700"];
    
    return {
      bg: bgColors[classIndex % bgColors.length],
      text: textColors[classIndex % textColors.length]
    };
  }

  const classColor = getClassColor();
  const initials = currentClassData.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();

  const handleInvite = async (action: 'generate' | 'revoke') => {
    try {
      const response = await fetch(`/api/classes/${classId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error('Failed to manage invitation');
      }

      const data = await response.json();
      
      if (action === 'generate' && data.success) {
        setInviteInfo({
          invitationCode: data.invitationCode,
          expires: new Date(data.expires).toLocaleDateString()
        });
      } else if (action === 'revoke' && data.success) {
        setInviteInfo(null);
      }

      toast({
        title: 'Success',
        description: action === 'generate' ? 'New invitation code generated' : 'Invitation code revoked',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to manage invitation',
        variant: 'destructive',
      });
    }
  };

  const copyInviteCode = () => {
    if (inviteInfo?.invitationCode) {
      navigator.clipboard.writeText(inviteInfo.invitationCode);
      toast({
        title: 'Success',
        description: 'Invitation code copied to clipboard',
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove member');
      }

      toast({
        title: 'Success',
        description: 'Member removed from class',
      });
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      if (newRole === 'instructor') {
        if (!confirm('Are you sure you want to transfer instructor role? You will become a student.')) {
          return;
        }
      }
      
      const response = await fetch(`/api/classes/${classId}/members/${memberId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update member role');
      }

      const data = await response.json();
      
      if (data.success) {
        const newInstructorId = memberId;
        
        router.refresh();
        
        toast({
          title: 'Success',
          description: 'Member role updated',
        });
        
        setShowMemberDialog(false);
      }
      
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        variant: 'destructive',
      });
    }
  };

  const handleSaveMemberChanges = async () => {
    if (!editingMember) return;

    try {
      const response = await fetch(`/api/classes/${classId}/members/${editingMember.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingMember.name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update member');
      }

      toast({
        title: 'Success',
        description: 'Member updated successfully',
      });
      
      setEditingMember(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update member',
        variant: 'destructive',
      });
    }
  };

  const toggleTestMenu = () => {
    setShowTestMenu(!showTestMenu);
  };
  
  const handleTestTypeSelection = (isNew: boolean) => {
    if (isNew) {
      router.push(`/assignments/${classId}/test-studio`);
    } else {
      fetchExistingTests();
      setShowTestSelection(true);
    }
    setShowTestMenu(false);
    setShowTestTypeSelection(false);
  };
  
  const fetchExistingTests = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}/tests`);
      if (!response.ok) throw new Error('Failed to fetch tests');
      
      const data = await response.json();
      if (data.success && Array.isArray(data.tests)) {
        setExistingTests(data.tests);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast({ 
        title: "Error", 
        description: "Failed to load tests. Please try again.", 
        variant: "destructive" 
      });
    }
  };
  
  const embedTestInChat = async (test: Test) => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      const uniqueTestId = `${test.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      const testEmbed = {
        type: 'test',
        id: uniqueTestId,
        title: test.title,
        description: test.description,
        questionCount: test.questions.length,
        timeLimit: test.timeLimit,
        originalTestId: test.id
      };
      
      const content = JSON.stringify(testEmbed);
      
      const optimisticMessage: Message = {
        _id: tempId,
        content,
        sender: {
          _id: session?.user?.id || 'unknown',
          name: session?.user?.name || 'Unknown User',
          email: session?.user?.email || '',
          image: session?.user?.image || undefined,
        },
        channel: activeChannel,
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      setTimeout(() => scrollToBottom(), 100);
      
      console.log('Embedding test in chat:', {
        content,
        channel: activeChannel,
        type: 'test'
      });
      
      const response = await fetch(`/api/classes/${classId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          channel: activeChannel,
          type: 'test'
        }),
      });

      const responseData = await response.json();
      console.log('Server response for test embed:', responseData);

      if (!response.ok) {
        throw new Error(`Failed to embed test: ${responseData.error || 'Unknown error'}`);
      }
      
      if (responseData.success && responseData.message) {
        console.log('Test embed saved successfully');
        setMessages(prev => prev.map(msg => 
          msg._id === tempId ? responseData.message : msg
        ));
      } else {
        throw new Error('Invalid response format');
      }
      
      setShowTestSelection(false);
      setSelectedTest(null);
    } catch (error) {
      console.error('Error embedding test:', error);
      
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      
      toast({
        title: 'Error',
        description: 'Failed to embed test in chat',
        variant: 'destructive',
      });
    }
  };
  
  const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
    setEditMessageContent(message.content);
  };
  
  const saveEditedMessage = async () => {
    if (!editingMessage) return;
    
    try {
      const response = await fetch(`/api/classes/${classId}/messages/${editingMessage._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editMessageContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update message');
      }

      setMessages(prev => 
        prev.map(msg => 
          msg._id === editingMessage._id 
            ? { ...msg, content: editMessageContent } 
            : msg
        )
      );
      
      setEditingMessage(null);
      setEditMessageContent("");
      
      toast({
        title: 'Success',
        description: 'Message updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update message',
        variant: 'destructive',
      });
    }
  };
  
  const cancelEditing = () => {
    setEditingMessage(null);
    setEditMessageContent("");
  };
  
  const handleDeleteMessage = (message: Message) => {
    setMessageToDelete(message);
    setIsDeleting(true);
  };
  
  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;
    
    try {
      const response = await fetch(`/api/classes/${classId}/messages/${messageToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setMessages(prev => prev.filter(msg => msg._id !== messageToDelete._id));
      
      setIsDeleting(false);
      setMessageToDelete(null);
      
      toast({
        title: 'Success',
        description: 'Message deleted',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  const handleAddChannel = async () => {
    if (!newChannelName.trim()) {
      toast({
        title: 'Error',
        description: 'Channel name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    const formattedChannelName = newChannelName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    if (channels.includes(formattedChannelName)) {
      toast({
        title: 'Error',
        description: 'Channel already exists',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`/api/classes/${classId}/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formattedChannelName
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create channel');
      }

      const data = await response.json();
      if (data.success) {
        setChannels(prev => [...prev, formattedChannelName]);
        setNewChannelName("");
        setShowAddChannelDialog(false);
        
        toast({
          title: 'Success',
          description: `Channel #${formattedChannelName} created`,
        });
      }
    } catch (error) {
      console.error('Error creating channel:', error);
      toast({
        title: 'Error',
        description: 'Failed to create channel',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteChannelClick = (channel: string) => {
    if (["general", "assignments", "questions"].includes(channel)) {
      toast({
        title: 'Error',
        description: 'Default channels cannot be deleted',
        variant: 'destructive',
      });
      return;
    }
    
    setChannelToDelete(channel);
    setShowDeleteChannelDialog(true);
  };

  const confirmDeleteChannel = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}/channels/${channelToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete channel');
      }

      const data = await response.json();
      if (data.success) {
        if (activeChannel === channelToDelete) {
          setActiveChannel("general");
        }
        
        setChannels(prev => prev.filter(c => c !== channelToDelete));
        setShowDeleteChannelDialog(false);
        
        toast({
          title: 'Success',
          description: `Channel #${channelToDelete} deleted`,
        });
      }
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete channel',
        variant: 'destructive',
      });
    }
  };

  const leaveClass = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'You have left the class successfully',
        });
        router.push('/assignments');
      } else {
        throw new Error(data.message || 'Failed to leave class');
      }
    } catch (error: any) {
      console.error('Error leaving class:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while leaving the class',
        variant: 'destructive',
      });
    }
  };

  const fetchClass = async () => {
    try {
      if (typeof window !== 'undefined') {
        router.refresh();
      }
    } catch (error) {
      console.error('Error fetching class:', error);
    }
  };

  const updateClassDetails = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editClassName,
          description: editClassDescription
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: 'Success',
          description: 'Class details updated successfully',
        });
        
        fetchClass();
        setShowEditClassDialog(false);
      } else {
        throw new Error(data.message || 'Failed to update class details');
      }
    } catch (error: any) {
      console.error('Error updating class details:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while updating class details',
        variant: 'destructive',
      });
    }
  };

  const isUserInstructor = () => {
    return currentClass.instructor?.id === session?.user?.id
  }

  return (
    <>
      <Toaster />
    <div className="bg-white text-black mt-12 md:mt-16 lg:mt-20">
      <Grid columns={1} noBorder="all" className="h-auto min-h-[calc(100vh-15rem)]">
          <GridItem className="p-0 pt-4 flex h-full">
          <button 
            onClick={toggleSidebar}
            className="lg:hidden fixed top-4 left-4 z-30 bg-gray-50 hover:bg-gray-100 p-2 rounded-md text-gray-600 shadow-md"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div 
            className={`${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            } transform transition-transform duration-200 ease-in-out fixed lg:static lg:transform-none z-20 w-[80%] sm:w-72 md:w-64 bg-gray-50 border-r border-gray-200 h-full overflow-hidden flex-shrink-0`}
          >
            <div className="p-4 border-b border-gray-200">
              <Link 
                href="/assignments"
                className="flex items-center text-gray-600 hover:text-gray-900 mb-2 text-sm font-medium"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                All Classes
              </Link>
              <div className="flex items-center mt-4">
                <div className={`h-8 w-8 rounded-full ${classColor.bg} flex items-center justify-center text-sm font-medium ${classColor.text} mr-3`}>
                  {initials}
                </div>
                  <div className="flex-1 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                      {currentClassData.name}
                </h2>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 p-0 h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                        {currentClassData.instructor.id === session?.user?.id ? (
                          <>
                            <DropdownMenuItem onClick={() => setShowEditClassDialog(true)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Edit Class Details</span>
                            </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setShowInviteDialog(true)}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Manage Invites</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setShowMemberDialog(true)}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Manage Members</span>
                          </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem onClick={() => setShowLeaveClassDialog(true)}>
                              <ArrowLeft className="mr-2 h-4 w-4" />
                              <span>Leave Class</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
                </div>
            </div>
            <div className="overflow-y-auto h-[calc(100%-5rem)]">
              <div className="px-2 py-3">
                <div className="flex items-center justify-between pr-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-1">Channels</h3>
                  {currentClassData?.instructor.id === session?.user?.id && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0.5 h-5 w-5 rounded-sm"
                      onClick={() => setShowAddChannelDialog(true)}
                    >
                      <Plus className="h-3 w-3 text-gray-500" />
                    </Button>
                  )}
                </div>
                <ul className="space-y-1">
                  {channels.map((channel) => (
                    <li key={channel} className="group flex items-center">
                      <button 
                        className={`flex-1 flex items-center px-3 py-2 text-sm rounded-md ${getChannelClass(channel)}`}
                        onClick={() => {
                          setActiveChannel(channel);
                          if (window.innerWidth < 1024) setSidebarOpen(false);
                        }}
                      >
                        <Hash className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{channel}</span>
                      </button>
                      {currentClassData?.instructor.id === session?.user?.id && !["general", "assignments", "questions"].includes(channel) && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0.5 h-5 w-5 opacity-0 group-hover:opacity-100 mr-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChannelClick(channel);
                          }}
                        >
                          <XIcon className="h-3 w-3 text-gray-400 hover:text-red-600" />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-2 pt-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-1">Members</h3>
                <ul className="space-y-1">
                    {currentClassData.members.map((member) => (
                      <li key={member.id} className="px-3 py-2 text-sm flex items-center">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-900 mr-2">
                          {getInitials(member.name)}
                    </div>
                        <span className="text-gray-900">{member.name}</span>
                        {member.id === currentClassData.instructor.id && (
                    <span className="ml-2 text-xs text-gray-500">(Instructor)</span>
                        )}
                  </li>
                    ))}
                  </ul>
                    </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden min-h-screen">
            <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex justify-between items-center">
              <div className="flex items-center">
                {!sidebarOpen && (
                  <button 
                    onClick={toggleSidebar}
                    className="mr-2 lg:hidden"
                  >
                    <Menu className="h-5 w-5 text-gray-500" />
                  </button>
                )}
                <Hash className="h-5 w-5 text-gray-500 mr-2" />
                <h1 className="text-lg md:text-xl font-bold text-gray-900">{activeChannel}</h1>
              </div>
            </div>
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-30 z-10 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            <div className="flex-1 overflow-y-auto bg-white relative" ref={messagesContainerRef}>
              <div className="p-3 md:p-4 space-y-4 md:space-y-6">
                  {messagesLoading && !messages.length ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-start gap-2 md:gap-3 animate-pulse">
                          <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <div className="h-4 bg-gray-200 rounded w-24"></div>
                              <div className="h-3 bg-gray-200 rounded w-12"></div>
                            </div>
                            <div className="mt-2 h-4 bg-gray-200 rounded w-3/4"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
                      <MessageSquare className="h-12 w-12 text-blue-200 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">This conversation is waiting for a spark!</h3>
                      <p className="text-gray-500 max-w-md">Drop a message to kick things off. Your thoughts could inspire the next great discussion.</p>
                    </div>
                  ) : (
                    <>
                      {hasMoreMessages && (
                        <div className="flex justify-center mb-6">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => fetchMessages(true)} 
                            className="text-xs"
                            disabled={messagesLoading}
                          >
                            {messagesLoading ? (
                              <div className="flex items-center gap-1">
                                <span className="h-3 w-3 rounded-full border-2 border-t-transparent border-blue-600 animate-spin" /> 
                                Loading...
                              </div>
                            ) : (
                              'Load Older Messages'
                            )}
                          </Button>
                        </div>
                      )}
                      {memoizedMessages}
                    </>
                  )}
                <div ref={chatEndRef} />
              </div>
              
              {showScrollButton && (
                <button 
                  onClick={scrollToBottom}
                  className="absolute bottom-6 right-6 bg-blue-900 text-white rounded-full p-2 shadow-lg hover:bg-blue-800 transition-all z-10"
                  aria-label="Scroll to bottom"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="px-2 md:px-4 pb-2 md:pb-4">
              <div className="bg-gray-50 rounded-lg border border-gray-200">
                <div className="px-2 md:px-3 py-2 flex justify-between items-center">
                  {isUserInstructor() && (
                    <Button 
                      variant="secondary"
                      size="sm"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center gap-1.5 h-8 shadow-sm transition-all hover:shadow"
                      onClick={() => router.push(`/assignments/${classId}/test-selection?channel=${activeChannel}`)}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Add a test</span>
                      <Plus className="h-3 w-3 ml-0.5" />
                    </Button>
                  )}
                </div>
                <div className="px-2 md:px-3 flex items-end">
                  <textarea
                    className="w-full resize-none bg-transparent focus:outline-none text-sm min-h-[40px] max-h-[160px] py-2"
                    placeholder={`Message #${activeChannel}`}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <div className="flex items-center gap-1 pl-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-gray-500 hover:bg-gray-100 rounded-full">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    {chatInput.trim() !== "" && (
                      <Button 
                        className="h-7 w-7 md:h-8 md:w-8 p-0 rounded-full bg-blue-900 hover:bg-blue-800 flex-shrink-0"
                        onClick={sendMessage}
                      >
                        <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="px-3 md:px-4 py-2 text-xs text-gray-500 border-t border-gray-100 flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Enter</span>
                    <span>to send</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Shift + Enter</span>
                    <span>for new line</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GridItem>
      </Grid>
    </div>
      {showInviteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowInviteDialog(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Class Invitation</h2>
              <button 
                onClick={() => setShowInviteDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <Grid columns={1} noBorder="all" hideDecorators>
              <GridItem>
                <p className="text-sm text-gray-500 mb-4">
                  Generate and manage invitation codes for your class
                </p>
                {currentClass.invitationCode ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-500 mb-2">Current Invitation Code</p>
                      <div className="flex items-center justify-center space-x-2">
                        <code className="text-2xl font-mono bg-white px-4 py-2 rounded border">
                          {currentClass.invitationCode || ''}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (currentClass.invitationCode) {
                              navigator.clipboard.writeText(currentClass.invitationCode);
                              toast({
                                title: 'Copied!',
                                description: 'Invitation code copied to clipboard',
                              });
                            }
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Expires: {currentClass.invitationCodeExpires 
                          ? new Date(currentClass.invitationCodeExpires).toLocaleDateString() 
                          : 'N/A'}
                      </p>
                    </div>
                    <Grid columns={2} noBorder="all" hideDecorators>
                      <GridItem>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/classes/${classId}/invite`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ action: 'generate' }),
                              });
                              
                              if (!response.ok) {
                                throw new Error('Failed to renew code');
                              }
                              
                              const data = await response.json();
                              if (data.success) {
                                setCurrentClass(prev => ({
                                  ...prev,
                                  invitationCode: data.invitationCode,
                                  invitationCodeExpires: data.expires,
                                }));
                                
                                toast({
                                  title: 'Success',
                                  description: 'Invitation code renewed',
                                });
                              }
                            } catch (error) {
                              toast({
                                title: 'Error',
                                description: 'Failed to renew invitation code',
                                variant: 'destructive',
                              });
                            }
                          }}
                        >
                          Renew Code
                        </Button>
                      </GridItem>
                      <GridItem>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/classes/${classId}/invite`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ action: 'revoke' }),
                              });
                              
                              if (!response.ok) {
                                throw new Error('Failed to revoke code');
                              }
                              
                              const data = await response.json();
                              if (data.success) {
                                setCurrentClass(prev => ({
                                  ...prev,
                                  invitationCode: undefined,
                                  invitationCodeExpires: undefined,
                                }));
                                
                                toast({
                                  title: 'Success',
                                  description: 'Invitation code revoked',
                                });
                              }
                            } catch (error) {
                              toast({
                                title: 'Error',
                                description: 'Failed to revoke invitation code',
                                variant: 'destructive',
                              });
                            }
                          }}
                        >
                          Revoke Code
                        </Button>
                      </GridItem>
                    </Grid>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-500 mb-4">No active invitation code</p>
                    <Button
                      onClick={async () => {
                        try {
                          const response = await fetch(`/api/classes/${classId}/invite`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ action: 'generate' }),
                          });
                          
                          if (!response.ok) {
                            throw new Error('Failed to generate code');
                          }
                          
                          const data = await response.json();
                          if (data.success) {
                            setCurrentClass(prev => ({
                              ...prev,
                              invitationCode: data.invitationCode,
                              invitationCodeExpires: data.expires,
                            }));
                            
                            toast({
                              title: 'Success',
                              description: 'Invitation code generated',
                            });
                          }
                        } catch (error) {
                          toast({
                            title: 'Error',
                            description: 'Failed to generate invitation code',
                            variant: 'destructive',
                          });
                        }
                      }}
                    >
                      Generate New Code
                    </Button>
                  </div>
                )}
              </GridItem>
            </Grid>
          </div>
        </div>
      )}
      
      {editingMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={cancelEditing} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Edit Message</h2>
              <button 
                onClick={cancelEditing}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <textarea
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={editMessageContent}
                onChange={(e) => setEditMessageContent(e.target.value)}
              />
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
                <Button onClick={saveEditedMessage}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsDeleting(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Delete Message</h2>
              <button 
                onClick={() => setIsDeleting(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this message? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDeleting(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteMessage}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAddChannelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddChannelDialog(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Add Channel</h2>
              <button 
                onClick={() => setShowAddChannelDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Channel Name</label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-1">#</span>
                  <input
                    type="text"
                    className="flex-1 border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="channel-name"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Channel names can only contain lowercase letters, numbers, and hyphens.
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddChannelDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddChannel}>
                  Add Channel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeleteChannelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteChannelDialog(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Delete Channel</h2>
              <button 
                onClick={() => setShowDeleteChannelDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the <span className="font-semibold">#{channelToDelete}</span> channel? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteChannelDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteChannel}>
                  Delete Channel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showMemberDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowMemberDialog(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Manage Class Members</h2>
              <button 
                onClick={() => setShowMemberDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4 max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium text-gray-500 text-sm">Name</th>
                      <th className="py-2 text-left font-medium text-gray-500 text-sm">Email</th>
                      <th className="py-2 text-left font-medium text-gray-500 text-sm">Role</th>
                      <th className="py-2 text-left font-medium text-gray-500 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentClassData?.members.map((member) => (
                      <tr key={member.id} className="border-b">
                        <td className="py-3 flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-900">
                            {getInitials(member.name)}
                          </div>
                          <span>{member.name}</span>
                        </td>
                        <td className="py-3">{member.email}</td>
                        <td className="py-3">
                          {member.id === currentClassData.instructor.id ? (
                            <span className="text-sm font-medium text-blue-600">Instructor</span>
                          ) : (
                            <span className="text-sm">Student</span>
                          )}
                        </td>
                        <td className="py-3">
                          {member.id !== currentClassData.instructor.id && (
                            <div className="flex gap-2">
                              <Select
                                defaultValue="student"
                                onValueChange={(value: string) => handleRoleChange(member.id, value)}
                              >
                                <SelectTrigger className="w-[130px] h-8 text-xs">
                                  <SelectValue placeholder="Role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="student">Student</SelectItem>
                                  <SelectItem value="instructor">Instructor</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={() => setShowMemberDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditClassDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowEditClassDialog(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Edit Class Details</h2>
              <button 
                onClick={() => setShowEditClassDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                <input
                  type="text"
                  className="w-full border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter class name"
                  value={editClassName}
                  onChange={(e) => setEditClassName(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border rounded-md border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter class description"
                  rows={3}
                  value={editClassDescription}
                  onChange={(e) => setEditClassDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditClassDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={updateClassDetails}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLeaveClassDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowLeaveClassDialog(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Leave Class</h2>
              <button 
                onClick={() => setShowLeaveClassDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700 mb-4">
                Are you sure you want to leave this class? You will lose access to all class materials and conversations.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowLeaveClassDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={leaveClass}>
                  Leave Class
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 
