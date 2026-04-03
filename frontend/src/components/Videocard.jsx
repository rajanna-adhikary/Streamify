import { useNavigate } from "react-router-dom";
import Icon from "./Icon";

function VideoCard({ video }) {
  const navigate = useNavigate();

  const ownerName = video.owner?.username || video.owner?.fullName || null;

  const goToVideo = (e) => {
    navigate(`/video/${video._id}`);
  };

  const goToChannel = (e) => {
    e.stopPropagation(); // don't trigger goToVideo
    if (ownerName) navigate(`/channel/${ownerName}`);
  };

  return (
    <div onClick={goToVideo} className="group cursor-pointer rounded-xl overflow-hidden bg-transparent">

      {/* Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden rounded-xl bg-white/[0.06]">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
            {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, "0")}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="pt-3 px-1 flex gap-2.5">
        {/* Owner avatar */}
        {video.owner?.avatar ? (
          <img
            src={video.owner.avatar}
            alt={ownerName}
            onClick={goToChannel}
            className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 cursor-pointer hover:ring-2 hover:ring-purple-500/50 transition-all"
          />
        ) : (
          <div
            onClick={goToChannel}
            className="w-8 h-8 rounded-full bg-purple-600/30 shrink-0 mt-0.5 flex items-center justify-center cursor-pointer"
          >
            <span className="text-purple-400 text-xs font-bold">
              {(ownerName?.[0] ?? "?").toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-white text-sm font-semibold leading-snug line-clamp-2 group-hover:text-purple-400 transition-colors duration-200">
            {video.title}
          </h3>
          {ownerName && (
            <p
              onClick={goToChannel}
              className="text-[#666] text-xs mt-1 hover:text-[#aaa] transition-colors cursor-pointer w-fit"
            >
              {ownerName}
            </p>
          )}
          <p className="text-[#555] text-xs mt-0.5 flex items-center gap-1">
            <Icon name="views" size={11} />
            {(video.views ?? 0).toLocaleString()} views
          </p>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
