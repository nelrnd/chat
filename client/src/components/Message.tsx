import moment from "moment"
import { Message as MessageType } from "../types"
import { useAuth } from "../providers/AuthProvider"

interface MessageProps {
  message: MessageType
}

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

export default function Message({ message }: MessageProps) {
  const { authUser } = useAuth()
  const fromMe = message.sender._id === authUser?._id

  return (
    <li className={`w-full flex ${fromMe ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] space-y-2 flex flex-col ${fromMe ? "items-end" : "items-start"}`}>
        {message.images.map((img) => (
          <img key={img} src={SERVER_BASE_URL + "/" + img} alt="" className="block" />
        ))}
        {message.content && (
          <div
            className={`w-fit max-w-full px-4 py-3 break-words rounded-md ${
              fromMe ? "bg-indigo-600" : "bg-neutral-800"
            }`}
          >
            {linkify(message.content)}
          </div>
        )}
        <div className={`text-xs text-neutral-400 ${fromMe ? "text-right" : "text-left"}`}>
          {moment(message.timestamp).format("LT")}
        </div>
      </div>
    </li>
  )
}
