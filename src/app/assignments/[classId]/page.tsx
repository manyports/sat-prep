"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Hash, MessageSquare, Clock, Users, Settings, Send, Paperclip, ArrowLeft, FileText, Plus, Menu, X as XIcon } from "lucide-react"
import { Grid, GridItem } from "@/components/grid"
import { useParams, useRouter } from "next/navigation"

const classes = [
  { id: "sat-prep", name: "SAT Prep", members: 24, description: "SAT preparation course with practice tests and personalized tutoring" },
  { id: "algebra-2", name: "Algebra II", members: 18, description: "Advanced algebra concepts including functions, equations, and matrices" },
  { id: "ap-literature", name: "AP Literature", members: 22, description: "College-level literary analysis and critical reading" },
  { id: "physics", name: "Physics", members: 16, description: "Introduction to mechanics, electricity, magnetism, and modern physics" },
]

const assignments = [
  { 
    id: "assign-1",
    title: "Systems of Equations Practice",
    description: "Complete 20 practice problems on systems of equations",
    dueDate: "Oct 15",
    status: "Incomplete",
    type: "Math"
  },
  { 
    id: "assign-2",
    title: "Reading Comprehension",
    description: "Read the passage and answer the multiple choice questions",
    dueDate: "Oct 12",
    status: "Complete",
    type: "Reading"
  },
  { 
    id: "assign-3",
    title: "Grammar Exercise",
    description: "Identify and correct errors in the provided sentences",
    dueDate: "Oct 18",
    status: "Incomplete",
    type: "Writing"
  },
  { 
    id: "assign-4",
    title: "Practice Test #1",
    description: "Complete a full-length SAT practice test",
    dueDate: "Oct 20",
    status: "Incomplete",
    type: "Full Test"
  },
]

const chatMessages = [
  {
    id: 1,
    sender: "Kanat Atakonys",
    avatar: "KA",
    timestamp: "Today at 9:30 AM",
    content: "всем доброе утро! сегодня мы будем решать задачи на системы уравнений. пожалуйста, принесите свои тетради и ручки.",
    assignment: null
  },
  {
    id: 2,
    sender: "Vitaliy Ogai",
    avatar: "VO",
    timestamp: "Today at 9:45 AM",
    content: "спасибо, канат! быстрый вопрос - для практики по системам уравнений, нужно ли нам показывать все наши работы или только конечные ответы?",
    assignment: null
  },
  {
    id: 3,
    sender: "Kanat Atakonys",
    avatar: "KA",
    timestamp: "Today at 9:47 AM",
    content: "спасибо, виталий! для практики по системам уравнений, нужно ли нам показывать все наши работы или только конечные ответы?",
    assignment: null
  },
  {
    id: 4,
    sender: "Kanat Atakonys",
    avatar: "KA",
    timestamp: "Today at 10:00 AM",
    content: "Here's a new assignment for вас всех. фокусируется на навыках чтения и понимания текста, которые мы обсуждали на прошлом занятии.",
    assignment: assignments[1]
  },
  {
    id: 5,
    sender: "Aisana",
    avatar: "AS",
    timestamp: "Today at 10:15 AM",
    content: "у меня проблемы с заданием #5 в практическом тесте. можем ли мы обсудить это на следующем занятии?",
    assignment: null
  },
  {
    id: 6,
    sender: "Kanat Atakonys",
    avatar: "KA",
    timestamp: "Today at 10:20 AM",
    content: "конечно, айсана. я отвечу на ваш вопрос в начале следующего занятия. в это время, пожалуйста, ознакомьтесь с примерами в главе 7.",
    assignment: null
  },
  {
    id: 7,
    sender: "Kanat Atakonys",
    avatar: "KA",
    timestamp: "Today at 11:30 AM",
    content: "всем, пожалуйста, завершите это математическое задание к следующей неделе. мы обсудим эти концепции в классе в понедельник.",
    assignment: assignments[0]
  }
]

export default function classPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string
  const [chatInput, setChatInput] = useState("")
  const [messages, setMessages] = useState(chatMessages)
  const [activeChannel, setActiveChannel] = useState("general")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const chatEndRef = useRef<HTMLDivElement>(null)

  const currentClass = classes.find(c => c.id === classId)

  useEffect(() => {
    if (!currentClass) {
      router.push('/assignments')
    }
  }, [currentClass, router])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

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
  
  const sendMessage = () => {
    if (chatInput.trim() === "") return
    
    const newMessage = {
      id: messages.length + 1,
      sender: "You",
      avatar: "YO",
      timestamp: "Just now",
      content: chatInput,
      assignment: null
    }
    
    setMessages([...messages, newMessage])
    setChatInput("")
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }
  
  if (!currentClass) {
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
  const initials = currentClass.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="bg-white text-black mt-12 md:mt-16 lg:mt-20">
      <Grid columns={1} noBorder="all" className="h-auto min-h-[calc(100vh-15rem)]">
        <GridItem className="p-0 flex h-full">
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
                <h2 className="text-lg font-bold text-gray-900">
                  {currentClass.name}
                </h2>
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
                  <li className="px-3 py-2 text-sm flex items-center">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-semibold text-green-900 mr-2">
                      KA
                    </div>
                    <span className="text-gray-900">Kanat Atakonys</span>
                    <span className="ml-2 text-xs text-gray-500">(Instructor)</span>
                  </li>
                  <li className="px-3 py-2 text-sm flex items-center">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-900 mr-2">
                      YO
                    </div>
                    <span className="text-gray-900">You</span>
                  </li>
                  <li className="px-3 py-2 text-sm flex items-center">
                    <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-900 mr-2">
                      VO
                    </div>
                    <span className="text-gray-900">Vitaliy Ogai</span>
                  </li>
                  <li className="px-3 py-2 text-sm flex items-center">
                    <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-semibold text-orange-900 mr-2">
                      AS
                    </div>
                    <span className="text-gray-900">Aisana</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
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
            <div className="flex-1 overflow-y-auto bg-white">
              <div className="p-3 md:p-4 space-y-4 md:space-y-6">
                {messages.reduce((grouped, message, index, array) => {
                  const prevMessage = array[index - 1];
                  const isSameSender = prevMessage && prevMessage.sender === message.sender;
                  const isWithinTimeframe = prevMessage && 
                    new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() < 5 * 60 * 1000;
                  
                  if (isSameSender && isWithinTimeframe && !message.assignment && !prevMessage.assignment) {
                    if (!Array.isArray(grouped[grouped.length - 1])) {
                      grouped[grouped.length - 1] = [prevMessage, message];
                    } else {
                      grouped[grouped.length - 1].push(message);
                    }
                  } else {
                    grouped.push(message);
                  }
                  return grouped;
                }, [] as (any[] | any)[]).map((group, groupIndex) => {
                  if (Array.isArray(group)) {
                    return (
                      <div key={`group-${groupIndex}`} className="pl-9 md:pl-11">
                        {group.map((message, msgIndex) => (
                          <div key={message.id} className={msgIndex === 0 ? "" : "mt-0.5"}>
                            <p className="text-gray-700 text-sm md:text-base">{message.content}</p>
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    if (group.assignment) {
                      return (
                        <div key={group.id}>
                          <div className="flex items-start gap-2 md:gap-3 mb-2">
                            <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-900 flex-shrink-0">
                              {group.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900 text-sm md:text-base">{group.sender}</span>
                                <span className="text-xs text-gray-500">{group.timestamp}</span>
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
                        <div key={group.id} className="flex items-start gap-2 md:gap-3">
                          <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-900 flex-shrink-0">
                            {group.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900 text-sm md:text-base">{group.sender}</span>
                              <span className="text-xs text-gray-500">{group.timestamp}</span>
                            </div>
                            <p className="text-gray-700 mt-1 text-sm md:text-base">{group.content}</p>
                          </div>
                        </div>
                      );
                    }
                  }
                })}
                <div ref={chatEndRef} />
              </div>
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
  )
} 