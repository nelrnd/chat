import axios from "axios"
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../providers/AuthProvider"

type Inputs = {
  name: string
  email: string
  password: string
}

export default function Register() {
  const { register, handleSubmit } = useForm<Inputs>()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true)
    setError(null)
    await axios
      .post("/user/register", data)
      .then(() => navigate("/login"))
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
      <h1>Register</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="name">Display name</label>
          <input id="name" {...register("name")} required />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register("email")} required />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" {...register("password")} required />
        </div>

        {error && <p>{error}</p>}

        <button disabled={loading}>{loading ? "Loading..." : "Register"}</button>
      </form>

      <p>
        Have an account already? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}
