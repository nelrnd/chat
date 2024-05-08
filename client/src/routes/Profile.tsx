import { useAuth } from "../providers/AuthProvider"

export default function Profile() {
  const { authUser } = useAuth()

  return (
    <div>
      <h1>Profile</h1>
      <p>
        {authUser?.name} | {authUser?.email}
      </p>
      <p>{authUser?.bio}</p>
    </div>
  )
}
