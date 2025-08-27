import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  container: {
    maxWidth: 350,
    margin: "60px auto",
    padding: 32,
    borderRadius: 12,
    boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
    background: "#fff"
  },
  title: {
    textAlign: "center",
    marginBottom: 24,
    color: "#1976d2"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16
  },
  input: {
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 16
  },
  button: {
    padding: "10px 0",
    borderRadius: 6,
    border: "none",
    background: "#1976d2",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer"
  },
  message: {
    textAlign: "center",
    marginTop: 16,
    color: "#d32f2f"
  },
  linkBtn: {
    marginTop: 12,
    background: "none",
    border: "none",
    color: "#1976d2",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: 15
  }
};

function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setMessage("登录成功！");
        setTimeout(() => navigate("/"), 500); // 0.5秒后跳转
      } else {
        setMessage(data.message || "登录失败");
      }
    } catch (err) {
      setMessage("网络错误");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>用户登录</h2>
      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          style={styles.input}
          name="username"
          placeholder="用户名"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          style={styles.input}
          name="password"
          type="password"
          placeholder="密码"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button style={styles.button} type="submit">
          登录
        </button>
      </form>
      <button style={styles.linkBtn} onClick={() => navigate("/register")}>还没有账号？去注册</button>
      {message && <div style={styles.message}>{message}</div>}
    </div>
  );
}

export default LoginPage;