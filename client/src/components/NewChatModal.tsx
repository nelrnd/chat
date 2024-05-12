import { useEffect, useRef, useState } from "react"
import { User } from "../types"
import axios from "axios"
import { useChat } from "../providers/ChatProvider"
import { useAuth } from "../providers/AuthProvider"
import { useNavigate } from "react-router-dom"

export default function NewChatModal() {
  const modal = useRef(null)
  const [value, setValue] = useState("")
  const [results, setResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState([])
  const navigate = useNavigate()

  const { chats, findChat, createChat } = useChat()
  const { authUser } = useAuth()
  const people = chats
    ?.filter((chat) => chat.messages.length > 0)
    .sort(
      (a, b) =>
        new Date(b.messages[b.messages.length - 1].timestamp).getTime() -
        new Date(a.messages[a.messages.length - 1].timestamp).getTime()
    )
    .reduce((acc, curr) => {
      const members = curr.members.filter((user) => {
        return acc.find((u) => u._id === user._id) === undefined && user._id !== authUser?._id
      })
      return [...acc, ...members]
    }, [])

  const openModal = () => {
    if (modal.current) {
      modal.current.showModal()
    }
  }

  const closeModal = () => {
    if (modal.current) {
      modal.current.close()
    }
  }

  const handleChange = (e, user) => {
    if (e.target.checked) {
      setSelectedUsers((users) => (users.find((u) => u._id === user._id) ? users : [...users, user]))
    } else {
      setSelectedUsers((users) => users.filter((u) => u._id !== user._id))
    }
  }

  const handleContinue = async () => {
    const members = [...selectedUsers.map((user) => user._id), authUser?._id]

    let chat

    if (members.length === 2) {
      chat = findChat(members[0])
    }

    if (!chat) {
      chat = await createChat(members)
    }

    navigate(`/chat/${chat._id}`)
  }

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
      <button onClick={openModal}>New Chat</button>

      <dialog ref={modal}>
        <h2>New chat</h2>

        {results.length
          ? results.map((user) => (
              <UserItem
                key={user._id}
                user={user}
                handleChange={handleChange}
                checked={!!selectedUsers.find((u) => u._id === user._id)}
              />
            ))
          : people.map((user) => (
              <UserItem
                key={user._id}
                user={user}
                handleChange={handleChange}
                checked={!!selectedUsers.find((u) => u._id === user._id)}
              />
            ))}

        <input placeholder="Search for user" value={value} onChange={(e) => setValue(e.target.value)} />

        <button onClick={closeModal}>Close</button>
        <button onClick={handleContinue}>Continue</button>
        {selectedUsers.length}
      </dialog>
    </div>
  )
}

function UserItem({ user, handleChange, checked }) {
  return (
    <li>
      <input type="checkbox" id={user._id} name={user._id} onChange={(e) => handleChange(e, user)} checked={checked} />
      <label htmlFor={user._id}>{user.name}</label>
    </li>
  )
}
