import moment from "moment"
import { useChat } from "../providers/ChatProvider"
import UserSearch from "../components/UserSearch"
import MessageForm from "../components/MessageInput"
import IsTypingFeedback from "../components/IsTypingFeedback"
import { useAuth } from "../providers/AuthProvider"
import { Link } from "react-router-dom"

export default function Chats() {
  const { authUser } = useAuth()
  const { messages, chats } = useChat()

  return (
    <div>
      <h1>Chats</h1>

      <UserSearch />

      {chats.length > 0 && (
        <ul>
          {chats.map((chat) => (
            <li key={chat._id}>
              <Link to={`/chat/${chat._id}`}>{chat.members.find((user) => user._id !== authUser._id).name}</Link>
            </li>
          ))}
        </ul>
      )}

      {messages.length && (
        <ul>
          {messages.map((msg) => (
            <li key={msg._id}>
              <strong>{msg.sender.name}: </strong>
              {msg.content} - {moment(msg.timestamp).format("LT")}
            </li>
          ))}
        </ul>
      )}

      <IsTypingFeedback />

      <MessageForm />
    </div>
  )
}
