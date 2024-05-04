import moment from "moment"
import { useChat } from "../providers/ChatProvider"
import UserSearch from "../components/UserSearch"
import MessageForm from "../components/MessageInput"
import IsTypingFeedback from "../components/IsTypingFeedback"

export default function Chat() {
  const { messages } = useChat()

  return (
    <div>
      <h1>Chat</h1>

      <UserSearch />

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
