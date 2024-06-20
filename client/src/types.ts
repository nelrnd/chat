export type User = {
  _id: string
  name: string
  email: string
  bio?: string
  avatar?: string
  isOnline: boolean
}

export type Message = {
  _id: string
  text: string
  images: Media[]
  links: Media[]
  from: User
  chat: string
  timestamp: string
}

export type Media = {
  _id: string
  type: "image" | "link"
  url: string
  from: User
  chat: string
  timestamp: string
}

export type Chat = {
  _id: string
  type: "private" | "group"
  members: User[]
  messages: Message[]
  images: Media[]
  links: Media[]
  typingUsers: string[]
  unreadCount: Record<string, number>
}

export type Game = {
  _id: string
  status: "waiting" | "running" | "over"
  board: (number | null)[]
  players: User[]
  startTurn: number
  turn: number
  from: string
  chat: string
  scores: Record<string, number>
}
