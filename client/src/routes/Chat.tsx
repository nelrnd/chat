import { useParams } from "react-router-dom"
import { useChat } from "../providers/ChatProvider"
import { useAuth } from "../providers/AuthProvider"
import { User } from "../types"
import MessageForm from "../components/MessageInput"

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

      <MessageForm />
    </div>
  )
}
