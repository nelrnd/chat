import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../providers/AuthProvider"
import { useEffect } from "react"
import { socket } from "../socket"
import SideBar from "../components/SideBar"

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
      <div className="h-screen flex border-4 border-red-500">
        <SideBar />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
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
