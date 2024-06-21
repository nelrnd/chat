import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./AuthProvider"
import axios from "axios"
import { Chat, Media, Message } from "../types"
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

  const updateChat = (chatId, content) => {
    setChats((chats) => chats.map((chat) => (chat._id === chatId ? { ...chat, ...content } : chat)))
  }

  const addMessage = ({ message, images, links }: { message: Message; images: Media[]; links: Media[] }) => {
    setChats((chats) =>
      chats.map((chat) => {
        if (chat._id === message.chat) {
          let unreadCount = chat?.unreadCount || 0
          if (message.from._id !== authUser?._id) {
            unreadCount++
          }
          const [messageImages, messageLinks] = [images, links]
          return {
            ...chat,
            messages: [...(chat?.messages || []), message],
            images: [...(chat?.images || []), ...messageImages],
            links: [...(chat?.links || []), ...messageLinks],
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
      updateChat(chatId, { unreadCount: 0 })
      axios.post(`/chat/${chatId}/read`)
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
      console.log(chat)
      setChats((chats) => [...chats, chat])
    }

    function onNewMessage(data: { message: Message; images: Media[]; links: Media[] }) {
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

    function onNewGame(game) {
      setChats((chats) =>
        chats.map((chat) =>
          chat._id === game.chat ? { ...chat, messages: [...chat.messages, { ...game, type: "game" }] } : chat
        )
      )
    }

    function onGameStart(game) {
      setChats((chats) =>
        chats.map((chat) =>
          chat._id === game.chat
            ? {
                ...chat,
                messages: chat.messages.map((message) =>
                  message._id === game._id ? { ...game, type: "game" } : message
                ),
              }
            : chat
        )
      )
    }

    function onGameUpdate(game) {
      setChats((chats) =>
        chats.map((chat) =>
          chat._id === game.chat
            ? {
                ...chat,
                messages: chat.messages.map((message) =>
                  message._id === game._id ? { ...game, type: "game" } : message
                ),
              }
            : chat
        )
      )
    }

    socket.on("new-chat", onNewChat)
    socket.on("new-message", onNewMessage)
    socket.on("start-typing", onStartTyping)
    socket.on("stop-typing", onStopTyping)
    socket.on("user-connection", onUserConnection)
    socket.on("user-disconnection", onUserDisonnection)
    socket.on("new-game", onNewGame)
    socket.on("game-start", onGameStart)
    socket.on("game-update", onGameUpdate)

    return () => {
      socket.off("new-chat", onNewChat)
      socket.off("new-message", onNewMessage)
      socket.off("start-typing", onStartTyping)
      socket.off("stop-typing", onStopTyping)
      socket.off("user-connection", onUserConnection)
      socket.off("user-disconnection", onUserDisonnection)
      socket.off("new-game", onNewGame)
      socket.off("game-start", onGameStart)
      socket.off("game-update", onGameUpdate)
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

export function useChats() {
  return useContext(ChatContext)
}

export function useChat(chatId?: string) {
  const content = useContext(ChatContext)
  const chat = content.chats.find((chat) => chat._id === chatId)
  return { chat, ...content }
}
