import { Link } from "react-router-dom"
import { useAuth } from "../providers/AuthProvider"

export default function NavBar() {
  const { authUser, setToken } = useAuth()

  return (
    <nav>
      <ul>
        {authUser ? (
          <>
            <li>
              <Link to="/chat">Chat</Link>
            </li>
            <li>
              <Link to="/profile">Profile</Link>
            </li>
            <li>
              <Link to="/settings">Settings</Link>
            </li>
            <li>
              <button onClick={() => setToken(null)}>Logout</button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}
