import { useChat } from "../providers/ChatProvider"
import UserSearch from "../components/UserSearch"
import { useAuth } from "../providers/AuthProvider"
import { Link } from "react-router-dom"
import { Chat } from "../types"

export default function Chats() {
  const { chats, loading } = useChat()

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h1>Chats</h1>

      <UserSearch />

      {chats.length > 0 && (
        <ul>
          {chats.map((chat: Chat) => (
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
        {otherUser?.name} {otherUser?.isOnline && <em>(online)</em>}
      </Link>
    </li>
  )
}
