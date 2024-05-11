import { useAuth } from "../providers/AuthProvider"
import { Chat, User } from "../types"

interface ChatInfoProps {
  chat: Chat
}

export default function ChatInfo({ chat }: ChatInfoProps) {
  const { authUser } = useAuth()
  const otherUser = chat.members.find((user: User) => user._id !== authUser?._id)

  return (
    <aside>
      <h2>Chat info</h2>
      <p>{otherUser?.bio}</p>

      <section>
        <h3>Shared images</h3>
        {chat.sharedImages.length}
      </section>

      <section>
        <h3>Shared links</h3>
        <ul>
          {chat.sharedLinks.map((link, id) => (
            <li key={id}>
              <a href={link.url}>{link.url}</a>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  )
}
