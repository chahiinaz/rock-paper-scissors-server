const { Router } = require("express");
const Gameroom = require("./model");

function factory(stream) {
  const router = new Router();
  router.post("/gameroom", async (req, res, next) => {
    try {
      const gameroom = await Gameroom.create(req.body);

      const action = {
        type: "NEW_GAMEROOM",
        payload: gameroom
      };
      const string = JSON.stringify(action);
      stream.send(string);
      res.send(gameroom);
    } catch (error) {
      next(error);
    }
  });
  return router;
}

module.exports = factory;
