import { SubmitHandler, useForm } from "react-hook-form"
import { useChat } from "../providers/ChatProvider"
import { useEffect, useRef, useState } from "react"
import { socket } from "../socket"
import { useAuth } from "../providers/AuthProvider"
import { useParams } from "react-router-dom"

interface Inputs {
  content: string
  chatId: string
  images: FileList
}

export default function MessageForm() {
  const { chatId } = useParams()
  const { authUser } = useAuth()
  const { createMessage } = useChat()
  const { register, handleSubmit, reset } = useForm<Inputs>()
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState<boolean | null>(null)

  const timeout = useRef<number | null>(null)

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsTyping(false)
    setLoading(true)
    const formData = new FormData()
    formData.append("content", data.content)
    formData.append("chatId", data.chatId)
    for (const image of data.images) {
      formData.append("images", image)
    }
    await createMessage(formData)
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
      socket.emit("start-typing", chatId)
    } else if (isTyping === false) {
      socket.emit("stop-typing", chatId)
    }
  }, [isTyping, chatId])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <textarea
        placeholder="Type something"
        {...register("content")}
        required
        spellCheck="false"
        onKeyDown={onKeyDown}
      ></textarea>
      <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" {...register("images")} multiple />
      <input type="hidden" {...register("chatId")} value={chatId} required />
      <button disabled={loading}>{loading ? "Loading..." : "Submit"}</button>
    </form>
  )
}
