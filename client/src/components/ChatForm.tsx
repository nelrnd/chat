import { SubmitHandler, useForm } from "react-hook-form"
import { useChat } from "../providers/ChatProvider"
import { useParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { socket } from "../socket"
import { Button } from "./ui/button"
import { BiImageAlt, BiJoystick, BiLoaderAlt, BiSend, BiX } from "react-icons/bi"

interface Inputs {
  content: string
  images: FileList | File[]
}

export default function ChatForm() {
  const { chatId } = useParams()
  const { chat, createMessage } = useChat(chatId)
  const { register, handleSubmit, reset, watch, setValue } = useForm<Inputs>()
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState<boolean | null>(null)
  const [empty, setEmpty] = useState(true)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onKeyDown = (event) => {
    if (event.target.value) {
      setEmpty(false)
    }
    if (timeout.current) {
      clearTimeout(timeout.current)
    }
    setIsTyping(true)
    timeout.current = setTimeout(() => {
      setIsTyping(false)
    }, 2000)
  }

  const removeImage = (img: File) => {
    setValue(
      "images",
      Array.from(images).filter((image) => image !== img)
    )
  }

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (loading || empty) return null
    setIsTyping(false)
    setLoading(true)
    const formData = new FormData()
    formData.append("content", data.content)
    formData.append("chatId", chatId || "")
    for (const image of data.images) {
      formData.append("images", image)
    }
    await createMessage(formData)
    reset()
    setLoading(false)
  }

  const content = watch("content")
  const images = watch("images")

  useEffect(() => {
    console.log("bing:", typeof content, content)
    if (content || (images && images.length)) {
      setEmpty(false)
    } else {
      setEmpty(true)
    }
  }, [content, images])

  useEffect(() => {
    if (isTyping) {
      socket.emit("start-typing", chatId)
    } else if (isTyping === false) {
      socket.emit("stop-typing", chatId)
    }
  }, [isTyping, chatId])

  return (
    <div className="max-w-[40rem] m-auto bg-neutral-900 rounded-2xl">
      {images && images.length > 0 && (
        <div className="p-1 flex gap-4 overflow-x-auto w-fit">
          {Array.from(images).map((img, id) => (
            <FormImagePreview key={id} img={img} onClick={removeImage} />
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="h-[5rem] p-4 flex items-center gap-4">
          <input
            id="images"
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            {...register("images")}
            multiple
            className="hidden"
          />

          <div className="flex items-center gap-1">
            {chat.type === "private" && (
              <Button size="icon" variant="ghost" className="hover:bg-neutral-800">
                <BiJoystick className="text-lg" />
              </Button>
            )}
            <Button size="icon" variant="ghost" className="hover:bg-neutral-800" asChild>
              <label htmlFor="images" className="cursor-pointer">
                <BiImageAlt className="text-lg" />
              </label>
            </Button>
          </div>

          <input
            placeholder="Type something..."
            {...register("content")}
            spellCheck="false"
            onKeyDown={onKeyDown}
            className="h-[4rem] flex-1 bg-transparent placeholder-neutral-300 focus:outline-none"
          />

          <Button disabled={loading || empty}>
            {loading ? (
              <BiLoaderAlt className="text-2xl animate-spin" />
            ) : (
              <>
                Send
                <BiSend className="text-lg" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

interface FormImagePreviewProps {
  img: File
  onClick: (img: File) => void | void
}

function FormImagePreview({ img, onClick }: FormImagePreviewProps) {
  const src = URL.createObjectURL(img)

  return (
    <div className="overflow-hidden w-fit shrink-0 rounded-xl border border-neutral-800 relative">
      <Button
        onClick={() => onClick(img)}
        variant="secondary"
        size="icon"
        className="absolute top-1 right-1"
        aria-label="Remove image"
      >
        <BiX className="text-xl" />
      </Button>
      <img src={src} alt="" className="h-[8rem]" />
    </div>
  )
}
