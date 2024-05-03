import axios from "axios"
import moment from "moment"
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"

type Message = {
  _id: string
  content: string
  sender: { _id: string; name: string; email: string }
  timestamp: number
}

interface Inputs {
  content: string
}

export default function Chat() {
  const { register, handleSubmit, reset } = useForm<Inputs>()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axios.get("/message").then((res) => setMessages(res.data))
  }, [])

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true)
    try {
      const res = await axios.post("/message", data)
      setMessages((prev) => [...prev, res.data])
      reset()
    } catch (err) {
      console.log(err)
    }
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
