import { Link } from "react-router-dom"

export default function Register() {
  return (
    <div>
      <h1>Register</h1>
      <p>
        Have an account already? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}
