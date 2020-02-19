const Sequelize = require("sequelize");
const db = require("../db.js");

const User = db.define("user", {
  username: { type: Sequelize.STRING, allowNull: true },
  email: { type: Sequelize.STRING, unique: true, allowNull: false },
  password: { type: Sequelize.STRING, allowNull: false }
});

module.exports = User;
