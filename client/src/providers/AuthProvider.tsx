import axios from "axios"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

type ContextContent = {
  token: string | null
  setToken: (newToken: string) => void
  authUser: { name: string; email: string } | null
}

const AuthContext = createContext<ContextContent>({
  token: null,
  setToken: () => {},
  authUser: null,
})

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken_] = useState(localStorage.getItem("token"))
  const [authUser, setAuthUser] = useState(null)

  const setToken = (newToken: string) => {
    setToken_(newToken)
  }

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      localStorage.setItem("token", token)
      axios.get("/user/me").then((res) => setAuthUser(res.data))
    } else {
      delete axios.defaults.headers.common["Authorization"]
      localStorage.removeItem("token")
      setAuthUser(null)
    }
  }, [token])

  const contextValue = useMemo(
    () => ({
      token,
      setToken,
      authUser,
    }),
    [token, authUser]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
