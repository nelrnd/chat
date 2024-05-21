import { useParams } from "react-router-dom"
import { useChat } from "../providers/ChatProvider"
import { User } from "../types"

export default function IsTypingFeedback() {
  const { chatId } = useParams()
  const { chat } = useChat(chatId)

  const formatIsTyping = (arr: string[]) => {
    return (
      arr
        .map((user) => chat.members.find((member: User) => member._id === user)?.name || "someone")
        .reduce((acc, curr, id) => acc + (id == arr.length - 1 ? " and " : ", ") + curr) +
      (arr.length > 1 ? " are typing" : " is typing")
    )
  }

  if (chat.typingUsers.length === 0) return null

  return (
    <div className="px-6">
      <p className="w-[40rem] m-auto">{formatIsTyping(chat.typingUsers)}...</p>
    </div>
  )
}
