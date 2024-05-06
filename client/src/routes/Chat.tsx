import { useParams } from "react-router-dom"
import { useChat } from "../providers/ChatProvider"
import { useAuth } from "../providers/AuthProvider"
import { Message, User } from "../types"
import MessageForm from "../components/MessageForm"
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
          {chat.messages
            .reduce(
              (acc: Message[][], curr: Message, id: number, arr: Message[]) => {
                const accCopy = [...acc]
                const prevDate = arr[id - 1] && new Date(arr[id - 1].timestamp).toLocaleDateString("sv")
                const currDate = new Date(curr.timestamp).toLocaleDateString("sv")

                if (prevDate === currDate || id === 0) {
                  accCopy[accCopy.length - 1].push(curr)
                } else {
                  accCopy.push([curr])
                }

                return accCopy
              },
              [[]]
            )
            .map((day, id) => (
              <div key={"day" + id}>
                <p>{day[0].timestamp}</p>
                {day.map((msg) => (
                  <li key={msg._id}>
                    <strong>{msg.sender.name}: </strong>
                    {msg.content} - {moment(msg.timestamp).format("LT")}
                  </li>
                ))}
              </div>
            ))}
        </ul>
      )}

      <IsTypingFeedback />

      <MessageForm />
    </div>
  )
}
