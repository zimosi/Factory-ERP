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

function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    role: "employee"
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("注册成功，请去登录！");
      } else {
        setMessage(data.message || "注册失败");
      }
    } catch (err) {
      setMessage("网络错误");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>注册账号</h2>
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
        <input
          style={styles.input}
          name="email"
          placeholder="邮箱"
          value={form.email}
          onChange={handleChange}
        />
        <select
          style={styles.input}
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="employee">员工</option>
          <option value="manager">经理</option>
          <option value="admin">管理员</option>
        </select>
        <button style={styles.button} type="submit">
          注册
        </button>
      </form>
      <button style={styles.linkBtn} onClick={() => navigate("/login")}>已有账号？去登录</button>
      {message && <div style={styles.message}>{message}</div>}
    </div>
  );
}

export default RegisterPage;