const { Router } = require("express");
const Gameroom = require("./model");
const authMiddleware = require("../auth/middleWare");
const User = require("../user/model");
const Player = require("../player/model");

function factory(stream) {
  const router = new Router();
  //Post gameroom
  router.post("/gameroom", authMiddleware, async (req, res, next) => {
    try {
      const { name } = req.body;
      const gameroom = await Gameroom.create({ name, round: 0 });
      // console.log("game?", gameroom);

      // const { user } = req;

      // console.log("user", user);

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
  //Get gameroom from stream by id
  router.get("/gameroom/:id", authMiddleware, async (req, res, next) => {
    try {
      const gameroom = await Gameroom.findAll({
        where: {
          id: req.params.id
        },
        include: [{ model: Player }]
      });
      // console.log("gameroom!!!\n\n\n\n\n\n\n", gameroom);
      // const gameroom = await Gameroom.findByPk(req.params.id);
      const action = {
        type: "ONE_GAMEROOM",
        payload: gameroom
      };
      const string = JSON.stringify(action);

      stream.send(string);
      res.send(gameroom);
    } catch (error) {
      next(error);
    }
  });

  //Join router to add users in gameroom
  router.put("/join", authMiddleware, async (request, response, next) => {
    try {
      const reqGameroomId = request.body.gameroomId;

      let player = await Player.findOne({
        // me => null at the start.
        where: { gameroomId: reqGameroomId, userId: request.user.id }
      });

      if (!player) {
        player = await Player.create({
          gameroomId: request.body.gameroomId,
          userId: request.user.id
        });
        // console.log("create new player");
      } else {
        player.update({ gameroomId: reqGameroomId, choice: "no_choice" });
      }

      const everything = await Gameroom.findAll({ include: [Player] });
      // console.log("everything", everything);

      const action = {
        type: "ALL_GAMEROOMS",
        payload: everything
      };

      // console.log("action", action, action.payload);
      const string = JSON.stringify(action);
      // console.log("string", string);

      stream.send(string);

      // console.log("player", player);
      // const gameroom = await Gameroom.findByPk(reqGameroomId);
      // console.log("gameroom", gameroom);

      // const playersInGame = await Player.findAndCountAll({
      //   where: { gameroomId: reqGameroomId }
      // });

      // console.log("players in game???", playersInGame);

      // if (playersInGame.count >= 1) {
      //   const roomUpdatedRound = await gameroom.update({
      //     round: ++gameroom.round
      //   });
      //   console.log("increment round");
      //   return response.send(roomUpdatedRound);
      // }

      response.send("joined room");
    } catch (error) {
      next(error);
    }
  });

  router.put("/player/:choice", authMiddleware, async (req, res, next) => {
    const { playerId, gameRoomId } = req.body;
    const { choice } = req.params;
    // console.log("player????", playerId, choice, req.user.id, gameRoomId);

    // const gameroom = await Gameroom.findByPk(player.gameroomId);
    await Player.update(
      { choice: choice },
      { where: { userId: req.user.id, gameroomId: gameRoomId } }
    );

    // console.log("gameroom????", gameroom);
    // console.log("gameroom.players????", gameroom.dataValues.players);

    const playersInGame = await Player.findAll({
      where: { gameroomId: gameRoomId }
    });

    // console.log("players in game ? ", playersInGame);
    const chosen = playersInGame.every(
      player =>
        player.choice === "rock" ||
        player.choice === "paper" ||
        player.choice === "scissors"
    );

    if (chosen) {
      const gameWinner = gameLogic(playersInGame);
      console.log("game winner?", gameWinner);

      if (gameWinner) {
        const { winner, loser } = gameWinner;
        await Player.update(
          {
            points: winner.points + 1,
            game_won: winner.game_won + 1
          },
          { where: { id: winner.id } }
        );
      }

      const resetPlayerChoice = await Player.update(
        { choice: "no_choice" },
        { where: { gameroomId: gameRoomId } }
      );
      const gameroom = await Gameroom.findAll({
        where: {
          id: gameRoomId
        },
        include: [{ model: Player }]
      });

      const action = {
        type: "ALL_GAMEROOMS",
        payload: everything
      };

      // console.log("action", action, action.payload);
      const string = JSON.stringify(action);
      // console.log("string", string);

      stream.send(string);
    }
  });

  return router;
}

// see who won.
// store the points
// +1 to gamerooom round
// clear player choices
// send gameroom with players updated (score)

function gameLogic(players) {
  const playerOne = players[0];
  const playerTwo = players[1];
  const choiceOne = playerOne.choice;
  const choiceTwo = playerTwo.choice;

  const playerOneWinner = {
    winner: playerOne,
    loser: playerTwo
  };

  const playerTwoWinner = {
    winner: playerTwo,
    loser: playerOne
  };

  if (choiceOne === choiceTwo) {
    return null;
  }
  if (choiceOne === "rock") {
    if (choiceTwo === "paper") {
      return playerTwoWinner;
    } else {
      return playerOneWinner;
    }
  }
  if (choiceOne === "paper") {
    if (choiceTwo === "scissors") {
      return playerTwoWinner;
    } else {
      return playerOneWinner;
    }
  }
  if (choiceTwo === "rock") {
    return playerTwoWinner;
  } else {
    return playerOneWinner;
  }
}

module.exports = factory;
