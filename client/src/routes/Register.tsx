import axios from "axios"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../providers/AuthProvider"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name cannot exceed 50 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  password: z.string().min(1, "Password is required").min(6, "Password must contain at least 6 characters"),
})

export default function Register() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })
  const { token } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
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
      <section className="max-w-[26rem] m-auto my-[8rem] p-8 space-y-6 rounded-2xl border border-neutral-800">
        <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-8">Register</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} spellCheck="false" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} spellCheck="false" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} spellCheck="false" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <p>{error}</p>}

            <Button className="w-full" disabled={loading}>
              {loading ? "Loading..." : "Register"}
            </Button>
          </form>
        </Form>

        <hr className="border-neutral-800" />

        <p className="text-neutral-400">
          Have an account already?{" "}
          <Link to="/login" className="font-semibold text-white hover:underline">
            Login
          </Link>
        </p>
      </section>
    </div>
  )
}
