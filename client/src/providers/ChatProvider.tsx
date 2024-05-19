import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./AuthProvider"
import axios from "axios"
import { Chat, Image, Link, Message } from "../types"
import { socket } from "../socket"

type ContextContent = {
  chats: Chat[]
  createMessage: (data: { content: string }) => Promise<void>
  loading: boolean
  findChat: (userId: string) => Chat | undefined
  createChat: (userId: string) => Promise<Chat> | undefined
}

const ChatContext = createContext<ContextContent>({
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
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(true)

  const playPop = () => {
    const pop = new Audio("/src/assets/pop.mp3")
    pop.play()
  }

  const findChat = (userId: string) => {
    return chats.find((chat) => chat.members.length === 2 && chat.members.find((user) => user._id === userId))
  }

  const createChat = async (members: string[]) => {
    try {
      const res = await axios.post("/chat", { members })
      const chat = res.data
      setChats((chats) => [chat, ...chats])
      return chat
    } catch (err) {
      console.log(err)
    }
  }

  const createMessage = async (data: { content: string }) => {
    try {
      const res = await axios.post("/message", data)
      const msg = res.data
      addMessage(msg)
      return Promise.resolve()
    } catch (err) {
      console.log(err)
      return Promise.reject()
    }
  }

  const addMessage = ({ message, images, links }: { message: Message; images: Image[]; links: Link[] }) => {
    setChats((chats) =>
      chats.map((chat) => {
        if (chat._id === message.chat) {
          const unreadCount = { ...chat.unreadCount }
          chat.members.forEach((user) => user._id !== message.sender._id && unreadCount[user._id]++)
          return {
            ...chat,
            messages: [...chat.messages, message],
            sharedImages: [...chat.sharedImages, ...images],
            sharedLinks: [...chat.sharedLinks, ...links],
            unreadCount,
          }
        } else {
          return chat
        }
      })
    )
  }

  const readMessages = async (chatId: string) => {
    if (authUser && chatId) {
      setChats((chats) =>
        chats.map((chat) => {
          if (chat._id === chatId) {
            const unreadCount = { ...chat.unreadCount }
            unreadCount[authUser?._id] = 0
            return { ...chat, unreadCount }
          } else {
            return chat
          }
        })
      )
      await axios.post(`/chat/${chatId}/read`)
    }
  }

  useEffect(() => {
    function onConnect() {
      socket.emit("login", authUser?._id)
    }

    socket.on("connect", onConnect)

    return () => {
      socket.off("connect", onConnect)
    }
  }, [authUser])

  useEffect(() => {
    function onNewChat(chat: Chat) {
      setChats((chats) => [...chats, chat])
    }

    function onNewMessage(data: { message: Message; images: Image[]; links: Link[] }) {
      playPop()
      addMessage(data)
    }

    function onStartTyping({ userId, chatId }: { userId: string; chatId: string }) {
      setChats((chats) =>
        chats.map((chat) => {
          if (chat._id === chatId) {
            return { ...chat, typingUsers: Array.from(new Set([...chat.typingUsers, userId])) }
          } else {
            return chat
          }
        })
      )
    }

    function onStopTyping({ userId, chatId }: { userId: string; chatId: string }) {
      setChats((chats) =>
        chats.map((chat) => {
          if (chat._id === chatId) {
            return { ...chat, typingUsers: chat.typingUsers.filter((user) => user !== userId) }
          } else {
            return chat
          }
        })
      )
    }

    function onUserConnection(userId: string) {
      setChats((chats) =>
        chats.map((chat) => ({
          ...chat,
          members: chat.members.map((user) => (user._id === userId ? { ...user, isOnline: true } : user)),
        }))
      )
    }

    function onUserDisonnection(userId: string) {
      setChats((chats) =>
        chats.map((chat) => ({
          ...chat,
          members: chat.members.map((user) => (user._id === userId ? { ...user, isOnline: false } : user)),
        }))
      )
    }

    socket.on("new-chat", onNewChat)
    socket.on("new-message", onNewMessage)
    socket.on("start-typing", onStartTyping)
    socket.on("stop-typing", onStopTyping)
    socket.on("user-connection", onUserConnection)
    socket.on("user-disconnection", onUserDisonnection)

    return () => {
      socket.off("new-chat", onNewChat)
      socket.off("new-message", onNewMessage)
      socket.off("start-typing", onStartTyping)
      socket.off("stop-typing", onStopTyping)
      socket.off("user-connection", onUserConnection)
      socket.off("user-disconnection", onUserDisonnection)
    }
  }, [])

  useEffect(() => {
    if (authUser) {
      socket.emit("login", authUser._id)
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

  const contextValue = { chats, createMessage, loading, findChat, createChat, readMessages }

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
}

export function useChat(chatId?: string) {
  const data = useContext(ChatContext)

  if (chatId) {
    const chat = data.chats.find((chat) => chat._id === chatId)
    return { chat: chat, loading: data.loading, readMessages: data.readMessages }
  }

  return data
}
