import Loader from "@/components/Loader"
import { useChat } from "../providers/ChatProvider"

export default function Chats() {
  const { loading } = useChat()

  if (loading) return <Loader />

  return (
    <div>
      <h1>Chats</h1>

      <p>Open a chat</p>
    </div>
  )
}
