import moment from "moment"
import { Message as MessageType } from "../types"

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
