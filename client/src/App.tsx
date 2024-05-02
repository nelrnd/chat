import { RouterProvider, createBrowserRouter } from "react-router-dom"
import Home from "./routes/Home"
import Login from "./routes/Login"
import Register from "./routes/Register"
import Chat from "./routes/Chat"
import Profile from "./routes/Profile"
import AuthProvider from "./providers/AuthProvider"
import AuthRoot from "./routes/AuthRoot"
import Root from "./routes/Root"

const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        element: <AuthRoot />,
        children: [
          {
            path: "/chat",
            element: <Chat />,
          },
          {
            path: "/profile",
            element: <Profile />,
          },
        ],
      },
    ],
  },
])

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
