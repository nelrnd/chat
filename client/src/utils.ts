import { Chat } from "./types"

export function getChatName(members) {
  if (members.length === 1) {
    return members[0].name
  } else {
    return members.reduce((acc, curr, id) => acc + (id > 0 ? ", " : "") + curr.name, "") + " and you"
  }
}

export function formatIsTyping(chat, arr: string[], type = "long") {
  if (chat.type === "private" && arr.length && type === "short") {
    return "is typing..."
  }

  return (
    arr
      .map((user) => chat.members.find((member) => member._id === user)?.name || "someone")
      .reduce((acc, curr, id) => acc + (id == arr.length - 1 ? " and " : ", ") + curr) +
    (arr.length > 1 ? " are typing..." : " is typing...")
  )
}

export function sortChats(a: Chat, b: Chat) {
  if (a.messages.length === 0) {
    return -1
  }

  if (b.messages.length === 0) {
    return 1
  }

  return (
    new Date(b.messages[b.messages.length - 1].timestamp).getTime() -
    new Date(a.messages[a.messages.length - 1].timestamp).getTime()
  )
}
