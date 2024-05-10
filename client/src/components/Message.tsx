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
      {message.images?.map((img) => (
        <img width="200" key={img} src={import.meta.env.VITE_SERVER_BASE_URL + "/" + img} />
      ))}
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
