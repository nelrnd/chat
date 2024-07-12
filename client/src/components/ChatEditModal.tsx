import { Chat } from "@/types"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Button } from "./ui/button"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { BiLoaderAlt } from "react-icons/bi"
import { useState } from "react"
import axios from "axios"
import { toast } from "./ui/use-toast"
import { useChats } from "@/providers/ChatProvider"

interface ChatEditModalProps {
  chat: Chat
}

const formSchema = z.object({
  title: z.string().max(50, "Name cannot exceed 50 characters").optional(),
  desc: z.string().max(300, "Description cannot exceed 300 characters").optional(),
  image: z.instanceof(FileList).optional(),
})

export default function ChatEditModal({ chat }: ChatEditModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: chat.title || "",
      desc: chat.desc || "",
    },
  })

  const [open, setOpen] = useState(false)

  const { updateChat } = useChats()

  const desc = form.watch("desc")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true)
    const formData = new FormData()
    formData.append("title", data.title || "")
    formData.append("desc", data.desc || "")
    formData.append("image", (data.image && data.image[0]) || chat.image)
    await axios
      .put(`/chat/${chat._id}`, formData)
      .then((res) => {
        updateChat(chat._id, res.data)
        toast({ title: "Success", description: "Chat info was updated successfully!" })
        setOpen(false)
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong",
          description: "There was a probme updating chat info.",
        })
        if (err.response && err.response.data.message) {
          setError(err.response.data.message)
        } else {
          setError(err.message)
        }
      })
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm" className="w-full">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Edit chat info</DialogTitle>
            </DialogHeader>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chat title</FormLabel>
                  <FormControl>
                    <Input {...field} spellCheck="false" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="desc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} spellCheck="false" />
                  </FormControl>
                  <FormDescription className={`ml-auto w-fit ${desc && desc.length > 300 && "text-red-500"}`}>
                    {desc?.length || 0}/300 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <p className="font-medium text-red-500">{error}</p>}

            <DialogFooter className="gap-3">
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>

              <Button type="submit" disabled={loading}>
                {loading ? <BiLoaderAlt className="text-xl animate-spin" /> : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
