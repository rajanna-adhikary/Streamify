import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axios";
import Icon from "../components/Icon";

function Channel() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel]       = useState(null);
  const [videos, setVideos]         = useState([]);
  const [subscribed, setSubscribed] = useState(false);
  const [subCount, setSubCount]     = useState(0);
  const [subLoading, setSubLoading] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    API.get(`/users/c/${username}`)
      .then((res) => {
        const c = res.data.data;
        setChannel(c);
        setSubCount(c.subscribersCount ?? 0);
        // fetch sub status
        if (currentUser && c._id !== currentUser._id) {
          API.get(`/subscriptions/status/${c._id}`)
            .then((r) => {
              setSubscribed(r.data.data.isSubscribed);
              setSubCount(r.data.data.subscriberCount);
            }).catch(() => {});
        }
        // fetch their videos
        API.get(`/videos?userId=${c._id}`)
          .then((r) => setVideos(r.data.data || []))
          .catch(() => {});
      })
      .catch(console.error);
  }, [username]);

  const handleSubscribe = async () => {
    if (subLoading || !channel) return;
    const was = subscribed;
    setSubscribed(!was); setSubCount((c) => was ? c - 1 : c + 1);
    setSubLoading(true);
    try {
      await API.post(`/subscriptions/c/${channel._id}`);
      const res = await API.get(`/subscriptions/status/${channel._id}`);
      setSubscribed(res.data.data.isSubscribed);
      setSubCount(res.data.data.subscriberCount);
    } catch { setSubscribed(was); setSubCount((c) => was ? c + 1 : c - 1); }
    finally { setSubLoading(false); }
  };

  const isOwn = currentUser && channel && currentUser._id === channel._id;

  if (!channel) {
    return (
      <div className="pt-14 min-h-screen bg-[#0a0a0a] animate-pulse">
        <div className="h-40 bg-white/[0.04]" />
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-4 -mt-10 mb-8">
            <div className="w-20 h-20 rounded-full bg-white/[0.06]" />
            <div className="space-y-2 pt-4">
              <div className="h-5 bg-white/[0.06] rounded w-40" />
              <div className="h-4 bg-white/[0.06] rounded w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-14 min-h-screen bg-[#0a0a0a] text-white">
      {/* Cover */}
      <div className="h-40 bg-gradient-to-r from-purple-900/50 to-cyan-900/30 overflow-hidden">
        {channel.coverImage && (
          <img src={channel.coverImage} alt="cover" className="w-full h-full object-cover opacity-60" />
        )}
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-16">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 -mt-10 mb-8">
          <div className="flex items-end gap-4">
            <img src={channel.avatar} alt={channel.fullName}
              className="w-20 h-20 rounded-full object-cover border-4 border-[#0a0a0a] bg-[#1a1a1a] shrink-0" />
            <div className="pb-1">
              <h1 className="text-white text-xl font-bold">{channel.fullName}</h1>
              <p className="text-[#666] text-sm">@{channel.username}</p>
              <p className="text-[#555] text-xs mt-0.5 flex items-center gap-1">
                <Icon name="subscribe" size={12} />
                {subCount.toLocaleString()} subscribers
              </p>
            </div>
          </div>

          {!isOwn && (
            <button onClick={handleSubscribe} disabled={subLoading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold
                transition-all duration-150 border cursor-pointer disabled:opacity-60
                ${subscribed
                  ? "bg-white/[0.06] text-[#666] hover:bg-white/[0.1] border-white/[0.08]"
                  : "bg-purple-600 hover:bg-purple-500 text-white border-transparent"}`}>
              <Icon name={subscribed ? "subscribed" : "subscribe"} size={15} filled={subscribed} />
              {subscribed ? "Subscribed" : "Subscribe"}
            </button>
          )}
          {isOwn && (
            <button onClick={() => navigate("/profile")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                         bg-white/[0.06] border border-white/[0.08] text-[#aaa] hover:text-white
                         hover:bg-white/[0.1] transition-colors cursor-pointer">
              <Icon name="edit" size={14} />
              Edit Profile
            </button>
          )}
        </div>

        {/* Videos grid */}
        <div>
          <h2 className="text-white text-base font-semibold mb-4">
            Videos <span className="text-[#555] font-normal text-sm ml-1">{videos.length}</span>
          </h2>
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <Icon name="inbox" size={28} className="text-[#444] mb-3" />
              <p className="text-[#666] text-sm">No videos uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {videos.map((vid) => (
                <div key={vid._id} onClick={() => navigate(`/video/${vid._id}`)}
                  className="group cursor-pointer rounded-xl overflow-hidden bg-transparent">
                  <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-white/[0.04]">
                    <img src={vid.thumbnail} alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {vid.duration && (
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                        {Math.floor(vid.duration / 60)}:{String(Math.floor(vid.duration % 60)).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                  <div className="pt-2.5 px-1">
                    <p className="text-white text-sm font-medium line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {vid.title}
                    </p>
                    <p className="text-[#555] text-xs mt-1 flex items-center gap-1">
                      <Icon name="views" size={11} />
                      {(vid.views ?? 0).toLocaleString()} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Channel;
