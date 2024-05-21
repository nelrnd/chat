import moment from "moment"
import { Image, Message as MessageType } from "../types"
import { useAuth } from "../providers/AuthProvider"
import Avatar from "./Avatar"
import { useImageViewer } from "@/providers/ImageViewerProvider"

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL
const urlRegex = /(https?:\/\/[^\s]+)/g

function linkify(text: string) {
  const parts = text.split(urlRegex)
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a href={part} key={index} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
          {part}
        </a>
      )
    } else {
      return part
    }
  })
}

interface MessageProps {
  message: MessageType
  chatType: "chat" | "group"
  followed: boolean
}

export default function Message({ message, chatType, followed }: MessageProps) {
  const { authUser } = useAuth()
  const fromMe = message.sender._id === authUser?._id

  return (
    <li className={`w-full flex gap-3 items-end ${followed ? "mb-2" : "mb-4"}`}>
      {chatType === "group" && !fromMe && (
        <div className="w-[2.625rem]">{!followed && <Avatar src={message.sender.avatar} className="w-full" />}</div>
      )}
      <div className={`max-w-[80%] space-y-2 ${fromMe && "ml-auto flex flex-col items-end"}`}>
        {message.images?.map((image) => (
          <MessageImage key={image._id} image={image} />
        ))}
        {message.content && <MessageContent content={message.content} fromMe={fromMe} />}
        {!followed && <MessageMeta message={message} chatType={chatType} fromMe={fromMe} />}
      </div>
    </li>
  )
}

interface MessageContentProps {
  content: string
  fromMe: boolean
}

function MessageContent({ content, fromMe }: MessageContentProps) {
  return (
    <div
      className={`w-fit max-w-full px-4 py-3 break-words rounded-md ${
        fromMe ? "bg-indigo-600 rounded-br-none" : "bg-neutral-800 rounded-bl-none"
      }`}
    >
      {linkify(content)}
    </div>
  )
}

interface MessageImageProps {
  image: Image
}

function MessageImage({ image }: MessageImageProps) {
  const { setImage } = useImageViewer()

  return (
    <button
      onClick={() => setImage(image)}
      className="h-[16rem] w-auto max-w-full overflow-hidden rounded-2xl shadow-xl hover:opacity-90 transition-opacity"
    >
      <img src={SERVER_BASE_URL + "/" + image.url} alt="" className="block h-[16rem]" />
    </button>
  )
}

interface MessageMetaProps {
  message: MessageType
  chatType: "group" | "chat"
  fromMe: boolean
}

function MessageMeta({ message, chatType, fromMe }: MessageMetaProps) {
  return (
    <div className={`w-fit text-xs text-neutral-400`}>
      {chatType === "group" && !fromMe && message.sender.name + " • "} {moment(message.timestamp).format("LT")}
    </div>
  )
}
