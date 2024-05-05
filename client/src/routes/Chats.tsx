import { useChat } from "../providers/ChatProvider"
import UserSearch from "../components/UserSearch"
import { useAuth } from "../providers/AuthProvider"
import { Link } from "react-router-dom"
import { Chat } from "../types"

export default function Chats() {
  const { authUser } = useAuth()
  const { chats } = useChat()

  return (
    <div>
      <h1>Chats</h1>

      <UserSearch />

      {chats.length > 0 && (
        <ul>
          {chats.map((chat: Chat) => (
            <li key={chat._id}>
              <Link to={`/chat/${chat._id}`}>{chat.members.find((user) => user._id !== authUser?._id)?.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
