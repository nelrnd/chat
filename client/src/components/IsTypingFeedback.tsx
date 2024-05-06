import { useParams } from "react-router-dom"
import { useChat } from "../providers/ChatProvider"

export default function IsTypingFeedback() {
  const { chatId } = useParams()
  const { chat } = useChat(chatId)

  const formatIsTyping = (arr: string[]) => {
    return (
      arr.reduce((acc, curr, id) => acc + (id == arr.length - 1 ? " and " : ", ") + curr) +
      (arr.length > 1 ? " are typing" : " is typing")
    )
  }

  if (chat.typingUsers.length === 0) return null

  return <p>{formatIsTyping(chat.typingUsers)}</p>
}
