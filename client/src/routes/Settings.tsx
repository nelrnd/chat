import axios from "axios"
import { useForm } from "react-hook-form"
import { useAuth } from "../providers/AuthProvider"
import { useEffect, useState } from "react"
import { Button, buttonVariants } from "../components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Avatar from "@/components/Avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BiCamera, BiImageAlt, BiLoaderAlt, BiX } from "react-icons/bi"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name cannot exceed 50 characters"),
  bio: z.string().max(300, "Bio cannot exceed 300 characters").optional(),
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

  const bio = form.watch("bio")
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

  const removeAvatar = () => {
    form.setValue("avatar", undefined)
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
                name="avatar"
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <div className="w-fit m-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <div className="relative rounded-full overflow-hidden">
                            <div className="absolute z-10 bg-black/30 hover:bg-black/50 w-full h-full grid place-content-center transition-colors">
                              <BiCamera className="text-3xl" />
                            </div>
                            <Avatar src={previewAvatar || ""} className="w-[8rem]" />
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right">
                          <DropdownMenuItem className="cursor-pointer" asChild>
                            <FormLabel className={buttonVariants({ variant: "ghost", size: "sm" })}>
                              <BiImageAlt />
                              Upload image
                            </FormLabel>
                          </DropdownMenuItem>
                          {previewAvatar && (
                            <DropdownMenuItem className="cursor-pointer" asChild>
                              <Button
                                onClick={removeAvatar}
                                variant="ghost"
                                size="sm"
                                className="w-full cursor-pointer"
                              >
                                <BiX />
                                Remove image
                              </Button>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/webp"
                        multiple
                        onChange={(e) => onChange(e.target.files)}
                        className="hidden"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display name</FormLabel>
                    <FormControl>
                      <Input {...field} spellCheck="false" />
                    </FormControl>
                    <FormMessage />
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
                    <FormDescription className={`ml-auto w-fit ${bio && bio.length > 300 && "text-red-500"}`}>
                      {bio.length || "0"}/300 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && <p>{error}</p>}

              <Button variant="secondary" disabled={loading || bio.length > 300} className="block ml-auto">
                {loading ? <BiLoaderAlt className="text-2xl animate-spin" /> : "Save changes"}
              </Button>
            </form>
          </Form>
        </section>

        <div className="space-y-4">
          <Button onClick={handleDeleteAccount} variant="destructive" className="w-full">
            Delete account
          </Button>

          <Button onClick={handleLogout} variant="secondary" className="w-full">
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
