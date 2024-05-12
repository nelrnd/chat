import moment from "moment"
import { Message as MessageType } from "../types"
import { useAuth } from "../providers/AuthProvider"

interface MessageProps {
  message: MessageType
}

const urlRegex = /(https?:\/\/[^\s]+)/g

function linkify(text: string) {
  const parts = text.split(urlRegex)
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a href={part} key={index} target="_blank" rel="noopener noreferrer">
          {part}
        </a>
      )
    } else {
      return part
    }
  })
}
/*
export default function Message({ message }: MessageProps) {
  return (
    <li>
      <strong>{message.sender?.name || "deleted user"}: </strong>
      {message.images?.map((img) => (
        <img width="200" key={img} src={import.meta.env.VITE_SERVER_BASE_URL + "/" + img} />
      ))}
      {linkify(message.content)}- {moment(message.timestamp).format("LT")}
    </li>
  )
}
*/

export default function Message({ message }) {
  const { authUser } = useAuth()
  const fromMe = message.sender._id === authUser?._id

  return (
    <li className={`w-full flex ${fromMe ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[80%] space-y-2">
        <div className={`w-fit max-w-full px-4 py-3 rounded-md ${fromMe ? "bg-indigo-600" : "bg-neutral-800"}`}>
          {linkify(message.content)}
        </div>
        <div className={fromMe ? "text-right" : "text-left"}>{moment(message.timestamp).format("LT")}</div>
      </div>
    </li>
  )
}
