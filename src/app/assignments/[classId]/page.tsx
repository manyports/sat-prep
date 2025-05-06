"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Hash, MessageSquare, Clock, Users, Settings, Send, Paperclip, ArrowLeft, FileText, Plus, Menu, X as XIcon, Copy, RefreshCw, MoreVertical, ChevronDown } from "lucide-react"
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
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const sendMessage = async () => {
    if (chatInput.trim() === "") return
    
    try {
      const response = await fetch(`/api/classes/${classId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: chatInput.trim(),
          channel: activeChannel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const { success, message } = await response.json();
      if (success && message) {
        setMessages(prev => [...prev, message]);
        setChatInput("");
        setTimeout(() => scrollToBottom(), 100);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
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
  
  const fetchMessages = async () => {
    try {
      setMessagesLoading(true);
      const response = await fetch(`/api/classes/${classId}/messages?channel=${activeChannel}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const { success, messages: fetchedMessages } = await response.json();
      if (success && Array.isArray(fetchedMessages)) {
        setMessages(fetchedMessages);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

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

      toast({
        title: 'Success',
        description: 'Member role updated',
      });
      
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
                    {currentClassData.instructor.id === session?.user?.id && (
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
                          <DropdownMenuItem onClick={() => setShowInviteDialog(true)}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Manage Invites</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setShowMemberDialog(true)}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Manage Members</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
            </div>
            <div className="overflow-y-auto h-[calc(100%-5rem)]">
              <div className="px-2 py-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-1">Channels</h3>
                <ul className="space-y-1">
                  <li>
                    <button 
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${getChannelClass("general")}`}
                      onClick={() => {
                        setActiveChannel("general");
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                    >
                      <Hash className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">general</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${getChannelClass("assignments")}`}
                      onClick={() => {
                        setActiveChannel("assignments");
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                    >
                      <Hash className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">assignments</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${getChannelClass("questions")}`}
                      onClick={() => {
                        setActiveChannel("questions");
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                    >
                      <Hash className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">questions</span>
                    </button>
                  </li>
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
                  {messagesLoading ? (
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
                    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                      <p>No messages yet. Be the first to start the conversation!</p>
                    </div>
                  ) : (
                    messages.reduce((grouped, message, index, array) => {
                  const prevMessage = array[index - 1];
                      const isSameSender = prevMessage && prevMessage.sender._id === message.sender._id;
                  const isWithinTimeframe = prevMessage && 
                        new Date(message.createdAt).getTime() - new Date(prevMessage.createdAt).getTime() < 5 * 60 * 1000;
                  
                  if (isSameSender && isWithinTimeframe && !message.assignment && !prevMessage.assignment) {
                        const lastGroup = grouped[grouped.length - 1];
                        if (Array.isArray(lastGroup)) {
                          lastGroup.push(message);
                        } else {
                      grouped[grouped.length - 1] = [prevMessage, message];
                    }
                  } else {
                    grouped.push(message);
                  }
                  return grouped;
                    }, [] as (Message[] | Message)[]).map((group, groupIndex) => {
                  if (Array.isArray(group)) {
                    return (
                      <div key={`group-${groupIndex}`} className="pl-9 md:pl-11">
                        {group.map((message, msgIndex) => (
                              <div key={message._id} className={msgIndex === 0 ? "" : "mt-0.5"}>
                            <p className="text-gray-700 text-sm md:text-base">{message.content}</p>
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    if (group.assignment) {
                      return (
                            <div key={group._id}>
                          <div className="flex items-start gap-2 md:gap-3 mb-2">
                            <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-900 flex-shrink-0">
                                  {getInitials(group.sender.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                    <span className="font-semibold text-gray-900 text-sm md:text-base">{group.sender.name}</span>
                                    <span className="text-xs text-gray-500">{formatTimestamp(group.createdAt)}</span>
                              </div>
                              <p className="text-gray-700 mt-1 text-sm md:text-base">{group.content}</p>
                            </div>
                          </div>
                          <div className="pl-9 md:pl-11 mt-2">
                            <Grid noBorder="all" columns={1}>
                              <GridItem className="p-3 md:p-4 bg-gray-50 border border-gray-200 rounded-md">
                                <div className="flex items-start">
                                  <div className="mr-3 mt-1 hidden sm:block">
                                    <FileText className="h-5 w-5 text-blue-900" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-2 ${
                                      group.assignment.type === "Math" ? "bg-blue-100 text-blue-800" :
                                      group.assignment.type === "Reading" ? "bg-green-100 text-green-800" :
                                      group.assignment.type === "Writing" ? "bg-orange-100 text-orange-800" :
                                      "bg-purple-100 text-purple-800"
                                    }`}>
                                      {group.assignment.type}
                                    </div>
                                    <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">{group.assignment.title}</h3>
                                    <p className="text-xs md:text-sm text-gray-600 mb-3">{group.assignment.description}</p>
                                    <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-gray-500">
                                      <div className="flex items-center">
                                        <Clock className="h-3.5 w-3.5 mr-1" />
                                        Due {group.assignment.dueDate}
                                      </div>
                                      <Button size="sm" className="bg-blue-900 hover:bg-blue-800 text-xs py-1 h-auto">
                                        View Assignment
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </GridItem>
                            </Grid>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                            <div key={group._id} className="flex items-start gap-2 md:gap-3">
                          <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-900 flex-shrink-0">
                                {getInitials(group.sender.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                                  <span className="font-semibold text-gray-900 text-sm md:text-base">{group.sender.name}</span>
                                  <span className="text-xs text-gray-500">{formatTimestamp(group.createdAt)}</span>
                            </div>
                            <p className="text-gray-700 mt-1 text-sm md:text-base">{group.content}</p>
                          </div>
                        </div>
                      );
                    }
                  }
                    })
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
                <div className="px-2 md:px-3 py-2 flex">
                  <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-gray-500 hover:bg-gray-100 rounded-full">
                    <Plus className="h-4 w-4" />
                  </Button>
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
                <div className="px-3 md:px-4 py-1.5 md:py-2 text-xs text-gray-500 border-t border-gray-100">
                  Press Enter to send
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

      {showMemberDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowMemberDialog(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Manage Members</h2>
              <button 
                onClick={() => setShowMemberDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <Grid columns={1} noBorder="all" hideDecorators>
              <GridItem>
                <p className="text-sm text-gray-500 mb-4">
                  Edit member roles and remove members from the class
                </p>
                <Grid columns={1} noBorder="all">
                  {currentClass.members.map((member, index) => (
                    <GridItem key={member.id} className={index === 0 ? "" : "border-t"}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-900">
                            {getInitials(member.name)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        {member.id !== currentClass.instructor.id && (
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingMember(member);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/classes/${classId}/members/${member.id}`, {
                                    method: 'DELETE',
                                  });

                                  if (!response.ok) {
                                    throw new Error('Failed to remove member');
                                  }

                                  const data = await response.json();
                                  if (data.success) {
                                    setCurrentClass(prev => ({
                                      ...prev,
                                      members: prev.members.filter(m => m.id !== member.id)
                                    }));

                                    toast({
                                      title: 'Success',
                                      description: 'Member removed successfully',
                                    });
                                  }
                                } catch (error) {
                                  toast({
                                    title: 'Error',
                                    description: 'Failed to remove member',
                                    variant: 'destructive',
                                  });
                                }
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </GridItem>
                  ))}
                </Grid>
              </GridItem>
            </Grid>
          </div>
        </div>
      )}

      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setEditingMember(null)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Edit Member</h2>
              <button 
                onClick={() => setEditingMember(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            
            <Grid columns={1} noBorder="all" hideDecorators>
              <GridItem>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Display Name</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={editingMember?.name || ''}
                      onChange={(e) => setEditingMember(prev => prev ? {...prev, name: e.target.value} : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={editingMember?.id === currentClass.instructor.id ? 'instructor' : 'student'}
                      onChange={async (e) => {
                        if (!editingMember) return;
                        
                        try {
                          const response = await fetch(`/api/classes/${classId}/members/${editingMember.id}/role`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ role: e.target.value }),
                          });

                          if (!response.ok) {
                            throw new Error('Failed to update role');
                          }

                          const data = await response.json();
                          if (data.success) {
                            if (e.target.value === 'instructor') {
                              setCurrentClass(prev => ({
                                ...prev,
                                instructor: {
                                  id: editingMember.id,
                                  name: editingMember.name,
                                }
                              }));
                            }

                            toast({
                              title: 'Success',
                              description: 'Member role updated successfully',
                            });
                            setEditingMember(null);
                          }
                        } catch (error) {
                          toast({
                            title: 'Error',
                            description: 'Failed to update member role',
                            variant: 'destructive',
                          });
                        }
                      }}
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                    </select>
                  </div>
                </div>
              </GridItem>
            </Grid>
                
            <div className="flex justify-end space-x-2 p-4 border-t">
              <Button variant="outline" onClick={() => setEditingMember(null)}>
                Cancel
              </Button>
              <Button onClick={async () => {
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

                  const data = await response.json();
                  if (data.success) {
                    setCurrentClass(prev => ({
                      ...prev,
                      members: prev.members.map(m => 
                        m.id === editingMember.id 
                          ? { ...m, name: editingMember.name }
                          : m
                      )
                    }));

                    toast({
                      title: 'Success',
                      description: 'Member updated successfully',
                    });
                    setEditingMember(null);
                  }
                } catch (error) {
                  toast({
                    title: 'Error',
                    description: 'Failed to update member',
                    variant: 'destructive',
                  });
                }
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 