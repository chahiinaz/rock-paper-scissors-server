const Sequelize = require("sequelize");
const db = require("../db");
const User = require("../user/model");

const Gameroom = db.define("gameroom", {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

User.belongsTo(Gameroom);
Gameroom.hasMany(User);

module.exports = Gameroom;
