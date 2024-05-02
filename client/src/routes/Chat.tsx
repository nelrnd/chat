import axios from "axios"
import moment from "moment"
import { useEffect, useState } from "react"

type Message = {
  _id: string
  content: string
  sender: { _id: string; name: string; email: string }
  timestamp: number
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    axios.get("/message").then((res) => setMessages(res.data))
  }, [])

  return (
    <div>
      <h1>Chat</h1>

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
    </div>
  )
}
