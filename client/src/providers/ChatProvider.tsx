import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./AuthProvider"
import axios from "axios"
import { Message } from "../types"
import { socket } from "../socket"

type ContextContent = {
  messages: Message[]
  createMessage: (data: { content: string }) => Promise<void>
}

const ChatContext = createContext<ContextContent>({
  messages: [],
  createMessage: () => Promise.resolve(),
})

interface ChatProviderProps {
  children: React.ReactNode
}

export default function ChatProvider({ children }: ChatProviderProps) {
  const { authUser } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])

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

    socket.on("new message", onNewMessage)

    return () => {
      socket.off("new message", onNewMessage)
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

  const contextValue = { messages, createMessage }

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
}

export function useChat() {
  return useContext(ChatContext)
}
