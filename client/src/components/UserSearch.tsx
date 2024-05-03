import axios from "axios"
import { useEffect, useState } from "react"

export default function UserSearch() {
  const [value, setValue] = useState("")
  const [results, setResults] = useState([])
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
            <li key={user._id}>
              {user.name} - {user.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
