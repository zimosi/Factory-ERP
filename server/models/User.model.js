const pool = require("../db/connection");

const User = {
  async create({ username, password, role, email }) {
    const [result] = await pool.query(
      "INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)",
      [username, password, role, email]
    );
    return result.insertId;
  },

  async findByUsername(username) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  }
};

module.exports = User;



