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
const Gameroom = require("./gameroom/model");

app.get("/test", (req, res) => {
  stream.send("test");
  res.send("hello");
});

//Get all gamerooms in the stream
app.get("/stream", async (req, res, next) => {
  try {
    const gamerooms = await Gameroom.findAll();

    const action = {
      type: "ALL_GAMEROOMS",
      payload: gamerooms
    };
    const string = JSON.stringify(action);

    stream.updateInit(string);
    stream.init(req, res);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//Insert gameroom factory into stream
const gameroomFactory = require("./gameroom/router");
const gameroomRouter = gameroomFactory(stream);
app.use(gameroomRouter);

const joinFactory = require("./join/router");
const joinRouter = joinFactory(stream);
app.use(joinRouter);

const userRouter = require("./user/router");
app.use(userRouter);

app.listen(port, () => console.log(`Listening on port ${port}`));
