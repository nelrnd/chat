import { useChat } from "../providers/ChatProvider"
import UserSearch from "../components/UserSearch"
import { useAuth } from "../providers/AuthProvider"
import { Link, useParams } from "react-router-dom"
import { Chat } from "../types"

export default function Chats() {
  const { chatId } = useParams()
  const { chats, loading } = useChat()

  if (loading) return <p>Loading...</p>

  const sortedAndFilteredChats = chats
    .filter((chat: Chat) => chat.messages.length > 0 || chat._id === chatId)
    .sort(
      (a: Chat, b: Chat) =>
        new Date(b.messages[b.messages.length - 1].timestamp).getTime() -
        new Date(a.messages[a.messages.length - 1].timestamp).getTime()
    )

  return (
    <div>
      <h1>Chats</h1>

      <UserSearch />

      {sortedAndFilteredChats.length > 0 && (
        <ul>
          {sortedAndFilteredChats.map((chat: Chat) => (
            <ChatLink key={chat._id} chat={chat} />
          ))}
        </ul>
      )}
    </div>
  )
}

interface ChatLinkProps {
  chat: Chat
}

function ChatLink({ chat }: ChatLinkProps) {
  const { authUser } = useAuth()
  const otherUser = chat.members.find((user) => user._id !== authUser?._id)

  return (
    <li>
      <Link to={`/chat/${chat._id}`}>
        {otherUser?.name || "Deleted user"} {otherUser?.isOnline && <em>(online)</em>} {chat.unreadCount[authUser._id]}
      </Link>
    </li>
  )
}
