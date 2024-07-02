import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import axios from "axios"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

axios.defaults.baseURL = "http://localhost:3000/api"
gsap.registerPlugin(ScrollTrigger)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
