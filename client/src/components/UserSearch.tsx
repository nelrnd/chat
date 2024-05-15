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
                <UserTab key={user._id} user={user} />
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
}

function UserTab({ user }: UserTabProps) {
  const { authUser } = useAuth()
  const { findChat, createChat } = useChat()
  const navigate = useNavigate()

  const handleClick = async () => {
    let chat = findChat(user._id)
    if (!chat) {
      chat = await createChat([user._id, authUser?._id])
    }
    navigate(`/chat/${chat._id}`)
  }

  return (
    <li>
      <button onClick={handleClick} className="w-full p-2 rounded-lg hover:bg-neutral-900 transition-colors">
        <div className="text-left flex items-center gap-3">
          <Avatar src={user.avatar} className="w-[3rem]" />
          <div className="flex-1">
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-neutral-400">{user.email}</p>
          </div>
        </div>
      </button>
    </li>
  )
}
