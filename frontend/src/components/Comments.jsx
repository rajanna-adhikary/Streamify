import { useEffect, useState } from "react";
import API from "../api/axios";
import Icon from "./Icon";

const AVATAR_COLORS = ["bg-purple-600","bg-cyan-600","bg-blue-600","bg-rose-600","bg-amber-600","bg-emerald-600"];
const avatarColor = (username) => AVATAR_COLORS[(username?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length];

function Comments({ videoId }) {
  const [comments, setComments]   = useState([]);
  const [text, setText]           = useState("");
  const [posting, setPosting]     = useState(false);
  const [editId, setEditId]       = useState(null);
  const [editText, setEditText]   = useState("");
  const [saving, setSaving]       = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const fetchComments = async () => {
    try {
      const res = await API.get(`/comments/${videoId}`);
      setComments(res.data.data || []);
    } catch { setComments([]); }
  };

  useEffect(() => { fetchComments(); }, [videoId]);

  const addComment = async () => {
    if (!text.trim() || posting) return;
    setPosting(true);
    try {
      await API.post(`/comments/${videoId}`, { content: text });
      setText("");
      fetchComments();
    } catch { /* not logged in */ }
    finally { setPosting(false); }
  };

  const deleteComment = async (commentId) => {
    try {
      await API.delete(`/comments/c/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch { /* ignore */ }
  };

  const startEdit = (c) => { setEditId(c._id); setEditText(c.content); };
  const cancelEdit = () => { setEditId(null); setEditText(""); };

  const saveEdit = async (commentId) => {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      await API.patch(`/comments/c/${commentId}`, { content: editText });
      setComments((prev) => prev.map((c) => c._id === commentId ? { ...c, content: editText } : c));
      cancelEdit();
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const isOwner = (c) => currentUser && (c.owner?._id === currentUser._id || c.owner === currentUser._id);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-white text-sm font-semibold">
        {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
      </p>

      {/* Input */}
      <div className="flex gap-3 items-center">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addComment()}
          placeholder="Add a comment..."
          className="flex-1 px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08]
                     text-white text-sm placeholder-[#444] outline-none
                     focus:border-purple-500/40 transition-colors"
        />
        <button
          onClick={addComment}
          disabled={posting || !text.trim()}
          className="shrink-0 w-9 h-9 rounded-lg bg-purple-600 hover:bg-purple-500
                     flex items-center justify-center transition-colors duration-150
                     border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Icon name="send" size={15} className="text-white" />
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        {comments.map((c) => (
          <div key={c._id} className="flex gap-3 items-start group/comment">
            <div className={`w-8 h-8 rounded-full ${avatarColor(c.owner?.username)} shrink-0
                            flex items-center justify-center text-white text-xs font-bold`}>
              {(c.owner?.username?.[0] ?? "?").toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[#aaa] text-xs font-semibold mb-1">{c.owner?.username ?? "Unknown"}</p>

              {editId === c._id ? (
                <div className="flex gap-2 items-center">
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveEdit(c._id); if (e.key === "Escape") cancelEdit(); }}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.1]
                               text-white text-sm outline-none focus:border-purple-500/40 transition-colors"
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(c._id)}
                    disabled={saving}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs
                               font-medium border-none cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center
                               justify-center border-none cursor-pointer transition-colors"
                  >
                    <Icon name="x" size={13} className="text-[#888]" />
                  </button>
                </div>
              ) : (
                <p className="text-[#ccc] text-sm leading-relaxed">{c.content}</p>
              )}
            </div>

            {/* Owner actions */}
            {isOwner(c) && editId !== c._id && (
              <div className="flex gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => startEdit(c)}
                  className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center
                             justify-center border-none cursor-pointer transition-colors"
                  title="Edit"
                >
                  <Icon name="edit" size={13} className="text-[#666] hover:text-white" />
                </button>
                <button
                  onClick={() => deleteComment(c._id)}
                  className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-red-500/20 flex items-center
                             justify-center border-none cursor-pointer transition-colors"
                  title="Delete"
                >
                  <Icon name="trash" size={13} className="text-[#666] hover:text-red-400" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Comments;
