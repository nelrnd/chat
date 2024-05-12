import { useEffect } from "react"
import { useParams } from "react-router-dom"
import { useChat } from "../providers/ChatProvider"
import { useAuth } from "../providers/AuthProvider"
import MessageForm from "../components/MessageForm"
import IsTypingFeedback from "../components/IsTypingFeedback"
import MessageList from "../components/MessageList"
import ChatInfo from "../components/ChatInfo"
import { Button } from "../components/ui/button"
import { getChatName } from "../utils"
import ChatForm from "../components/ChatForm"

export default function Chat() {
  const { chatId } = useParams()
  const { chat, loading, readMessages } = useChat(chatId)
  const { authUser } = useAuth()

  useEffect(() => {
    if (authUser && chat && chat.unreadCount[authUser?._id]) {
      readMessages(chatId)
    }
  }, [chatId, chat, authUser, readMessages])

  if (loading) return <p>Loading...</p>

  if (!chat) return <p>Chat not found</p>

  const otherMember = chat?.members.find((user: User) => user._id !== authUser?._id)

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ChatHeader chat={chat} />
      <ChatMessages messages={chat.messages} />
      <IsTypingFeedback />
      <ChatFooter />
    </div>
  )
}

function ChatHeader({ chat }) {
  const { authUser } = useAuth()
  const otherMembers = chat.members.filter((user) => user._id !== authUser?._id)

  return (
    <header className="h-[6rem] p-8 flex justify-between items-center border-b border-neutral-800">
      <div className="space-y-1">
        <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">{getChatName(otherMembers)}</h1>
        {otherMembers.length === 1 && otherMembers[0].isOnline && <p className="text-sm text-neutral-400">Online</p>}
      </div>
      <Button>Info</Button>
    </header>
  )
}

function ChatMessages({ messages }) {
  return (
    <section className="p-6 pb-0 flex-1 overflow-y-auto">
      <MessageList messages={messages} />
    </section>
  )
}

function ChatFooter() {
  return (
    <footer className="p-6">
      <ChatForm />
    </footer>
  )
}
