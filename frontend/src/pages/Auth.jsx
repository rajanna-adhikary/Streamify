import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import StreamifyLogo from "../components/StreamifyLogo";
import Icon from "../components/Icon";

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"

  // login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // register fields
  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [username, setUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setSuccess("");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/users/login", { email, password });
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!avatar) { setError("Avatar is required."); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", regEmail);
      formData.append("username", username);
      formData.append("password", regPassword);
      formData.append("avatar", avatar);
      if (coverImage) formData.append("coverImage", coverImage);

      await API.post("/users/register", formData);
      setSuccess("Account created! Please sign in.");
      switchMode("login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">

      {/* Glow blob */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px]
                      bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-3 drop-shadow-[0_0_18px_rgba(168,85,247,0.5)]">
            <StreamifyLogo size={52} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Streamify
          </h1>
          <p className="text-[#717171] text-sm mt-1">
            {mode === "login" ? "Sign in to continue watching" : "Create your account"}
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex bg-[#1a1a1a] border border-[#272727] rounded-xl p-1 mb-6">
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 border-none cursor-pointer
                ${mode === m
                  ? "bg-white text-black shadow"
                  : "bg-transparent text-[#aaa] hover:text-white"}`}
            >
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="bg-[#1a1a1a] border border-[#272727] rounded-2xl p-6 shadow-2xl">

          {/* Error / Success banners */}
          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="text-[#aaa] text-xs font-medium block mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-dark"
                />
              </div>
              <div>
                <label className="text-[#aaa] text-xs font-medium block mb-1.5">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-dark"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full py-2.5 rounded-xl bg-white text-black text-sm font-bold
                           hover:bg-gray-200 active:scale-95 transition-all duration-200
                           disabled:opacity-60 border-none cursor-pointer"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">

              {/* Avatar picker */}
              <div className="flex flex-col items-center gap-2">
                <label className="cursor-pointer group relative">
                  <div className="w-20 h-20 rounded-full bg-[#272727] border-2 border-dashed border-[#3f3f3f]
                                  group-hover:border-[#3ea6ff] transition-colors overflow-hidden flex items-center justify-center">
                    {avatarPreview
                      ? <img src={avatarPreview} className="w-full h-full object-cover" alt="avatar" />
                      : <Icon name="camera" size={24} className="text-[#555]" />
                    }
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
                <p className="text-[#717171] text-xs">
                  {avatar ? avatar.name : "Tap to upload avatar *"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#aaa] text-xs font-medium block mb-1.5">Full Name</label>
                  <input
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="input-dark"
                  />
                </div>
                <div>
                  <label className="text-[#aaa] text-xs font-medium block mb-1.5">Username</label>
                  <input
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="input-dark"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#aaa] text-xs font-medium block mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="input-dark"
                />
              </div>

              <div>
                <label className="text-[#aaa] text-xs font-medium block mb-1.5">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  className="input-dark"
                />
              </div>

              <div>
                <label className="text-[#aaa] text-xs font-medium block mb-1.5">
                  Cover Image <span className="text-[#555]">(optional)</span>
                </label>
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#121212] border border-[#3f3f3f]
                                  cursor-pointer hover:border-[#3ea6ff] transition-colors text-sm text-[#717171]">
                  <Icon name="image" size={14} className="text-[#555] shrink-0" />
                  <span>{coverImage ? coverImage.name : "Choose cover image"}</span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => setCoverImage(e.target.files[0])} />
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full py-2.5 rounded-xl bg-white text-black text-sm font-bold
                           hover:bg-gray-200 active:scale-95 transition-all duration-200
                           disabled:opacity-60 border-none cursor-pointer"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>

        {/* Bottom switch */}
        <p className="text-center text-[#717171] text-sm mt-5">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            className="text-white font-semibold hover:text-[#3ea6ff] transition-colors bg-transparent border-none cursor-pointer"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>

      </div>
    </div>
  );
}

export default Auth;
