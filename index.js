const express = require("express");
const port = process.env.PORT || 4000;
const app = express();

const cors = require("cors");
const corsMiddleware = cors();
app.use(corsMiddleware);

const bodyParser = require("body-parser");
const parserMiddleware = bodyParser.json();
app.use(parserMiddleware);

//Stream setup
const Sse = require("json-sse");
const stream = new Sse();

app.get("/test", (req, res) => {
  stream.send("test");
  res.send("hello");
});

app.get("/stream", (req, res) => {
  stream.init(req, res);
});

//Insert gameroom factory into stream
const gameroomFactory = require("./gameroom/router");
const gameroomRouter = gameroomFactory(stream);
app.use(gameroomRouter);

const userRouter = require("./user/router");
app.use(userRouter);

app.listen(port, () => console.log(`Listening on port ${port}`));
