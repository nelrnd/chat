import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../providers/AuthProvider"
import { useEffect } from "react"
import { socket } from "../socket"

export default function AuthRoot() {
  const { token, authUser } = useAuth()

  if (!token) {
    return <Navigate to="/login" />
  }

  if (!authUser) {
    return <p>Loading...</p>
  }

  return (
    <SocketConnector>
      <Outlet />
    </SocketConnector>
  )
}

interface SocketConnectorProps {
  children: React.ReactNode
}

function SocketConnector({ children }: SocketConnectorProps) {
  useEffect(() => {
    socket.connect()

    return () => {
      socket.disconnect()
    }
  }, [])

  return children
}
