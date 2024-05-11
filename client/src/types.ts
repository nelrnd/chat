export type User = {
  _id: string
  name: string
  email: string
  isOnline: boolean
  bio?: string
  avatar?: string
}

export type Message = {
  _id: string
  content: string
  images?: string[]
  sender: User
  chat: Chat
  timestamp: string
}

export type Image = {
  _id: string
  url: string
  sender: User
  chat: string
  timestamp: string
}

export type Link = Image

export type Chat = {
  _id: string
  members: User[]
  messages: Message[]
  typingUsers: string[]
  sharedImages: Image[]
  sharedLinks: Link[]
  unreadCount: Record<string, number>
}
