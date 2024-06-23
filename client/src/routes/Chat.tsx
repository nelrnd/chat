import { useEffect, useLayoutEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { useChat } from "../providers/ChatProvider"
import { useAuth } from "../providers/AuthProvider"
import IsTypingFeedback from "../components/IsTypingFeedback"
import MessageList from "../components/MessageList"
import { getChatName } from "../utils"
import ChatForm from "../components/ChatForm"
import Loader from "@/components/Loader"
import ChatInfo from "@/components/ChatInfo"
import { Chat as ChatType, Message } from "@/types"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

export default function Chat() {
  const { chatId } = useParams()
  const { authUser } = useAuth()
  const { chat, loading, readMessages } = useChat(chatId)

  useEffect(() => {
    if (chat?.unreadCount) {
      readMessages(chat._id)
    }
  }, [chatId, chat, authUser, readMessages])

  if (loading) return <Loader />

  if (!chat) return <ChatNotFound />

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ChatHeader chat={chat} />
      <ChatMessages messages={chat.messages} chatType={chat.type} />
      <IsTypingFeedback />
      <ChatFooter />
    </div>
  )
}

interface ChatHeaderProps {
  chat: ChatType
}

function splitText(text: string) {
  return text.split("").map((char, id) => (
    <span key={id} className={char !== " " ? "char inline-block" : ""}>
      {char}
    </span>
  ))
}

function ChatHeader({ chat }: ChatHeaderProps) {
  const { authUser } = useAuth()
  const otherMembers = chat.members.filter((user) => user._id !== authUser?._id)

  const heading = useRef(null)

  useGSAP(
    () => {
      gsap.from(".char", { duration: 0.25, stagger: 0.05, ease: "power1.out", y: 10, opacity: 0, rotateY: 40 })
    },
    { scope: heading, dependencies: [chat._id], revertOnUpdate: true }
  )

  return (
    <header className="h-[6rem] p-8 flex justify-between items-center border-b border-neutral-800">
      <div>
        <h1 ref={heading} className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
          {splitText(getChatName(otherMembers))}
        </h1>
        {otherMembers.length === 1 && otherMembers[0].isOnline && <p className="text-sm text-neutral-400">Online</p>}
      </div>
      <ChatInfo chat={chat} />
    </header>
  )
}

interface ChatMessages {
  messages: Message[]
  chatType: "private" | "group"
}

function ChatMessages({ messages, chatType }: ChatMessages) {
  const { chatId } = useParams()
  const elem = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    setTimeout(() => {
      if (elem.current) {
        elem.current.scrollTo(0, elem.current.scrollHeight)
      }
    }, 10)
  }, [chatId])

  return (
    <section className="px-6 pb-0 flex-1 overflow-y-auto" ref={elem}>
      <MessageList messages={messages} chatType={chatType} />
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

function ChatNotFound() {
  return (
    <div className="absolute inset-0 grid place-content-center">
      <h2 className="text-4xl font-semibold text-neutral-200 tracking-tight">Chat not found</h2>
    </div>
  )
}
