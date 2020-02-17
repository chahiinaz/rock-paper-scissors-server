const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const port = process.env.PORT || 4000

const userRouter = require('./user/router')

const app = express()

const corsMiddleware = cors()
app.use(corsMiddleware)

const parserMiddleware = bodyParser.json()
app.use(parserMiddleware)

app.use(userRouter)

app.listen(
  port,
  () => console.log(`Listening on port ${port}`)
)