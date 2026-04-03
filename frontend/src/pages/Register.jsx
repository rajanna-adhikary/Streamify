import { useState } from "react";
import API from "../api/axios";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const handleRegister = async () => {
    try {
      const formData = new FormData();

      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("username", username);
      formData.append("password", password);

      formData.append("avatar", avatar);
      formData.append("coverImage", coverImage);

      const res = await API.post("/users/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("REGISTER SUCCESS:", res.data);
      alert("User Registered 🚀");

    } catch (error) {
      console.log(error);
      alert("Registration failed ❌");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Register</h2>

      <input placeholder="Full Name" onChange={(e) => setFullName(e.target.value)} />
      <br /><br />

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <br /><br />

      <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
      <br /><br />

      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <br /><br />

      <p>Avatar:</p>
      <input type="file" onChange={(e) => setAvatar(e.target.files[0])} />

      <p>Cover Image (optional):</p>
      <input type="file" onChange={(e) => setCoverImage(e.target.files[0])} />

      <br /><br />

      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;