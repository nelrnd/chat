import { Link, useParams } from "react-router-dom"
import { useChat } from "../providers/ChatProvider"
import Avatar from "./Avatar"
import { useAuth } from "@/providers/AuthProvider"

export default function ChatList() {
  const { chats } = useChat()

  return (
    <ul className="space-y-1">
      {chats.map((chat) => (
        <ChatTab key={chat._id} chat={chat} />
      ))}
    </ul>
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

  return (
    <li>
      <Link to={`/chat/${chat._id}`}>
        <div
          className={`p-3 flex gap-3 items-center rounded-lg border ${
            chatId === chat._id ? "border-neutral-800 bg-neutral-900" : "border-transparent"
          } hover:bg-neutral-900 transition-colors`}
        >
          <Avatar src={otherMember.avatar} />
          <div className="flex-1">
            <h3 className="font-semibold">{otherMember.name}</h3>
            <p className="text-neutral-400">{chat.messages[chat.messages.length - 1].content}</p>
          </div>
          <div>
            <p className="text-sm text-neutral-400">{formatRelativeTime(lastMessage.timestamp)}</p>
            <UnreadBadge count={chat.unreadCount[authUser._id]} />
          </div>
        </div>
      </Link>
    </li>
  )
}

function UnreadBadge({ count }) {
  if (count === 0) return null

  return <div>{count}</div>
}
