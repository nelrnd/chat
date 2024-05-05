import { useParams } from "react-router-dom"
import { useChat } from "../providers/ChatProvider"
import { useAuth } from "../providers/AuthProvider"
import { User } from "../types"
import MessageForm from "../components/MessageInput"
import IsTypingFeedback from "../components/IsTypingFeedback"
import moment from "moment"

export default function Chat() {
  const { chatId } = useParams()
  const { chat, loading } = useChat(chatId)
  const { authUser } = useAuth()

  const otherMember = chat?.members.find((user: User) => user._id !== authUser?._id)

  if (loading) return <p>Loading...</p>

  if (!chat) return <p>Chat not found</p>

  return (
    <div>
      <h1>Chat with {otherMember?.name}</h1>

      {chat.messages.length && (
        <ul>
          {chat.messages.map((msg) => (
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
