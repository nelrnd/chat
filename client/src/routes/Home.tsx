import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../providers/AuthProvider"
import { useEffect } from "react"
import { Button } from "../components/ui/button"
import appPreview from "../assets/app-preview.jpg"

export default function Home() {
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      navigate("/chat")
    }
  }, [token, navigate])

  return (
    <div>
      <section className="py-[6rem] px-3 text-center space-y-4 md:space-y-8">
        <h1 className="scroll-m-20 text-5xl md:text-[6rem] font-extrabold tracking-tight leading-none">
          The best chat app
        </h1>
        <p className="max-w-[24rem] m-auto text-neutral-400">
          Open-source real-time web chat app that includes group chats, sending pictures, video calls...
        </p>
        <Button className="mt-6" asChild>
          <Link to="/login">Open</Link>
        </Button>
      </section>
      <section className="mb-[6rem] px-3">
        <img src={appPreview} alt="" className="block m-auto rounded-2xl shadow-xl" />
      </section>
    </div>
  )
}
