import { Link } from "react-router-dom"

export default function Login() {
  return (
    <div>
      <h1>Login</h1>
      <p>
        Don't have an account yet? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}
