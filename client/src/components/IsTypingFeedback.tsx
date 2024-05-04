import { useChat } from "../providers/ChatProvider"

export default function IsTypingFeedback() {
  const { typingUsers } = useChat()

  const typingArray = Array.from(typingUsers)

  const formatIsTyping = (arr: string[]) => {
    return (
      arr.reduce((acc, curr, id) => acc + (id == arr.length - 1 ? " and " : ", ") + curr) +
      (arr.length > 1 ? " are typing" : " is typing")
    )
  }

  if (typingArray.length === 0) return null

  return <p>{formatIsTyping(typingArray)}</p>
}
