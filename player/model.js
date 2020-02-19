const Sequelize = require("sequelize");
const db = require("../db.js");
const Gameroom = require("../gameroom/model");

const Player = db.define("player", {
  choice: {
    type: Sequelize.ENUM,
    values: ["rock", "paper", "scissors"]
  },
  points: { type: Sequelize.INTEGER }
});

module.exports = Player;
