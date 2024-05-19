import { BiInfoCircle } from "react-icons/bi"
import { useAuth } from "../providers/AuthProvider"
import { Chat } from "../types"
import { Button } from "./ui/button"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "./ui/sheet"
import Avatar, { GroupAvatar } from "./Avatar"
import { getChatName } from "@/utils"
import { UserTab } from "./UserSearch"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL

interface ChatInfoProps {
  chat: Chat
}

export default function ChatInfo({ chat }: ChatInfoProps) {
  const { chatId } = useParams()
  const { authUser } = useAuth()
  const [open, setOpen] = useState(false)
  const otherMembers = chat.members.filter((user) => user._id !== authUser._id)
  const chatType = chat.members.length > 2 ? "group" : "chat"

  useEffect(() => {
    setOpen(false)
  }, [chatId])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary">
          <BiInfoCircle />
          Info
        </Button>
      </SheetTrigger>

      <SheetContent className="border-l border-neutral-800 overflow-y-auto overflow-x-hidden pb-4">
        <header className="h-[6rem] p-6 flex justify-between items-center">
          <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            {chatType === "chat" ? "Chat info" : "Group info"}
          </h2>
          <SheetClose asChild>
            <Button variant="secondary">Close</Button>
          </SheetClose>
        </header>

        {chatType === "chat" ? (
          <section className="p-6 pt-3 text-center space-y-3">
            <Avatar src={otherMembers[0].avatar} className="w-[8rem] m-auto" />
            <div>
              <h3 className="font-semibold">{otherMembers[0].name}</h3>
              <p>{otherMembers[0].email}</p>
            </div>
            <p className="text-neutral-400">{otherMembers[0].bio}</p>
          </section>
        ) : (
          <section className="p-6 pt-3 text-center space-y-3">
            <GroupAvatar members={otherMembers} className="w-[8rem] m-auto" />
            <h3 className="font-semibold">{getChatName(otherMembers)}</h3>
          </section>
        )}

        {chatType === "group" && (
          <section className="p-6 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Members ({chat.members.length})</h4>
              <Button variant="link" className="p-0 h-auto">
                view all
              </Button>
            </div>
            <ul className="-mx-2 space-y-2">
              {[...otherMembers, authUser].slice(0, 3).map((user) => (
                <UserTab key={user._id} user={user} />
              ))}
            </ul>
          </section>
        )}

        <section className="p-6 space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Shared images ({chat.sharedImages.length})</h4>
            {chat.sharedImages.length > 0 && (
              <Button variant="link" className="p-0 h-auto">
                view all
              </Button>
            )}
          </div>
          {chat.sharedImages.length ? (
            <div className="grid grid-cols-3 gap-2">
              {chat.sharedImages.slice(0, 3).map((img) => (
                <div key={img.url} className="aspect-square overflow-hidden rounded-xl border border-neutral-800">
                  <img src={SERVER_BASE_URL + "/" + img.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-400">No shared images for now</p>
          )}
        </section>

        <section className="p-6 space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Shared links ({chat.sharedLinks.length})</h4>
            {chat.sharedLinks.length > 0 && (
              <Button variant="link" className="p-0 h-auto">
                view all
              </Button>
            )}
          </div>
          {chat.sharedLinks.length ? (
            <div className="space-y-2 truncate">
              {chat.sharedLinks.slice(0, 3).map((link) => (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-semibold hover:underline truncate"
                >
                  {link.url}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-neutral-400">No shared links for now</p>
          )}
        </section>
      </SheetContent>
    </Sheet>
  )
}
