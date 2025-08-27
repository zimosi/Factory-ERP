const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const authConfig = require("../config/auth.config");

exports.register = async (req, res) => {
  try {
    const { username, password, role = "employee", email } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "用户名和密码必填" });
    }
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: "用户名已存在" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create({ username, password: hashedPassword, role, email });
    res.status(201).json({ message: "注册成功", userId });
  } catch (err) {
    res.status(500).json({ message: "注册失败", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "用户名和密码必填" });
    }
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "用户不存在" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "密码错误" });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      authConfig.secret,
      { expiresIn: "12h" }
    );
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "登录失败", error: err.message });
  }
};
