import { io } from "socket.io-client"

const URL = import.meta.env.MODE === "production" ? undefined : "http://localhost:3000"

export const socket = io(URL, { autoConnect: false })
