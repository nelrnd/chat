import moment from "moment"
import { Message as MessageType } from "../types"

interface MessageProps {
  message: MessageType
}

export default function Message({ message }: MessageProps) {
  return (
    <li>
      <strong>{message.sender?.name || "deleted user"}: </strong>
      {message.content} - {moment(message.timestamp).format("LT")}
    </li>
  )
}
