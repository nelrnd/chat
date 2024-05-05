import axios from "axios"
import { useEffect, useState } from "react"
import { User } from "../types"
import { useNavigate } from "react-router-dom"

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

      {value && results.length === 0 && loading === false && <p>No results...</p>}

      {loading === true && results.length === 0 && <p>Loading...</p>}

      {results.length > 0 && (
        <ul>
          {results.map((user) => (
            <UserTab key={user._id} user={user} />
          ))}
        </ul>
      )}
    </div>
  )
}

interface UserTabProps {
  user: User
}

function UserTab({ user }: UserTabProps) {
  const navigate = useNavigate()

  const onClick = () => {
    console.log("go to this chat")
  }

  return (
    <li>
      <button onClick={onClick}>
        {user.name} - {user.email}
      </button>
    </li>
  )
}
