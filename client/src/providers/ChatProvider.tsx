import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./AuthProvider"
import axios from "axios"
import { Message } from "../types"
import { socket } from "../socket"

type ContextContent = {
  messages: Message[]
  createMessage: (data: { content: string }) => Promise<void>
  typingUsers: Set<string>
}

const ChatContext = createContext<ContextContent>({
  messages: [],
  createMessage: () => Promise.resolve(),
  typingUsers: new Set(),
})

interface ChatProviderProps {
  children: React.ReactNode
}

export default function ChatProvider({ children }: ChatProviderProps) {
  const { authUser } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

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

  const addMessage = (newMessage: Message) => {
    setMessages((prev) => [...prev, newMessage])
  }

  useEffect(() => {
    function onNewMessage(msg: Message) {
      addMessage(msg)
    }

    function onStartedTyping(userId: string) {
      setTypingUsers((prev) => {
        const updated = new Set(prev)
        updated.add(userId)
        return updated
      })
    }

    function onStoppedTyping(userId: string) {
      setTypingUsers((prev) => {
        const updated = new Set(prev)
        updated.delete(userId)
        return updated
      })
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

  const contextValue = { messages, createMessage, typingUsers }

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
}

export function useChat() {
  return useContext(ChatContext)
}
