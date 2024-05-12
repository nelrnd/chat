import { SubmitHandler, useForm } from "react-hook-form"
import { useChat } from "../providers/ChatProvider"
import { useParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { socket } from "../socket"
import { Button } from "./ui/button"

interface Inputs {
  content: string
  chatId: string
  images: FileList
}

export default function ChatForm() {
  const { chatId } = useParams()
  const { createMessage } = useChat()
  const { register, handleSubmit, reset } = useForm<Inputs>()
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState<boolean | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onKeyDown = () => {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }
    setIsTyping(true)
    timeout.current = setTimeout(() => {
      setIsTyping(false)
    }, 2000)
  }

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

  useEffect(() => {
    if (isTyping) {
      socket.emit("start-typing", chatId)
    } else if (isTyping === false) {
      socket.emit("stop-typing", chatId)
    }
  }, [isTyping, chatId])

  return (
    <div className="max-w-[40rem] m-auto bg-neutral-800 rounded-2xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="h-[6rem] p-4 flex items-center gap-4">
          <input
            id="images"
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            {...register("images")}
            multiple
            className="hidden"
          />
          <Button asChild>
            <label htmlFor="images">Image</label>
          </Button>

          <input
            placeholder="Type something..."
            {...register("content")}
            spellCheck="false"
            onKeyDown={onKeyDown}
            className="h-[4rem] flex-1 bg-transparent placeholder-neutral-300 focus:outline-none"
          />

          <input type="hidden" {...register("chatId")} value={chatId} required />

          <Button>Send</Button>
        </div>
      </form>
    </div>
  )
}
