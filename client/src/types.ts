export type User = {
  _id: string
  name: string
  email: string
}

export type Message = {
  _id: string
  content: string
  sender: User
  timestamp: string
}
