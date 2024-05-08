import axios from "axios"
import { SubmitHandler, useForm } from "react-hook-form"
import { useAuth } from "../providers/AuthProvider"
import { useState } from "react"

type Inputs = {
  name: string
  bio: string
}

export default function Settings() {
  const { authUser, setAuthUser, setToken } = useAuth()
  const { register, handleSubmit } = useForm<Inputs>({
    defaultValues: {
      name: authUser?.name || "",
      bio: authUser?.bio || "",
    },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setLoading(true)
    await axios
      .put("/user", data)
      .then((res) => setAuthUser(res.data))
      .catch((err) => {
        if (err.response && err.response.data.message) {
          setError(err.response.data.message)
        } else {
          setError(err.message)
        }
      })
    setLoading(false)
  }

  const handleDelete = () => {
    axios.delete("/user").then(() => setToken(null))
  }

  return (
    <div>
      <h1>Settings</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <h2>Update profile</h2>
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" {...register("name")} />
        </div>

        <div>
          <label htmlFor="bio">Bio</label>
          <textarea id="bio" {...register("bio")}></textarea>
        </div>

        {error && <p>{error}</p>}

        <button disabled={loading}>{loading ? "Loading..." : "Update form"}</button>
      </form>

      <hr />

      <button onClick={handleDelete}>Delete my account</button>
    </div>
  )
}
