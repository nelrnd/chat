import { useParams } from "react-router-dom"
import { useChat } from "../providers/ChatProvider"
import { useAuth } from "../providers/AuthProvider"
import MessageForm from "../components/MessageForm"
import IsTypingFeedback from "../components/IsTypingFeedback"
import MessageList from "../components/MessageList"
import ChatInfo from "../components/ChatInfo"
import { useEffect } from "react"

export default function Chat() {
  const { chatId } = useParams()
  const { chat, loading, readMessages } = useChat(chatId)
  const { authUser } = useAuth()

  useEffect(() => {
    if (authUser && chat && chat.unreadCount[authUser?._id]) {
      console.log("vroom")
      readMessages(chatId)
    }
  }, [chatId, chat, authUser, readMessages])

  if (loading) return <p>Loading...</p>

  if (!chat) return <p>Chat not found</p>

  const otherMember = chat?.members.find((user: User) => user._id !== authUser?._id)

  return (
    <div>
      <h1>Chat with {otherMember?.name || "deleted user"}</h1>
      <ChatInfo chat={chat} />
      <MessageForm />
      <MessageList messages={chat.messages} />
      <IsTypingFeedback />
    </div>
  )
}
