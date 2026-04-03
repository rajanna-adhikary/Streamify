import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axios";
import Comments from "../components/Comments";
import Icon from "../components/Icon";

/* ── tiny reusable modal ── */
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[#161616] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <Icon name="warning" size={18} className="text-red-400" />
          </div>
          <p className="text-white text-sm font-medium">{message}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[#aaa] text-sm
                       border-none cursor-pointer transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold
                       border-none cursor-pointer transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── edit modal ── */
function EditModal({ video, onSave, onCancel }) {
  const [title, setTitle]       = useState(video.title);
  const [desc, setDesc]         = useState(video.description);
  const [thumb, setThumb]       = useState(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");

  const handleSave = async () => {
    if (!title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", desc);
      if (thumb) formData.append("thumbnail", thumb);
      const res = await API.patch(`/videos/${video._id}`, formData);
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
            className="px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[#aaa] text-sm
                       border-none cursor-pointer transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold
                       border-none cursor-pointer transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── main component ── */
function VideoPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo]             = useState(null);
  const [related, setRelated]         = useState([]);
  const [liked, setLiked]             = useState(false);
  const [likeCount, setLikeCount]     = useState(0);
  const [subscribed, setSubscribed]   = useState(false);
  const [subCount, setSubCount]       = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [subLoading, setSubLoading]   = useState(false);
  const [showDelete, setShowDelete]   = useState(false);
  const [showEdit, setShowEdit]       = useState(false);
  const [pubLoading, setPubLoading]   = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    setVideo(null);
    setLiked(false); setLikeCount(0);
    setSubscribed(false); setSubCount(0);

    API.get(`/videos/${id}`)
      .then((res) => {
        const v = res.data.data;
        setVideo(v);
        Promise.all([
          API.get(`/likes/v/${id}`),
          API.get(`/subscriptions/status/${v.owner}`),
        ]).then(([lr, sr]) => {
          setLiked(lr.data.data.isLiked);
          setLikeCount(lr.data.data.likeCount);
          setSubscribed(sr.data.data.isSubscribed);
          setSubCount(sr.data.data.subscriberCount);
        }).catch(() => {});
      })
      .catch(console.error);

    API.get("/videos")
      .then((res) => setRelated(res.data.data || []))
      .catch(console.error);
  }, [id]);

  const isOwner = currentUser && video &&
    (video.owner === currentUser._id || video.owner?._id === currentUser._id);

  const handleLike = async () => {
    if (likeLoading) return;
    const was = liked;
    setLiked(!was); setLikeCount((c) => was ? c - 1 : c + 1);
    setLikeLoading(true);
    try {
      const res = await API.post(`/likes/toggle/v/${id}`);
      setLiked(res.data.data.isLiked);
      setLikeCount(res.data.data.likeCount);
    } catch { setLiked(was); setLikeCount((c) => was ? c + 1 : c - 1); }
    finally { setLikeLoading(false); }
  };

  const handleSubscribe = async () => {
    if (subLoading) return;
    const was = subscribed;
    setSubscribed(!was); setSubCount((c) => was ? c - 1 : c + 1);
    setSubLoading(true);
    try {
      await API.post(`/subscriptions/c/${video.owner?._id ?? video.owner}`);
      const res = await API.get(`/subscriptions/status/${video.owner?._id ?? video.owner}`);
      setSubscribed(res.data.data.isSubscribed);
      setSubCount(res.data.data.subscriberCount);
    } catch { setSubscribed(was); setSubCount((c) => was ? c + 1 : c - 1); }
    finally { setSubLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/videos/${id}`);
      navigate("/");
    } catch { setShowDelete(false); }
  };

  const handleTogglePublish = async () => {
    setPubLoading(true);
    try {
      const res = await API.patch(`/videos/toggle/publish/${id}`);
      setVideo((v) => ({ ...v, isPublished: res.data.data.isPublished }));
    } catch { /* ignore */ }
    finally { setPubLoading(false); }
  };

  /* ── skeleton ── */
  if (!video) {
    return (
      <div className="pt-14 min-h-screen bg-[#0a0a0a]">
        <div className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 animate-pulse">
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-video bg-white/[0.06] rounded-xl" />
            <div className="h-6 bg-white/[0.06] rounded w-3/4" />
            <div className="h-4 bg-white/[0.06] rounded w-1/3" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-40 h-24 bg-white/[0.06] rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3.5 bg-white/[0.06] rounded w-full" />
                  <div className="h-3 bg-white/[0.06] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-14 min-h-screen bg-[#0a0a0a] text-white">
      {showDelete && (
        <ConfirmModal
          message="Delete this video? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
      {showEdit && (
        <EditModal
          video={video}
          onSave={(updated) => { setVideo(updated); setShowEdit(false); }}
          onCancel={() => setShowEdit(false)}
        />
      )}

      <div className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8">

        {/* ── LEFT ── */}
        <div className="min-w-0 flex flex-col gap-4">
          <video src={video.videoFile} controls autoPlay
            className="w-full aspect-video rounded-xl bg-black" />

          {/* Title + owner actions */}
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-white text-xl font-bold leading-snug flex-1">{video.title}</h1>
            {isOwner && (
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Publish toggle */}
                <button
                  onClick={handleTogglePublish}
                  disabled={pubLoading}
                  title={video.isPublished ? "Set to Private" : "Set to Public"}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    border transition-colors duration-150 cursor-pointer disabled:opacity-50
                    ${video.isPublished
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-white/[0.04] border-white/[0.08] text-[#666] hover:bg-white/[0.08]"}`}
                >
                  <Icon name={video.isPublished ? "globe" : "lock"} size={13} />
                  {video.isPublished ? "Public" : "Private"}
                </button>
                {/* Edit */}
                <button onClick={() => setShowEdit(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                             bg-white/[0.04] border border-white/[0.08] text-[#888] hover:text-white
                             hover:bg-white/[0.08] transition-colors cursor-pointer border-none">
                  <Icon name="edit" size={13} />
                  Edit
                </button>
                {/* Delete */}
                <button onClick={() => setShowDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                             bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20
                             transition-colors cursor-pointer">
                  <Icon name="trash" size={13} />
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 border-y border-white/[0.06]">
            <div className="flex items-center gap-4 text-[#666] text-sm">
              <span className="flex items-center gap-1.5">
                <Icon name="views" size={14} />
                {(video.views ?? 0).toLocaleString()} views
              </span>
              <span className="text-white/10">|</span>
              <span className="flex items-center gap-1.5">
                <Icon name="subscribe" size={14} />
                {subCount.toLocaleString()} subscribers
              </span>
            </div>

            <div className="flex gap-2">
              <button onClick={handleLike} disabled={likeLoading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  transition-all duration-150 active:scale-95 border cursor-pointer disabled:opacity-60
                  ${liked
                    ? "bg-purple-600/20 text-purple-400 border-purple-500/30"
                    : "bg-white/[0.06] text-[#aaa] hover:bg-white/[0.1] hover:text-white border-white/[0.08]"}`}
              >
                <Icon name={liked ? "liked" : "like"} size={15} filled={liked} />
                <span>{likeCount > 0 ? likeCount.toLocaleString() : ""} {liked ? "Liked" : "Like"}</span>
              </button>

              {!isOwner && (
                <button onClick={handleSubscribe} disabled={subLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-150 active:scale-95 border cursor-pointer disabled:opacity-60
                    ${subscribed
                      ? "bg-white/[0.06] text-[#666] hover:bg-white/[0.1] border-white/[0.08]"
                      : "bg-purple-600 hover:bg-purple-500 text-white border-transparent"}`}
                >
                  <Icon name={subscribed ? "subscribed" : "subscribe"} size={15} filled={subscribed} />
                  {subscribed ? "Subscribed" : "Subscribe"}
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
            <p className="text-sm text-[#999] leading-relaxed whitespace-pre-wrap">{video.description}</p>
          </div>

          <Comments videoId={video._id} />
        </div>

        {/* ── RIGHT ── */}
        <div className="flex flex-col gap-1">
          <p className="text-[#666] text-xs font-medium uppercase tracking-wider mb-3">Up Next</p>
          {related.filter((v) => v._id !== id).map((vid) => (
            <div key={vid._id} onClick={() => navigate(`/video/${vid._id}`)}
              className="group flex gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/[0.04] transition-colors duration-150">
              <div className="relative w-40 h-[90px] shrink-0 rounded-lg overflow-hidden bg-white/[0.04]">
                <img src={vid.thumbnail} alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {vid.duration && (
                  <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] px-1 py-0.5 rounded font-medium">
                    {Math.floor(vid.duration / 60)}:{String(Math.floor(vid.duration % 60)).padStart(2, "0")}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-white text-xs font-medium leading-snug line-clamp-2 group-hover:text-purple-400 transition-colors">
                  {vid.title}
                </p>
                <p className="text-[#555] text-xs mt-1.5 flex items-center gap-1">
                  <Icon name="views" size={11} />
                  {(vid.views ?? 0).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default VideoPlayer;
