import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/users/login", {
        email,
        password,
      });

      console.log("LOGIN:", res.data);

      // 🔥 VERY IMPORTANT
      localStorage.setItem("user", JSON.stringify(res.data.data.user));

      navigate("/");
    } catch (err) {
      console.log(err.response?.data);
    }
  };

  return (
    <div>
      <input placeholder="email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;


/* LOGIN:
Frontend → /login →
Backend → JWT generate →
Backend → cookie set →
Browser → cookie store

NEXT REQUEST:
Frontend → /videos →
Browser → cookie attach →
Backend → verifyJWT →
Allowed → data return

User enters email/password
↓
Click login
↓
API call (/users/login)
↓
Backend:
  - verify user
  - generate JWT
  - set cookie
↓
Browser:
  - cookie save
↓
navigate("/")
↓
Home.jsx:
  - API.get("/videos")
  - cookie automatically send
↓
Backend verifyJWT
↓
Videos return ✅


🎯 ONE LINE UNDERSTANDING
Login.jsx = user ko authenticate karta hai + cookies set karwata hai
💀 IMPORTANT DIFFERENCE
Thing	Purpose
Cookie	auth (backend use)
localStorage	UI (frontend use)

*/