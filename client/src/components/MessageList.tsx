import moment from "moment"
import { Message as MessageType } from "../types"
import Message from "./Message"
import React from "react"

interface MessageListProps {
  messages: MessageType[]
  chatType: "group" | "chat"
}

function splitMessagesIntoDays(messages: MessageType[]): MessageType[][] {
  return messages.reduce((acc: MessageType[][], curr: MessageType, id: number, arr: MessageType[]) => {
    const prevDate = arr[id - 1] && new Date(arr[id - 1].timestamp).toLocaleDateString("sv")
    const currDate = new Date(curr.timestamp).toLocaleDateString("sv")
    if (prevDate !== currDate) {
      return [...acc, [curr]]
    } else {
      const newAcc: MessageType[][] = acc.length ? [...acc] : [[]]
      newAcc[newAcc.length - 1].push(curr)
      return newAcc
    }
  }, [])
}

function formatDay(timestamp: string): string {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toLocaleDateString("sv") === today.toLocaleDateString("sv")) {
    return "Today"
  } else if (date.toLocaleDateString("sv") === yesterday.toLocaleDateString("sv")) {
    return "Yesterday"
  } else if (date.getFullYear() === today.getFullYear()) {
    return moment(date).format("MMM D")
  } else {
    return moment(date).format("MMM D YY")
  }
}

export default function MessageList({ messages, chatType }: MessageListProps) {
  if (messages.length < 1) return null

  const checkFollowed = (currMessage, nextMessage) => {
    console.log(currMessage)
    if (
      !nextMessage ||
      currMessage.sender._id !== nextMessage.sender._id ||
      Math.floor(new Date(currMessage.timestamp).getTime() / 1000 / 60) !==
        Math.floor(new Date(nextMessage.timestamp).getTime() / 1000 / 60)
    ) {
      return false
    }

    return true
  }

  return (
    <ul className="max-w-[40rem] m-auto">
      {splitMessagesIntoDays(messages).map((day) => (
        <div key={day[0].timestamp} className="relative pt-4">
          <h3 className="sticky top-4 text-sm px-3 py-1.5 w-fit m-auto bg-neutral-900 rounded-full border border-neutral-800 mb-4">
            {formatDay(day[0].timestamp)}
          </h3>
          {day.map((msg, id) => (
            <Message key={msg._id} message={msg} chatType={chatType} followed={checkFollowed(msg, day[id + 1])} />
          ))}
        </div>
      ))}
    </ul>
  )
}

function Day({ messages }) {
  return (
    <React.Fragment key={messages[0].timestamp}>
      <h3>{formatDay(messages[0].timestamp)}</h3>
      {messages.map((msg) => (
        <Message key={msg._id} message={msg} />
      ))}
    </React.Fragment>
  )
}
