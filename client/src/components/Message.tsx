import moment from "moment"
import { Message as MessageType } from "../types"
import Linkify from "react-linkify"

interface MessageProps {
  message: MessageType
}

export default function Message({ message }: MessageProps) {
  return (
    <li>
      <strong>{message.sender?.name || "deleted user"}: </strong>
      <Linkify
        componentDecorator={(decoratedHref: string, decoratedText: string, key: number) => (
          <a href={decoratedHref} key={key} target="_blank">
            {decoratedText}
          </a>
        )}
      >
        {message.content}
      </Linkify>{" "}
      - {moment(message.timestamp).format("LT")}
    </li>
  )
}
