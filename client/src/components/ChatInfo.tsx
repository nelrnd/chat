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
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL

interface ChatInfoProps {
  chat: Chat
}

export default function ChatInfo({ chat }: ChatInfoProps) {
  const { chatId } = useParams()
  const { authUser } = useAuth()

  const [open, setOpen] = useState(false)
  const otherMembers = chat.members.filter((user) => user._id !== authUser?._id)
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
              <MembersModal members={[...otherMembers, authUser]} />
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
            <h4 className="font-semibold">Shared images ({chat.images.length})</h4>
            {chat.images.length > 0 && <SharedImagesModal images={chat.images} />}
          </div>
          {chat.images.length ? (
            <ul className="grid grid-cols-3 gap-2">
              {chat.images.slice(0, 3).map((img) => (
                <li key={img._id} className="aspect-square overflow-hidden rounded-xl border border-neutral-800">
                  <img src={SERVER_BASE_URL + "/" + img.url} alt="" className="w-full h-full object-cover" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-neutral-400">No shared images for now</p>
          )}
        </section>

        <section className="p-6 space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Shared links ({chat.links.length})</h4>
            {chat.links.length > 0 && <SharedLinksModal links={chat.links} />}
          </div>
          {chat.links.length ? (
            <ul className="space-y-2 truncate">
              {chat.links.slice(0, 3).map((link) => (
                <li key={link._id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-semibold hover:underline truncate"
                  >
                    {link.url}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-neutral-400">No shared links for now</p>
          )}
        </section>
      </SheetContent>
    </Sheet>
  )
}

function MembersModal({ members }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto">
          view all
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>All members ({members.length})</DialogTitle>
          <ul className="-mx-2 space-y-2 max-h-[32rem] overflow-y-auto">
            {members.map((user) => (
              <UserTab key={user._id} user={user} />
            ))}
          </ul>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SharedImagesModal({ images }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto">
          view all
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shared images ({images.length})</DialogTitle>
          <ul className="grid grid-cols-3 gap-2 max-h-[32rem] overflow-y-auto">
            {images.map((img) => (
              <li key={img.url} className="aspect-square overflow-hidden rounded-xl border border-neutral-800">
                <img src={SERVER_BASE_URL + "/" + img.url} alt="" className="w-full h-full object-cover" />
              </li>
            ))}
          </ul>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SharedLinksModal({ links }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto">
          view all
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shared links ({links.length})</DialogTitle>
          <ul className="space-y-3 max-h-[32rem] overflow-y-auto">
            {links.map((link) => (
              <li key={link._id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-semibold hover:underline break-words"
                >
                  {link.url}
                </a>
              </li>
            ))}
          </ul>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
