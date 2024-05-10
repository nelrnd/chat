import { SubmitHandler, useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../providers/AuthProvider"
import axios from "axios"
import { useEffect, useState } from "react"

type Inputs = {
  email: string
  password: string
}

export default function Login() {
  const { register, handleSubmit } = useForm<Inputs>()
  const { token, setToken } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true)
    setError(null)
    await axios
      .post("/user/login", data)
      .then((res) => setToken(res.data.token))
      .catch((err) => {
        if (err.response && err.response.data.message) {
          setError(err.response.data.message)
        } else {
          setError(err.message)
        }
      })
    setLoading(false)
  }

  useEffect(() => {
    if (token) {
      navigate("/chat")
    }
  }, [token, navigate])

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register("email")} required />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register("password")} required />
        </div>

        {error && <p>{error}</p>}

        <button disabled={loading}>{loading ? "Loading..." : "Login"}</button>
      </form>

      <hr />

      <div>
        <p>
          <a href={import.meta.env.VITE_SERVER_BASE_URL + "/api/user/google/start"}>Login with Google</a>
        </p>
        <p>
          <a href={import.meta.env.VITE_SERVER_BASE_URL + "/api/user/github/start"}>Login with GitHub</a>
        </p>
      </div>

      <p>
        Don't have an account yet? <Link to="/register">Register</Link>
      </p>
    </div>
  )
}
