const express = require("express")

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get("/", (req, res) => res.send("Hello"))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server started at http://localhost:${PORT}`))
