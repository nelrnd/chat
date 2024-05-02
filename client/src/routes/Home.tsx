import { Link } from "react-router-dom"

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
      <p>
        <Link to="/login">Login</Link> or <Link to="/register">register</Link>
      </p>
    </div>
  )
}
