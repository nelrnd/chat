import moment from "moment"
import { useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { useChat } from "../providers/ChatProvider"

interface Inputs {
  content: string
}

export default function Chat() {
  const { messages, createMessage } = useChat()
  const { register, handleSubmit, reset } = useForm<Inputs>()
  const [loading, setLoading] = useState(false)

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true)
    await createMessage(data)
    reset()
    setLoading(false)
  }

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

      <form onSubmit={handleSubmit(onSubmit)}>
        <textarea placeholder="Type something" {...register("content")} required spellCheck="false"></textarea>
        <button disabled={loading}>{loading ? "Loading..." : "Submit"}</button>
      </form>
    </div>
  )
}
