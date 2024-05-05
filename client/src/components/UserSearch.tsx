import axios from "axios"
import { useEffect, useState } from "react"
import { Chat, User } from "../types"
import { useNavigate } from "react-router-dom"
import { useChat } from "../providers/ChatProvider"
import { useAuth } from "../providers/AuthProvider"

export default function UserSearch() {
  const [value, setValue] = useState("")
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
      <input placeholder="Search for user" value={value} onChange={(e) => setValue(e.target.value)} />

      {value && <p>Search results:</p>}

      {value && results.length === 0 && loading === false && <p>No results...</p>}

      {loading === true && results.length === 0 && <p>Loading...</p>}

      {results.length > 0 && (
        <>
          <ul>
            {results.map((user) => (
              <UserTab key={user._id} user={user} />
            ))}
          </ul>
        </>
      )}

      {value && <hr />}
    </div>
  )
}

interface UserTabProps {
  user: User
}

function UserTab({ user }: UserTabProps) {
  const navigate = useNavigate()
  const { chats, loading } = useChat()

  const onClick = () => {
    if (!loading) {
      // check if chat already exists
      const chat = chats.find(
        (chat: Chat) => chat.members.length === 2 && chat.members.find((member: User) => member._id === user._id)
      )
      if (chat) {
        console.log("chat exists")
        navigate(`/chat/${chat._id}`)
      } else {
        console.log("chat don't exists")
      }
    }
  }

  return (
    <li>
      <button onClick={onClick}>
        {user.name} - {user.email}
      </button>
    </li>
  )
}
