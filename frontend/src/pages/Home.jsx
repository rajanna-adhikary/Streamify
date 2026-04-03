import { useEffect, useState } from "react";
import API from "../api/axios";
import VideoCard from "../components/VideoCard";
import Icon from "../components/Icon";

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="w-full aspect-video rounded-xl bg-white/[0.06]" />
      <div className="pt-3 px-1 space-y-2">
        <div className="h-3.5 bg-white/[0.06] rounded w-4/5" />
        <div className="h-3 bg-white/[0.06] rounded w-3/5" />
        <div className="h-3 bg-white/[0.06] rounded w-1/4" />
      </div>
    </div>
  );
}

function Home() {
  const [videos, setVideos]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/videos")
      .then((res) => setVideos(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-20 px-6 pb-12 max-w-[1400px] mx-auto min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-white text-xl font-bold">For You</h1>
        {!loading && (
          <span className="text-[#555] text-xs">{videos.length} videos</span>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : videos.map((video) => <VideoCard key={video._id} video={video} />)
        }
      </div>

      {/* Empty state */}
      {!loading && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
            <Icon name="inbox" size={26} className="text-[#444]" />
          </div>
          <p className="text-white font-semibold text-base">No videos yet</p>
          <p className="text-[#555] text-sm mt-1.5">Upload your first video to get started</p>
        </div>
      )}
    </div>
  );
}

export default Home;
