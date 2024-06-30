import { BiInfoCircle } from "react-icons/bi"
import { useAuth } from "../providers/AuthProvider"
import { Chat, Media } from "../types"
import { Button } from "./ui/button"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "./ui/sheet"
import Avatar, { GroupAvatar } from "./Avatar"
import { getChatName } from "@/utils"
import { UserTab } from "./UserSearch"
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { ImageWrapper } from "@/providers/ImageViewerProvider"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "react-responsive"

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL

interface ChatInfoProps {
  chat: Chat
}

export default function ChatInfo({ chat }: ChatInfoProps) {
  const { chatId } = useParams()
  const { authUser } = useAuth()
  const isSmall = useMediaQuery({ query: "(max-width: 768px)" })

  const [open, setOpen] = useState(false)
  const otherMembers = chat.members.filter((user) => user._id !== authUser?._id)
  const chatType = chat.members.length > 2 ? "group" : "chat"

  useEffect(() => {
    setOpen(false)
  }, [chatId])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" size={isSmall ? "icon" : "default"}>
          <BiInfoCircle />
          <span className="sr-only md:not-sr-only">Info</span>
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

        <ChatImagesSection images={chat.images} />
        <ChatLinksSection links={chat.links} />
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

interface ChatImagesSectionProps {
  images: Media[]
}

function ChatImagesSection({ images }: ChatImagesSectionProps) {
  return (
    <Dialog>
      <section className="p-6 space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">Shared images ({images.length})</h4>
          {images.length > 0 && (
            <DialogTrigger asChild>
              <Button variant="link" className="p-0 h-auto">
                view all
              </Button>
            </DialogTrigger>
          )}
        </div>
        {images.length ? (
          <ul className="grid grid-cols-3 gap-2">
            {images.slice(0, 3).map((image, id) =>
              id === 2 && images.length > 3 ? (
                <DialogTrigger key={image._id} asChild>
                  <button className="relative">
                    <ImagePreview image={image} className="scale-125 blur-sm opacity-50" />
                    <div className="text-white text-sm absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap select-none">
                      + {images.length - 3} more
                    </div>
                  </button>
                </DialogTrigger>
              ) : (
                <ImageWrapper key={image._id} image={image}>
                  <ImagePreview image={image} />
                </ImageWrapper>
              )
            )}
          </ul>
        ) : (
          <p className="text-neutral-400">No shared images for now</p>
        )}
      </section>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shared images ({images.length})</DialogTitle>
          <ul className="max-h-[32rem] overflow-y-auto grid grid-cols-3 gap-2">
            {images.map((image) => (
              <ImageWrapper key={image._id} image={image}>
                <ImagePreview image={image} />
              </ImageWrapper>
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

interface ImagePreviewProps {
  image: Media
  className?: string
}

function ImagePreview({ image, className }: ImagePreviewProps) {
  return (
    <li className="aspect-square overflow-hidden rounded-xl border border-neutral-800">
      <img src={SERVER_BASE_URL + "/" + image.url} alt="" className={cn("w-full h-full object-cover", className)} />
    </li>
  )
}

interface ChatLinksSectionProps {
  links: Media[]
}

function ChatLinksSection({ links }: ChatLinksSectionProps) {
  return (
    <Dialog>
      <section className="p-6 space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">Shared links ({links.length})</h4>
          {links.length > 0 && (
            <DialogTrigger asChild>
              <Button variant="link" className="p-0 h-auto">
                view all
              </Button>
            </DialogTrigger>
          )}
        </div>
        {links.length ? (
          <ul className="space-y-2">
            {links.slice(0, 3).map((link) => (
              <LinkPreview key={link._id} url={link.url} short={true} />
            ))}
            {links.length > 3 && (
              <DialogTrigger asChild>
                <button className="block px-4 py-3 w-full font-semibold border border-neutral-800 rounded-lg hover:bg-neutral-900 transition-colors">
                  + {links.length - 3} more
                </button>
              </DialogTrigger>
            )}
          </ul>
        ) : (
          <p className="text-neutral-400">No shared links for now</p>
        )}
      </section>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shared links ({links.length})</DialogTitle>
          <ul className="max-h-[32rem] overflow-y-auto space-y-4">
            {links.map((link) => (
              <LinkPreview key={link._id} url={link.url} />
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

interface LinkPreviewProps {
  url: string
  short?: boolean
}

function LinkPreview({ url, short = false }: LinkPreviewProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block p-4 max-w-full font-semibold border border-neutral-800 rounded-lg hover:underline hover:bg-neutral-900 transition-colors ${
        short ? "truncate" : "break-all"
      }`}
    >
      {url}
    </a>
  )
}
