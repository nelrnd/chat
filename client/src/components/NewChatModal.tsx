import { useEffect, useState } from "react"
import axios from "axios"
import { useChat, useChats } from "../providers/ChatProvider"
import { useAuth } from "../providers/AuthProvider"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { BiLoaderAlt, BiMessageAdd, BiSearch, BiX } from "react-icons/bi"
import { sortChats } from "@/utils"
import Avatar from "./Avatar"
import { Input } from "./ui/input"
import { useNavigate } from "react-router-dom"

export default function NewChatModal() {
  const { authUser } = useAuth()
  const { chats, findChat, createChat } = useChats()
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState([])
  const navigate = useNavigate()

  const heading = selectedUsers.length < 2 ? "New chat" : "New group chat"

  const usersFromChats = chats
    .filter((chat) => chat.messages.length > 0)
    .sort(sortChats)
    .reduce(
      (acc, curr) => [
        ...acc,
        ...curr.members.filter(
          (user) => acc.find((u) => u._id === user._id) === undefined && user._id !== authUser._id
        ),
      ],
      []
    )

  const onChange = (event, user) => {
    if (event.target.checked) {
      setSelectedUsers((users) => (users.find((u) => u._id === user._id) ? users : [...users, user]))
    } else {
      setSelectedUsers((users) => users.filter((u) => u._id !== user._id))
    }
  }

  const removeUser = (user) => {
    setSelectedUsers((users) => users.filter((u) => u._id !== user._id))
  }

  const checkChecked = (user) => {
    return !!selectedUsers.find((u) => u._id === user._id)
  }

  const handleSubmit = async () => {
    setLoading(true)
    const members = [...selectedUsers, authUser].map((user) => user._id)
    let chat
    if (members.length === 2) {
      chat = findChat(members[0])
    }
    if (!chat) {
      chat = await createChat(members)
    }
    setLoading(false)
    setOpen(false)
    navigate(`/chat/${chat._id}`)
  }

  useEffect(() => {
    if (searchTerm) {
      setSearchLoading(true)
      axios
        .get(`/user/search?term=${searchTerm}`)
        .then((res) => {
          setResults(res.data)
          setSearchLoading(false)
        })
        .catch((err) => console.log(err))
    } else {
      setResults([])
    }
  }, [searchTerm])

  useEffect(() => {
    if (!open) {
      setSelectedUsers([])
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1">
          <BiMessageAdd className="text-lg" />
          New
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{heading}</DialogTitle>

          <div className="relative">
            <BiSearch className="text-neutral-400 text-lg absolute top-1/2 -translate-y-1/2 left-4 pointer-events-none" />
            <Input
              placeholder="Search users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              spellCheck="false"
              className="pl-10"
            />
          </div>

          {selectedUsers.length > 0 && (
            <ul className="flex gap-3 flex-wrap">
              {selectedUsers.map((user) => (
                <SelectedUserButton key={user._id} user={user} onClick={() => removeUser(user)} />
              ))}
            </ul>
          )}

          {searchTerm ? (
            <div>
              {searchLoading === true && results.length === 0 && (
                <p className="text-center text-neutral-400">
                  <BiLoaderAlt className="text-2xl animate-spin m-auto" />
                </p>
              )}
              {results.length === 0 && searchLoading === false && (
                <p className="text-center text-neutral-400">No user found</p>
              )}
              {results.length > 0 && (
                <ul className="-mx-2 space-y-2">
                  {results.map((user) => (
                    <UserCheckbox key={user._id} user={user} onChange={onChange} checked={checkChecked(user)} />
                  ))}
                </ul>
              )}
            </div>
          ) : (
            usersFromChats.length > 0 && (
              <ul className="-mx-2 space-y-2">
                {usersFromChats.map((user) => (
                  <UserCheckbox key={user._id} user={user} onChange={onChange} checked={checkChecked(user)} />
                ))}
              </ul>
            )
          )}
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={loading || selectedUsers.length < 1}>
            {loading ? <BiLoaderAlt className="text-2xl animate-spin" /> : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function UserCheckbox({ user, onChange, checked }) {
  return (
    <li>
      <input
        type="checkbox"
        id={user._id}
        name={user._id}
        onChange={(e) => onChange(e, user)}
        checked={checked}
        className="hidden"
      />
      <label htmlFor={user._id}>
        <div className="w-full p-2 rounded-lg hover:bg-neutral-900 transition-colors text-left flex items-center gap-3 cursor-pointer">
          <Avatar src={user.avatar} className="w-[3rem]" />
          <div className="flex-1">
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-neutral-400">{user.email}</p>
          </div>
          <div>
            {checked ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C6.486 2 2 6.486 2 12C2 17.514 6.486 22 12 22C17.514 22 22 17.514 22 12C22 6.486 17.514 2 12 2ZM10.001 16.413L6.288 12.708L7.7 11.292L9.999 13.587L15.293 8.293L16.707 9.707L10.001 16.413Z"
                  fill="white"
                />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2C6.486 2 2 6.486 2 12C2 17.514 6.486 22 12 22C17.514 22 22 17.514 22 12C22 6.486 17.514 2 12 2ZM12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12C20 16.411 16.411 20 12 20Z"
                  fill="#A3A3A3"
                />
              </svg>
            )}
          </div>
        </div>
      </label>
    </li>
  )
}

function SelectedUserButton({ user, onClick }) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 bg-neutral-900 text-sm rounded-full hover:bg-neutral-900/70 transition-colors"
    >
      <div className="flex items-center gap-1.5">
        <Avatar src={user.avatar} className="w-5" />
        <p className="leadin-none">{user.name}</p>
        <BiX className="text-neutral-400" />
      </div>
    </button>
  )
}
