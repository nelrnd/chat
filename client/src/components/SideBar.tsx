import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import logo from "../assets/logo.svg"
import ChatList from "./ChatList"

export default function SideBar() {
  return (
    <nav className="w-[24rem] border-r border-neutral-800 flex flex-col">
      <header className="px-6 py-8">
        <Link to="/chat" className="inline-block w-fit p-2 -m-2">
          <img src={logo} alt="MiChat" />
        </Link>
      </header>

      <section className="p-3 flex-1">
        <ChatList />
      </section>

      <footer className="p-6">
        <Button asChild>
          <Link to="/settings">Settings</Link>
        </Button>
        <Button>New</Button>
      </footer>
    </nav>
  )
}
