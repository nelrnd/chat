import moment from "moment"
import { Media, Message as MessageType } from "../types"
import { useAuth } from "../providers/AuthProvider"
import Avatar from "./Avatar"
import { useImageViewer } from "@/providers/ImageViewerProvider"
import Game from "./Game"

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL

function linkify(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.split(urlRegex).map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a href={part} key={index} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">
          {part}
        </a>
      )
    }
    return part
  })
}

interface MessageProps {
  message: MessageType
  chatType: "private" | "group"
  followed: boolean
}

export default function Message({ message, chatType, followed }: MessageProps) {
  const { authUser } = useAuth()
  const fromMe = message.from._id === authUser?._id

  return (
    <li className={`w-full flex gap-3 items-end ${followed ? "mb-2" : "mb-4"}`}>
      {chatType === "group" && !fromMe && (
        <div className="w-[2.625rem]">{!followed && <Avatar src={message.from.avatar} className="w-full" />}</div>
      )}
      {message.type === "game" ? (
        <Game game={message.game} />
      ) : (
        <div className={`max-w-[80%] space-y-2 ${fromMe && "ml-auto flex flex-col items-end"}`}>
          {message.images?.map((image) => (
            <MessageImage key={image._id} image={image} />
          ))}
          {message.text && <MessageContent text={message.text} fromMe={fromMe} />}
          {!followed && <MessageMeta message={message} chatType={chatType} fromMe={fromMe} />}
        </div>
      )}
    </li>
  )
}

interface MessageContentProps {
  text: string
  fromMe: boolean
}

function MessageContent({ text, fromMe }: MessageContentProps) {
  return (
    <div
      className={`w-fit max-w-full px-4 py-3 break-words rounded-md ${
        fromMe ? "bg-indigo-600 rounded-br-none" : "bg-neutral-800 rounded-bl-none"
      }`}
    >
      {linkify(text)}
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
