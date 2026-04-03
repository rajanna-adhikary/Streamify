import { useEffect, useState } from "react";
import API from "../api/axios";
import Icon from "../components/Icon";
import { useNavigate } from "react-router-dom";

const TABS = ["Overview", "Edit Profile", "Security", "History"];

function Profile() {
  const [user, setUser]         = useState(null);
  const [tab, setTab]           = useState("Overview");
  const [history, setHistory]   = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const navigate = useNavigate();

  // avatar
  const [avatar, setAvatar]     = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarSaving, setAvatarSaving]   = useState(false);

  // cover
  const [cover, setCover]       = useState(null);
  const [coverPreview, setCoverPreview]   = useState(null);
  const [coverSaving, setCoverSaving]     = useState(false);

  // edit profile
  const [fullName, setFullName] = useState("");
  const [email, setEmail]       = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // change password
  const [oldPass, setOldPass]   = useState("");
  const [newPass, setNewPass]   = useState("");
  const [passSaving, setPassSaving] = useState(false);

  // feedback
  const [msg, setMsg]           = useState({ type: "", text: "" });

  const flash = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: "", text: "" }), 3500);
  };

  const fetchUser = () =>
    API.get("/users/current-user")
      .then((res) => {
        const u = res.data.data;
        setUser(u);
        setFullName(u.fullName);
        setEmail(u.email);
      })
      .catch(console.error);

  useEffect(() => { fetchUser(); }, []);

  useEffect(() => {
    if (tab === "History") {
      setHistoryLoading(true);
      API.get("/users/history")
        .then((res) => setHistory(res.data.data || []))
        .catch(() => setHistory([]))
        .finally(() => setHistoryLoading(false));
    }
  }, [tab]);

  /* ── avatar ── */
  const handleAvatarChange = (e) => {
    const f = e.target.files[0]; if (!f) return;
    setAvatar(f); setAvatarPreview(URL.createObjectURL(f));
  };
  const saveAvatar = async () => {
    if (!avatar) return;
    const fd = new FormData(); fd.append("avatar", avatar);
    setAvatarSaving(true);
    try {
      await API.patch("/users/avatar", fd);
      await fetchUser(); setAvatar(null); setAvatarPreview(null);
      flash("success", "Avatar updated.");
    } catch { flash("error", "Failed to update avatar."); }
    finally { setAvatarSaving(false); }
  };

  /* ── cover ── */
  const handleCoverChange = (e) => {
    const f = e.target.files[0]; if (!f) return;
    setCover(f); setCoverPreview(URL.createObjectURL(f));
  };
  const saveCover = async () => {
    if (!cover) return;
    const fd = new FormData(); fd.append("coverImage", cover);
    setCoverSaving(true);
    try {
      await API.patch("/users/cover-image", fd);
      await fetchUser(); setCover(null); setCoverPreview(null);
      flash("success", "Cover image updated.");
    } catch { flash("error", "Failed to update cover image."); }
    finally { setCoverSaving(false); }
  };

  /* ── update account ── */
  const saveProfile = async () => {
    if (!fullName.trim() || !email.trim()) { flash("error", "Name and email are required."); return; }
    setProfileSaving(true);
    try {
      await API.patch("/users/update-account", { fullName, email });
      await fetchUser();
      flash("success", "Profile updated.");
    } catch (e) { flash("error", e.response?.data?.message || "Update failed."); }
    finally { setProfileSaving(false); }
  };

  /* ── change password ── */
  const savePassword = async () => {
    if (!oldPass || !newPass) { flash("error", "Both fields are required."); return; }
    setPassSaving(true);
    try {
      await API.post("/users/change-password", { oldPassword: oldPass, newPassword: newPass });
      setOldPass(""); setNewPass("");
      flash("success", "Password changed.");
    } catch (e) { flash("error", e.response?.data?.message || "Password change failed."); }
    finally { setPassSaving(false); }
  };

  /* ── skeleton ── */
  if (!user) {
    return (
      <div className="pt-20 px-6 max-w-3xl mx-auto animate-pulse">
        <div className="h-36 bg-white/[0.04] rounded-2xl mb-4" />
        <div className="flex gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-white/[0.06]" />
          <div className="space-y-2 pt-3">
            <div className="h-5 bg-white/[0.06] rounded w-40" />
            <div className="h-4 bg-white/[0.06] rounded w-56" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-14 min-h-screen bg-[#0a0a0a] text-white">

      {/* Cover */}
      <div className="relative h-40 bg-gradient-to-r from-purple-900/50 to-cyan-900/30 overflow-hidden">
        {(coverPreview || user.coverImage) && (
          <img src={coverPreview || user.coverImage} alt="cover"
            className="w-full h-full object-cover opacity-60" />
        )}
        <label className="absolute bottom-3 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                          bg-black/50 border border-white/[0.15] text-white text-xs cursor-pointer
                          hover:bg-black/70 transition-colors backdrop-blur-sm">
          <Icon name="camera" size={13} />
          {cover ? cover.name.slice(0, 20) + "..." : "Change Cover"}
          <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
        </label>
        {cover && (
          <button onClick={saveCover} disabled={coverSaving}
            className="absolute bottom-3 right-44 flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                       bg-purple-600 hover:bg-purple-500 text-white text-xs border-none cursor-pointer
                       disabled:opacity-50 transition-colors">
            <Icon name="check" size={13} />
            {coverSaving ? "Saving..." : "Save Cover"}
          </button>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16">

        {/* Avatar row */}
        <div className="flex items-end gap-4 -mt-10 mb-6">
          <div className="relative shrink-0">
            <img src={avatarPreview || user.avatar} alt={user.fullName}
              className="w-20 h-20 rounded-full object-cover border-4 border-[#0a0a0a] bg-[#1a1a1a]" />
            <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-purple-600 hover:bg-purple-500
                              border-2 border-[#0a0a0a] flex items-center justify-center cursor-pointer transition-colors">
              <Icon name="camera" size={13} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div className="pb-1 flex-1 min-w-0">
            <h1 className="text-white text-xl font-bold truncate">{user.fullName}</h1>
            <p className="text-[#666] text-sm">@{user.username}</p>
          </div>
          {avatar && (
            <button onClick={saveAvatar} disabled={avatarSaving}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500
                         text-white text-sm font-medium border-none cursor-pointer disabled:opacity-50 transition-colors">
              <Icon name="check" size={14} />
              {avatarSaving ? "Saving..." : "Save Avatar"}
            </button>
          )}
        </div>

        {/* Flash message */}
        {msg.text && (
          <div className={`mb-5 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm border
            ${msg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
            <Icon name={msg.type === "success" ? "check" : "warning"} size={15} />
            {msg.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 mb-6">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-150 border-none cursor-pointer
                ${tab === t ? "bg-white/[0.08] text-white" : "bg-transparent text-[#666] hover:text-[#aaa]"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "Overview" && (
          <div className="flex flex-col gap-3">
            {[
              { label: "Full Name", value: user.fullName, icon: "profile" },
              { label: "Email",     value: user.email,    icon: "send"    },
              { label: "Username",  value: `@${user.username}`, icon: "profile" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <Icon name={icon} size={15} className="text-[#555] shrink-0" />
                <div>
                  <p className="text-[#555] text-xs">{label}</p>
                  <p className="text-white text-sm font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── EDIT PROFILE ── */}
        {tab === "Edit Profile" && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wider block mb-1.5">Full Name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="input-dark" placeholder="Your full name" />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wider block mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-dark" placeholder="your@email.com" />
            </div>
            <button onClick={saveProfile} disabled={profileSaving}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500
                         text-white text-sm font-semibold border-none cursor-pointer disabled:opacity-50 transition-colors mt-1">
              <Icon name="check" size={15} />
              {profileSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* ── SECURITY ── */}
        {tab === "Security" && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wider block mb-1.5">Current Password</label>
              <input type="password" value={oldPass} onChange={(e) => setOldPass(e.target.value)}
                className="input-dark" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-[#666] text-xs uppercase tracking-wider block mb-1.5">New Password</label>
              <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)}
                className="input-dark" placeholder="••••••••" />
            </div>
            <button onClick={savePassword} disabled={passSaving}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500
                         text-white text-sm font-semibold border-none cursor-pointer disabled:opacity-50 transition-colors mt-1">
              <Icon name="key" size={15} />
              {passSaving ? "Changing..." : "Change Password"}
            </button>
          </div>
        )}

        {/* ── HISTORY ── */}
        {tab === "History" && (
          <div className="flex flex-col gap-2">
            {historyLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] animate-pulse">
                  <div className="w-28 h-16 rounded-lg bg-white/[0.06] shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/[0.06] rounded w-3/4" />
                    <div className="h-3 bg-white/[0.06] rounded w-1/4" />
                  </div>
                </div>
              ))
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
                  <Icon name="history" size={22} className="text-[#555]" />
                </div>
                <p className="text-white text-sm font-medium">No watch history</p>
                <p className="text-[#555] text-xs mt-1">Videos you watch will appear here</p>
              </div>
            ) : (
              history.map((video) => (
                <div key={video._id} onClick={() => navigate(`/video/${video._id}`)}
                  className="group flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]
                             hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-150 cursor-pointer">
                  <img src={video.thumbnail} alt={video.title}
                    className="w-28 h-16 object-cover rounded-lg bg-white/[0.04] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate group-hover:text-purple-400 transition-colors">
                      {video.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[#555] text-xs flex items-center gap-1">
                        <Icon name="views" size={11} />
                        {(video.views ?? 0).toLocaleString()} views
                      </span>
                      {video.owner?.username && (
                        <span className="text-[#555] text-xs">{video.owner.username}</span>
                      )}
                    </div>
                  </div>
                  <Icon name="chevronRight" size={16} className="text-[#444] shrink-0" />
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default Profile;
