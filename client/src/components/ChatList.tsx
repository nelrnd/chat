import { Link, useParams } from "react-router-dom"
import { useChat } from "../providers/ChatProvider"
import Avatar from "./Avatar"
import { useAuth } from "@/providers/AuthProvider"
import { Chat } from "@/types"

export default function ChatList() {
  const { chatId } = useParams()
  const { chats } = useChat()

  const filterChats = (chat: Chat) => chat.messages.length > 0 || chat._id === chatId
  const sortChats = (a: Chat, b: Chat) =>
    new Date(b.messages[b.messages.length - 1].timestamp).getTime() -
    new Date(a.messages[a.messages.length - 1].timestamp).getTime()

  const filteredAndSortedChats = chats.filter(filterChats).sort(sortChats)

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

  if (Math.round(date / 31536000) < Math.round(now / 31536000)) {
    const diff = Math.round(now / 31536000) - Math.round(date / 31536000)
    return diff + "y"
  } else if (Math.round(date / 2626288) < Math.round(now / 2626288)) {
    const diff = Math.round(now / 2626288) - Math.round(date / 2626288)
    return diff + "m"
  } else if (Math.round(date / 604800) < Math.round(now / 604800)) {
    const diff = Math.round(now / 604800) - Math.round(date / 604800)
    return diff + "w"
  } else if (Math.round(date / 86400) < Math.round(now / 86400)) {
    const diff = Math.round(now / 86400) - Math.round(date / 86400)
    return diff + "d"
  } else if (Math.round(date / 3600) < Math.round(now / 3600)) {
    const diff = Math.round(now / 3600) - Math.round(date / 3600)
    return diff + "h"
  } else if (Math.round(date / 60) < Math.round(now / 60)) {
    const diff = Math.round(now / 60) - Math.round(date / 60)
    return diff + "m"
  } else {
    return "now"
  }
}

function ChatTab({ chat }) {
  const { chatId } = useParams()
  const { authUser } = useAuth()
  const otherMember = chat.members.find((user) => user._id !== authUser._id)
  const lastMessage = chat.messages[chat.messages.length - 1]
  const unreadCount = chat.unreadCount[authUser._id]
  const isTyping = chat.typingUsers.filter((userId) => userId !== authUser._id)

  console.log("chat:", chat)
  console.log("other member: ", otherMember)

  return (
    otherMember && (
      <li>
        <Link to={`/chat/${chat._id}`} className="group">
          <div
            className={`p-3 flex gap-3 items-center rounded-lg border ${
              chatId === chat._id ? "border-neutral-800 bg-neutral-900" : "border-transparent"
            } hover:bg-neutral-900 transition-colors`}
          >
            <ChatAvatar chat={chat} />
            <div className="flex-1">
              <h3 className="font-semibold">{otherMember.name}</h3>
              <p className={`${unreadCount ? "text-white font-medium" : "text-neutral-400"} `}>
                {isTyping.length ? <span>is typing...</span> : <span>{lastMessage.content}</span>}
              </p>
            </div>
            <div className="space-y-1">
              <p className={`text-xs ${unreadCount ? "text-white" : "text-neutral-400"}`}>
                {formatRelativeTime(lastMessage.timestamp)}
              </p>
              <UnreadBadge count={unreadCount} />
            </div>
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
