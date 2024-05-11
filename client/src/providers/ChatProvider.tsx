import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./AuthProvider"
import axios from "axios"
import { Chat, Message } from "../types"
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
      socket.emit("new chat", chat)
      return chat
    } catch (err) {
      console.log(err)
    }
  }

  const addMessage = (newMessage) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat._id === newMessage.message.chat._id) {
          const unreadCount = { ...chat.unreadCount }
          chat.members.forEach((user) => {
            if (user._id !== newMessage.message.sender._id) {
              unreadCount[user._id]++
            }
          })
          return {
            ...chat,
            messages: [...chat.messages, newMessage.message],
            sharedImages: [...chat.sharedImages, ...newMessage.images],
            sharedLinks: [...chat.sharedLinks, ...newMessage.links],
            unreadCount,
          }
        } else {
          return chat
        }
      })
    )
  }

  const readMessages = (chatId: string) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat._id === chatId) {
          const unreadCount = { ...chat.unreadCount }
          unreadCount[authUser._id] = 0
          return { ...chat, unreadCount }
        } else {
          return chat
        }
      })
    )
    axios.post(`/chat/${chatId}/read`)
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

    function onUserConnected(userId: string) {
      setChats((prev) =>
        prev.map((chat) => ({
          ...chat,
          members: chat.members.map((user) => (user._id === userId ? { ...user, isOnline: true } : user)),
        }))
      )
    }

    function onUserDisconnected(userId: string) {
      setChats((prev) =>
        prev.map((chat) => ({
          ...chat,
          members: chat.members.map((user) => (user._id === userId ? { ...user, isOnline: false } : user)),
        }))
      )
    }

    function onNewChat(chat: Chat) {
      setChats((prev) => [chat, ...prev])
      socket.emit("join chat", chat)
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
    socket.on("user connected", onUserConnected)
    socket.on("user disconnected", onUserDisconnected)
    socket.on("new chat", onNewChat)
    socket.on("started typing", onStartedTyping)
    socket.on("stopped typing", onStoppedTyping)

    return () => {
      socket.off("new message", onNewMessage)
      socket.off("user connected", onUserConnected)
      socket.off("user disconnected", onUserDisconnected)
      socket.off("new chat", onNewChat)
      socket.off("started typing", onStartedTyping)
      socket.off("stopped typing", onStoppedTyping)
    }
  }, [])

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
