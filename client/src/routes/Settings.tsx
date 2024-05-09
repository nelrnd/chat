import axios from "axios"
import { SubmitHandler, useForm } from "react-hook-form"
import { useAuth } from "../providers/AuthProvider"
import { useEffect, useState } from "react"

type Inputs = {
  name: string
  bio: string
  avatar: FileList | null
}

export default function Settings() {
  const { authUser, setAuthUser, setToken } = useAuth()
  const { register, handleSubmit, watch, setValue } = useForm<Inputs>({
    defaultValues: {
      name: authUser?.name || "",
      bio: authUser?.bio || "",
    },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  console.log(authUser)

  const avatar = watch("avatar")
  const [previewAvatar, setPreviewAvatar] = useState(
    authUser?.avatar && import.meta.env.VITE_BASE_API + authUser?.avatar
  )

  useEffect(() => {
    if (avatar && avatar.length) {
      setPreviewAvatar(URL.createObjectURL(avatar[0]))
    }
  }, [avatar])

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("bio", data.bio)
    formData.append("avatar", (data.avatar && data.avatar[0]) || (previewAvatar ? authUser?.avatar : ""))
    setLoading(true)
    await axios
      .put("/user", formData)
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

  const handleRemoveAvatar = () => {
    setValue("avatar", null)
    setPreviewAvatar("")
  }

  const handleDeleteAccount = () => {
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

        <div>
          {previewAvatar && <img src={previewAvatar} alt="" width="100" />}
          <label htmlFor="avatar">Avatar</label>
          <input id="avatar" type="file" accept="image/*" {...register("avatar")} />
          {previewAvatar && (
            <button type="button" onClick={handleRemoveAvatar}>
              Remove avatar
            </button>
          )}
        </div>

        {error && <p>{error}</p>}

        <button disabled={loading}>{loading ? "Loading..." : "Update form"}</button>
      </form>

      <hr />

      <button onClick={handleDeleteAccount}>Delete my account</button>
    </div>
  )
}
