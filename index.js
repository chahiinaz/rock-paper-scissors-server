const express = require("express");
const port = process.env.PORT || 4000;
const userRouter = require("./user/router");
const app = express();

const cors = require("cors");
const corsMiddleware = cors();
app.use(corsMiddleware);

const bodyParser = require("body-parser");
const parserMiddleware = bodyParser.json();
app.use(parserMiddleware);

const Sse = require("json-sse");
const stream = new Sse();

app.get("/test", (req, res) => {
  stream.send("test");
  res.send("hello");
});

app.get("/stream", (req, res) => {
  stream.init(req, res);
});

app.use(userRouter);

app.listen(port, () => console.log(`Listening on port ${port}`));
