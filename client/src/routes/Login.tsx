import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../providers/AuthProvider"
import axios from "axios"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL

const formSchema = z.object({
  email: z.string().email().min(1),
  password: z.string().min(1),
})

export default function Login() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })
  const { token, setToken } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
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
      <section className="max-w-[26rem] m-auto mt-[8rem] p-8 space-y-6 rounded-2xl border border-neutral-800">
        <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-8">Login</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              {loading ? "Loading..." : "Login"}
            </Button>
          </form>
        </Form>

        <hr className="border-neutral-800" />

        <div className="space-y-2">
          <Button className="w-full" asChild>
            <a href={SERVER_BASE_URL + "/api/user/google/start"}>Login with Google</a>
          </Button>
          <Button className="w-full" asChild>
            <a href={SERVER_BASE_URL + "/api/user/github/start"}>Login with GitHub</a>
          </Button>
        </div>

        <p className="text-neutral-400">
          Don't have an account yet?{" "}
          <Link to="/register" className="font-semibold text-white hover:underline">
            Register
          </Link>
        </p>
      </section>
    </div>
  )
}
