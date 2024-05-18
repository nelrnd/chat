import { Link, useParams } from "react-router-dom"
import { useChat } from "../providers/ChatProvider"
import Avatar from "./Avatar"
import { useAuth } from "@/providers/AuthProvider"
import { Chat } from "@/types"
import { BiImageAlt } from "react-icons/bi"
import Loader from "./Loader"
import { getChatName } from "@/utils"
import { useEffect, useState } from "react"

export const sortChats = (a: Chat, b: Chat) => {
  if (a.messages.length === 0) {
    return -1
  }

  if (b.messages.length === 0) {
    return 1
  }

  return (
    new Date(b.messages[b.messages.length - 1].timestamp).getTime() -
    new Date(a.messages[a.messages.length - 1].timestamp).getTime()
  )
}

export default function ChatList() {
  const { chatId } = useParams()
  const { chats, loading } = useChat()

  const filterChats = (chat: Chat) => chat.messages.length > 0 || chat._id === chatId

  const filteredAndSortedChats = chats.filter(filterChats).sort(sortChats)

  if (loading) return <Loader />

  return filteredAndSortedChats.length ? (
    <ul className="space-y-1">
      {filteredAndSortedChats.map((chat) => (
        <ChatTab key={chat._id} chat={chat} />
      ))}
    </ul>
  ) : (
    <p className="text-neutral-400 text-center">No chats for now</p>
  )
}

function formatRelativeTime(timestamp: string) {
  const date = new Date(timestamp).getTime() / 1000
  const now = new Date().getTime() / 1000

  if (Math.floor(date / 31536000) < Math.floor(now / 31536000)) {
    const diff = Math.floor(now / 31536000) - Math.floor(date / 31536000)
    return diff + "y"
  } else if (Math.floor(date / 2626288) < Math.floor(now / 2626288)) {
    const diff = Math.floor(now / 2626288) - Math.floor(date / 2626288)
    return diff + "mo"
  } else if (Math.floor(date / 604800) < Math.floor(now / 604800)) {
    const diff = Math.floor(now / 604800) - Math.floor(date / 604800)
    return diff + "w"
  } else if (Math.floor(date / 86400) < Math.floor(now / 86400)) {
    const diff = Math.floor(now / 86400) - Math.floor(date / 86400)
    return diff + "d"
  } else if (Math.floor(date / 3600) < Math.floor(now / 3600)) {
    const diff = Math.floor(now / 3600) - Math.floor(date / 3600)
    return diff + "h"
  } else if (Math.floor(date / 60) < Math.floor(now / 60)) {
    const diff = Math.floor(now / 60) - Math.floor(date / 60)
    return diff + "m"
  } else {
    return "now"
  }
}

function ChatTab({ chat }) {
  const { chatId } = useParams()
  const { authUser } = useAuth()
  const otherMembers = chat.members.filter((user) => user._id !== authUser._id)
  const lastMessage = chat.messages[chat.messages.length - 1]
  const unreadCount = chat.unreadCount[authUser._id]
  const isTyping = chat.typingUsers.filter((userId) => userId !== authUser._id)
  const [formattedRelativeTime, setFormattedRelativeTime] = useState("")

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    if (lastMessage) {
      setFormattedRelativeTime(formatRelativeTime(lastMessage.timestamp))
      interval = setInterval(() => {
        setFormattedRelativeTime(formatRelativeTime(lastMessage.timestamp))
      }, 60000)
    }

    return () => clearInterval(interval)
  }, [lastMessage])

  return (
    otherMembers && (
      <li>
        <Link to={`/chat/${chat._id}`} className="group">
          <div
            className={`p-3 flex gap-3 items-center rounded-lg border ${
              chatId === chat._id ? "border-neutral-800 bg-neutral-900" : "border-transparent"
            } hover:bg-neutral-900 transition-colors`}
          >
            <ChatAvatar chat={chat} />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{getChatName(otherMembers)}</h3>
              <div className={`${unreadCount ? "text-white font-medium" : "text-neutral-400"} `}>
                {isTyping.length ? (
                  "is typing..."
                ) : lastMessage ? (
                  <div className="flex items-center gap-1">
                    {lastMessage.images.length > 0 && <BiImageAlt />}
                    <div className="flex-1 min-w-0 truncate">
                      {lastMessage.content || (
                        <span className="italic">{lastMessage.images.length > 1 ? "images" : "image"}</span>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            {lastMessage && (
              <div className="space-y-1">
                <p className={`text-xs ${unreadCount ? "text-white" : "text-neutral-400"}`}>{formattedRelativeTime}</p>
                <UnreadBadge count={unreadCount} />
              </div>
            )}
          </div>
        </Link>
      </li>
    )
  )
}

function UnreadBadge({ count }) {
  if (count === 0) return null

  return (
    <div className="bg-indigo-600 text-white w-5 h-5 ml-auto rounded-full grid place-content-center">
      <span className="text-xs leading-none tracking-tighter">{count < 100 ? count : "99+"}</span>
    </div>
  )
}

function ChatAvatar({ chat }) {
  const { authUser } = useAuth()
  const { chatId } = useParams()
  const selected = chatId === chat._id

  const otherMember = chat.members.find((user) => user._id !== authUser._id)

  return (
    <div className="relative">
      <Avatar src={otherMember.avatar} />
      {otherMember.isOnline && <OnlineBadge selected={selected} />}
    </div>
  )
}

function OnlineBadge({ selected }) {
  return (
    <div className="w-fit h-fit absolute right-0 bottom-0">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="8"
          cy="8"
          r="8"
          className={`fill-neutral-950 group-hover:fill-neutral-900 transition-all ${selected && "fill-neutral-900"}`}
        />
        <circle cx="8" cy="8" r="6" fill="#86EFAC" />
        <circle cx="8" cy="8" r="5" fill="#22C55E" />
      </svg>
    </div>
  )
}
