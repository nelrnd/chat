import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../providers/AuthProvider"
import { useEffect } from "react"

export default function Home() {
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      navigate("/chat")
    }
  }, [token, navigate])

  return (
    <div>
      <h1>Home</h1>
      <p>
        <Link to="/login">Login</Link> or <Link to="/register">register</Link>
      </p>
    </div>
  )
}
