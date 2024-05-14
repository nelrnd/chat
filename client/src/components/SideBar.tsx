import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import logo from "../assets/logo.svg"
import ChatList from "./ChatList"
import { useState } from "react"
import UserSearch from "./UserSearch"

export default function SideBar() {
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <nav className="w-[24rem] border-r border-neutral-800 flex flex-col">
      <header className="h-[6rem] px-6 py-8 flex items-center">
        <Link to="/chat" className="inline-block w-fit p-2 -m-2">
          <img src={logo} alt="MiChat" />
        </Link>
      </header>

      <div className="flex-1">
        <section className="px-6 pb-4">
          <UserSearch value={searchTerm} setValue={setSearchTerm} />
        </section>

        {searchTerm === "" && (
          <section className="p-3">
            <ChatList />
          </section>
        )}
      </div>

      <footer className="p-6 flex gap-3">
        <Button className="flex-1" asChild>
          <Link to="/settings">Settings</Link>
        </Button>
        <Button className="flex-1">New</Button>
      </footer>
    </nav>
  )
}
