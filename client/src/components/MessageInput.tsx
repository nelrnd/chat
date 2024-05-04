import { SubmitHandler, useForm } from "react-hook-form"
import { useChat } from "../providers/ChatProvider"
import { useEffect, useRef, useState } from "react"
import { socket } from "../socket"
import { useAuth } from "../providers/AuthProvider"

interface Inputs {
  content: string
}

export default function MessageForm() {
  const { authUser } = useAuth()
  const { createMessage } = useChat()
  const { register, handleSubmit, reset } = useForm<Inputs>()
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState<boolean | null>(null)

  const timeout = useRef<number | null>(null)

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsTyping(false)
    setLoading(true)
    await createMessage(data)
    reset()
    setLoading(false)
  }

  const onKeyDown = () => {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }
    setIsTyping(true)
    timeout.current = setTimeout(() => {
      setIsTyping(false)
    }, 2000)
  }

  useEffect(() => {
    if (isTyping) {
      socket.emit("started typing", authUser?.name)
    } else if (isTyping === false) {
      socket.emit("stopped typing", authUser?.name)
    }
  }, [isTyping, authUser?.name])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <textarea
        placeholder="Type something"
        {...register("content")}
        required
        spellCheck="false"
        onKeyDown={onKeyDown}
      ></textarea>
      <button disabled={loading}>{loading ? "Loading..." : "Submit"}</button>
    </form>
  )
}
