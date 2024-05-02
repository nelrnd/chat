import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../providers/AuthProvider"

export default function AuthRoot() {
  const { token, authUser } = useAuth()

  if (!token) {
    return <Navigate to="/login" />
  }

  if (!authUser) {
    return <p>Loading...</p>
  }

  return <Outlet />
}
