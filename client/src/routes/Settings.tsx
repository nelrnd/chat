import axios from "axios"
import { useForm } from "react-hook-form"
import { useAuth } from "../providers/AuthProvider"
import { useEffect, useState } from "react"
import { Button } from "../components/ui/button"

import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  name: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
  avatar: z.instanceof(FileList).optional(),
})

export default function Settings() {
  const { authUser, setAuthUser, setToken } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: authUser?.name || "",
      bio: authUser?.bio || "",
    },
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const avatar = form.watch("avatar")
  const [previewAvatar, setPreviewAvatar] = useState(authUser?.avatar)

  useEffect(() => {
    if (avatar && avatar.length) {
      setPreviewAvatar(URL.createObjectURL(avatar[0]))
    }
  }, [avatar])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true)
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("bio", data.bio || "")
    formData.append("avatar", (data.avatar && data.avatar[0]) || (previewAvatar ? authUser?.avatar : ""))
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
    form.setValue("avatar", null)
    setPreviewAvatar("")
  }

  const handleDeleteAccount = () => {
    axios.delete("/user").then(() => setToken(null))
  }

  const handleLogout = () => {
    setToken(null)
  }

  return (
    <div>
      <header className="h-[6rem] p-8 flex justify-between items-center border-b border-neutral-800">
        <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">Settings</h1>
      </header>

      <div className="max-w-[36rem] m-auto mt-8 space-y-8">
        <section className="p-8 rounded-2xl border border-neutral-800">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display name</FormLabel>
                    <FormControl>
                      <Input {...field} spellCheck="false" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (a few words about you)</FormLabel>
                    <FormControl>
                      <Textarea {...field} spellCheck="false" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button>Save changes</Button>
            </form>
          </Form>
        </section>

        <Button onClick={handleDeleteAccount} variant="destructive" className="w-full">
          Delete account
        </Button>

        <Button onClick={handleLogout} className="w-full">
          Logout
        </Button>
      </div>
      {/* 
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
      */}
    </div>
  )
}
