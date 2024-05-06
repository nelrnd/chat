import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./AuthProvider"
import axios from "axios"
import { Chat, Message } from "../types"
import { socket } from "../socket"

type ContextContent = {
  messages: Message[]
  chats: Chat[]
  createMessage: (data: { content: string }) => Promise<void>
  loading: boolean
  findChat: (userId: string) => Chat | undefined
  createChat: (userId: string) => Promise<Chat> | undefined
}

const ChatContext = createContext<ContextContent>({
  messages: [],
  chats: [],
  createMessage: () => Promise.resolve(),
  loading: true,
  findChat: () => undefined,
  createChat: () => undefined,
})

interface ChatProviderProps {
  children: React.ReactNode
}

export default function ChatProvider({ children }: ChatProviderProps) {
  const { authUser } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  const createMessage = async (data: { content: string }) => {
    try {
      const res = await axios.post("/message", data)
      const msg = res.data
      addMessage(msg)
      socket.emit("new message", msg)
      return Promise.resolve()
    } catch (err) {
      console.log(err)
      return Promise.reject()
    }
  }

  const findChat = (userId: string) => {
    return chats.find((chat) => chat.members.length === 2 && chat.members.find((user) => user._id === userId))
  }

  const createChat = async (userId: string) => {
    try {
      const res = await axios.post("/chat", { userId })
      const chat = res.data
      setChats((prev) => [chat, ...prev])
      return chat
    } catch (err) {
      console.log(err)
    }
  }

  const addMessage = (newMessage: Message) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat._id === newMessage.chat._id ? { ...chat, messages: [...chat.messages, newMessage] } : chat
      )
    )
  }

  useEffect(() => {
    if (authUser) {
      socket.emit("login", authUser._id)
    }
  }, [authUser])

  useEffect(() => {
    function onNewMessage(msg: Message) {
      addMessage(msg)
    }

    function onStartedTyping(userId: string, chatId: string) {
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                typingUsers: chat.typingUsers.includes(userId) ? chat.typingUsers : [...chat.typingUsers, userId],
              }
            : chat
        )
      )
    }

    function onStoppedTyping(userId: string, chatId: string) {
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId ? { ...chat, typingUsers: chat.typingUsers.filter((user) => user !== userId) } : chat
        )
      )
    }

    socket.on("new message", onNewMessage)
    socket.on("started typing", onStartedTyping)
    socket.on("stopped typing", onStoppedTyping)

    return () => {
      socket.off("new message", onNewMessage)
      socket.off("started typing", onStartedTyping)
      socket.off("stopped typing", onStoppedTyping)
    }
  }, [])

  useEffect(() => {
    if (authUser) {
      axios
        .get("/message")
        .then((res) => setMessages(res.data))
        .catch((err) => console.log(err))
    } else {
      setMessages([])
    }
  }, [authUser])

  useEffect(() => {
    if (authUser) {
      axios
        .get("/chat")
        .then((res) => {
          setChats(res.data)
          setLoading(false)
        })
        .catch((err) => console.log(err))
    } else {
      setChats([])
    }
  }, [authUser])

  const contextValue = { messages, chats, createMessage, loading, findChat, createChat }

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
}

export function useChat(chatId?: string) {
  const data = useContext(ChatContext)

  if (chatId) {
    const chat = data.chats.find((chat) => chat._id === chatId)
    return { chat: chat, loading: data.loading }
  }

  return data
}
