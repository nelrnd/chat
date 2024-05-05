export type User = {
  _id: string
  name: string
  email: string
}

export type Message = {
  _id: string
  content: string
  sender: User
  chat: Chat
  timestamp: string
}

export type Chat = {
  _id: string
  members: User[]
  messages: Message[]
}
