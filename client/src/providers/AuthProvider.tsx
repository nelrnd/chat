import axios from "axios"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

type ContextContent = {
  token: string | null
  setToken: (newToken: string) => void
}

const AuthContext = createContext<null | ContextContent>(null)

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken_] = useState(localStorage.getItem("token"))

  const setToken = (newToken: string) => {
    setToken_(newToken)
  }

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      localStorage.setItem("token", token)
    } else {
      delete axios.defaults.headers.common["Authorization"]
      localStorage.removeItem("token")
    }
  }, [token])

  const contextValue = useMemo(
    () => ({
      token,
      setToken,
    }),
    [token]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
