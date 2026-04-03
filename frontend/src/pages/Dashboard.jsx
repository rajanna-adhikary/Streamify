import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";

const STAT_CONFIG = [
  { key: "totalVideos",      label: "Total Videos", icon: "video",     accent: "text-blue-400",   bg: "bg-blue-500/[0.07]",   border: "border-blue-500/20"   },
  { key: "totalViews",       label: "Total Views",  icon: "views",     accent: "text-purple-400", bg: "bg-purple-500/[0.07]", border: "border-purple-500/20" },
  { key: "totalLikes",       label: "Total Likes",  icon: "liked",     accent: "text-rose-400",   bg: "bg-rose-500/[0.07]",   border: "border-rose-500/20"   },
  { key: "totalSubscribers", label: "Subscribers",  icon: "subscribed",accent: "text-amber-400",  bg: "bg-amber-500/[0.07]",  border: "border-amber-500/20"  },
];

function StatCard({ icon, label, value, accent, bg, border }) {
  return (
    <div className={`rounded-xl border ${border} ${bg} p-5 flex flex-col gap-3`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg} border ${border}`}>
        <Icon name={icon} size={18} className={accent} filled={icon === "liked" || icon === "subscribed"} />
      </div>
      <div>
        <p className="text-[#666] text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-white text-3xl font-bold mt-0.5 tabular-nums">{(value ?? 0).toLocaleString()}</p>
      </div>
    </div>
  );
}

/* ── inline edit modal ── */
function EditModal({ video, onSave, onCancel }) {
  const [title, setTitle] = useState(video.title);
  const [desc, setDesc]   = useState(video.description);
  const [thumb, setThumb] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleSave = async () => {
    if (!title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", desc);
      if (thumb) fd.append("thumbnail", thumb);
      const res = await API.patch(`/videos/${video._id}`, fd);
      onSave(res.data.data);
    } catch (e) {
      setError(e.response?.data?.message || "Update failed.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#161616] border border-white/[0.08] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold">Edit Video</h3>
          <button onClick={onCancel} className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.1]
                                                flex items-center justify-center border-none cursor-pointer">
            <Icon name="x" size={14} className="text-[#888]" />
          </button>
        </div>
        {error && <p className="mb-4 text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[#666] text-xs uppercase tracking-wider block mb-1.5">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0a0a0a] border border-white/[0.08]
                         text-white text-sm outline-none focus:border-purple-500/50 transition-colors" />
          </div>
          <div>
            <label className="text-[#666] text-xs uppercase tracking-wider block mb-1.5">Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0a0a0a] border border-white/[0.08]
                         text-white text-sm outline-none resize-none focus:border-purple-500/50 transition-colors font-sans" />
          </div>
          <div>
            <label className="text-[#666] text-xs uppercase tracking-wider block mb-1.5">Thumbnail (optional)</label>
            <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#0a0a0a] border border-white/[0.08]
                              cursor-pointer hover:border-purple-500/40 transition-colors text-sm text-[#555]">
              <Icon name="image" size={14} />
              <span>{thumb ? thumb.name : "Choose new thumbnail"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setThumb(e.target.files[0])} />
            </label>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[#aaa] text-sm border-none cursor-pointer transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold border-none cursor-pointer transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [videos, setVideos]   = useState([]);
  const [editVideo, setEditVideo] = useState(null);
  const [deleteId, setDeleteId]   = useState(null);
  const [pubLoading, setPubLoading] = useState(null); // videoId being toggled
  const navigate = useNavigate();

  const load = () =>
    Promise.all([API.get("/dashboard/stats"), API.get("/dashboard/videos")])
      .then(([s, v]) => { setStats(s.data.data); setVideos(v.data.data || []); })
      .catch(console.error);

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    try {
      await API.delete(`/videos/${deleteId}`);
      setVideos((prev) => prev.filter((v) => v._id !== deleteId));
      setDeleteId(null);
      load(); // refresh stats
    } catch { setDeleteId(null); }
  };

  const handleTogglePublish = async (videoId) => {
    setPubLoading(videoId);
    try {
      const res = await API.patch(`/videos/toggle/publish/${videoId}`);
      setVideos((prev) => prev.map((v) => v._id === videoId ? { ...v, isPublished: res.data.data.isPublished } : v));
    } catch { /* ignore */ }
    finally { setPubLoading(null); }
  };

  if (!stats) {
    return (
      <div className="pt-20 px-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-7 bg-white/[0.06] rounded-lg w-36 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white/[0.04] rounded-xl border border-white/[0.06]" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-white/[0.04] rounded-xl border border-white/[0.06] mb-3" />
        ))}
      </div>
    );
  }

  return (
    <div className="pt-20 px-6 pb-16 max-w-5xl mx-auto min-h-screen bg-[#0a0a0a]">

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="bg-[#161616] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <Icon name="warning" size={18} className="text-red-400" />
              </div>
              <p className="text-white text-sm font-medium">Delete this video? This cannot be undone.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[#aaa] text-sm border-none cursor-pointer transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold border-none cursor-pointer transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editVideo && (
        <EditModal
          video={editVideo}
          onSave={(updated) => {
            setVideos((prev) => prev.map((v) => v._id === updated._id ? updated : v));
            setEditVideo(null);
          }}
          onCancel={() => setEditVideo(null)}
        />
      )}

      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <p className="text-[#666] text-sm mt-1">Your channel at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {STAT_CONFIG.map((cfg) => <StatCard key={cfg.key} {...cfg} value={stats[cfg.key]} />)}
      </div>

      {/* Videos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-base font-semibold">Your Videos</h2>
          <span className="text-[#555] text-xs">{videos.length} total</span>
        </div>

        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
              <Icon name="inbox" size={22} className="text-[#555]" />
            </div>
            <p className="text-white text-sm font-medium">No videos yet</p>
            <p className="text-[#555] text-xs mt-1">Upload your first video to see it here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {videos.map((video) => (
              <div key={video._id}
                className="group flex items-center gap-4 p-3 rounded-xl
                           bg-white/[0.02] border border-white/[0.06]
                           hover:bg-white/[0.04] hover:border-white/[0.1]
                           transition-all duration-150">
                {/* Thumbnail — clickable */}
                <img src={video.thumbnail} alt={video.title}
                  onClick={() => navigate(`/video/${video._id}`)}
                  className="w-28 h-16 object-cover rounded-lg bg-white/[0.04] shrink-0 cursor-pointer" />

                {/* Info */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/video/${video._id}`)}>
                  <p className="text-white text-sm font-medium truncate group-hover:text-purple-400 transition-colors">
                    {video.title}
                  </p>
                  <p className="text-[#555] text-xs mt-0.5 line-clamp-1">{video.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-[#555] text-xs">
                      <Icon name="views" size={11} />{(video.views ?? 0).toLocaleString()}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium
                      ${video.isPublished
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-white/[0.04] border-white/[0.08] text-[#555]"}`}>
                      {video.isPublished ? "Public" : "Private"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleTogglePublish(video._id)}
                    disabled={pubLoading === video._id}
                    title={video.isPublished ? "Set Private" : "Set Public"}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border
                      transition-colors cursor-pointer disabled:opacity-50
                      ${video.isPublished
                        ? "bg-white/[0.04] border-white/[0.08] text-[#666] hover:text-white hover:bg-white/[0.08]"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"}`}
                  >
                    <Icon name={video.isPublished ? "lock" : "globe"} size={12} />
                    {video.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => setEditVideo(video)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                               bg-white/[0.04] border border-white/[0.08] text-[#666] hover:text-white
                               hover:bg-white/[0.08] transition-colors cursor-pointer">
                    <Icon name="edit" size={12} />
                    Edit
                  </button>
                  <button onClick={() => setDeleteId(video._id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                               bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20
                               transition-colors cursor-pointer">
                    <Icon name="trash" size={12} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
