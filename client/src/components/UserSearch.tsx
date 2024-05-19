import axios from "axios"
import { useEffect, useState } from "react"
import { User } from "../types"
import { useNavigate } from "react-router-dom"
import { useChat } from "../providers/ChatProvider"
import { useAuth } from "../providers/AuthProvider"
import { Input } from "./ui/input"
import Avatar from "./Avatar"
import { BiLoaderAlt, BiSearch } from "react-icons/bi"

export default function UserSearch({ value, setValue }) {
  const [results, setResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  const clearValue = () => setValue("")

  useEffect(() => {
    if (value) {
      setLoading(true)
      axios
        .get(`/user/search?term=${value}`)
        .then((res) => {
          setResults(res.data)
          setLoading(false)
        })
        .catch((err) => console.log(err))
    } else {
      setResults([])
    }
  }, [value])

  return (
    <div>
      <div className="relative">
        <BiSearch className="text-neutral-400 text-lg absolute top-1/2 -translate-y-1/2 left-4 pointer-events-none" />
        <Input
          placeholder="Search users"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          spellCheck="false"
          className="pl-10"
        />
      </div>

      {value && (
        <div className="mt-4">
          {loading === true && results.length === 0 && (
            <p className="text-center text-neutral-400">
              <BiLoaderAlt className="text-2xl animate-spin m-auto" />
            </p>
          )}
          {results.length === 0 && loading === false && <p className="text-center text-neutral-400">No user found</p>}
          {results.length > 0 && (
            <ul className="-mx-2 space-y-2">
              {results.map((user) => (
                <UserTab key={user._id} user={user} onClick={clearValue} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

interface UserTabProps {
  user: User
  onClick?: () => void
}

export function UserTab({ user, onClick }: UserTabProps) {
  const { authUser } = useAuth()
  const { findChat, createChat } = useChat()
  const navigate = useNavigate()

  const handleClick = async () => {
    if (user._id === authUser._id) return
    let chat = findChat(user._id)
    if (!chat) {
      chat = await createChat([user._id, authUser?._id])
    }
    navigate(`/chat/${chat._id}`)
    if (onClick) {
      onClick()
    }
  }

  return (
    <li>
      <button
        onClick={handleClick}
        className={`w-full p-2 rounded-lg ${
          user._id !== authUser._id ? "hover:bg-neutral-900" : "cursor-default"
        } transition-colors`}
      >
        <div className="text-left flex items-center gap-3">
          <Avatar src={user.avatar} className="w-[3rem] shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{user.name}</h3>
            <p className="text-neutral-400 text-sm truncate">{user.email}</p>
          </div>
          {user._id === authUser._id && <p className="text-xs text-neutral-400">you</p>}
        </div>
      </button>
    </li>
  )
}
