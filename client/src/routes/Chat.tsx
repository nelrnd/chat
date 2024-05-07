import { useParams } from "react-router-dom"
import { useChat } from "../providers/ChatProvider"
import { useAuth } from "../providers/AuthProvider"
import { Message, User } from "../types"
import MessageForm from "../components/MessageForm"
import IsTypingFeedback from "../components/IsTypingFeedback"
import moment from "moment"
import MessageList from "../components/MessageList"

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
      <MessageList messages={chat.messages} />
      <IsTypingFeedback />
      <MessageForm />
    </div>
  )
}
