import { useState } from "react";
import API from "../api/axios";
import Icon from "../components/Icon";

function Upload() {
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile]   = useState(null);
  const [thumbnail, setThumbnail]   = useState(null);
  const [aiInput, setAiInput]       = useState("");
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiError, setAiError]       = useState("");
  const [uploading, setUploading]   = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiError("");
    try {
      const res = await API.post("/ai/generate-metadata", { input: aiInput });
      const { title: t, description: d } = res.data.data;
      setTitle(t);
      setDescription(d);
    } catch (err) {
      setAiError(err.response?.data?.message || "Failed to generate. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !thumbnail) {
      setAiError("Please select both a video file and a thumbnail.");
      return;
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("videoFile", videoFile);
    formData.append("thumbnail", thumbnail);
    setUploading(true);
    setUploadSuccess(false);
    try {
      await API.post("/videos", formData);
      setUploadSuccess(true);
      setTitle(""); setDescription(""); setVideoFile(null);
      setThumbnail(null); setAiInput("");
    } catch (err) {
      setAiError(err.response?.data?.message || "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pt-20 pb-16 px-4 min-h-screen bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold">Upload Video</h1>
          <p className="text-[#666] text-sm mt-1">Share your content with the world</p>
        </div>

        {/* Success banner */}
        {uploadSuccess && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            <Icon name="check" size={16} />
            Video uploaded successfully. It will appear on the home page shortly.
          </div>
        )}

        {/* Error banner */}
        {aiError && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {aiError}
          </div>
        )}

        {/* AI Section */}
        <div className="mb-6 rounded-xl border border-purple-500/20 bg-purple-500/[0.04] p-5">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="sparkle" size={15} className="text-purple-400" />
            <span className="text-purple-400 text-sm font-semibold">AI Metadata Generator</span>
          </div>
          <p className="text-[#666] text-xs mb-4">Describe your video and AI will write the title and description.</p>
          <div className="flex gap-2">
            <input
              className="flex-1 min-w-0 px-3.5 py-2.5 rounded-lg bg-[#111] border border-white/[0.08]
                         text-white text-sm placeholder-[#555] outline-none
                         focus:border-purple-500/50 transition-colors"
              placeholder='e.g. "node js jwt authentication tutorial"'
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !aiLoading && handleGenerate()}
              disabled={aiLoading}
            />
            <button
              onClick={handleGenerate}
              disabled={aiLoading || !aiInput.trim()}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg
                         bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold
                         transition-colors duration-150 border-none cursor-pointer
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="ai" size={14} />
              {aiLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-white/[0.06] bg-[#111] p-6 flex flex-col gap-5">

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[#999] text-xs font-medium uppercase tracking-wider">Title</label>
            <input
              className="px-3.5 py-2.5 rounded-lg bg-[#0a0a0a] border border-white/[0.08]
                         text-white text-sm placeholder-[#444] outline-none
                         focus:border-purple-500/50 transition-colors"
              placeholder="Enter video title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[#999] text-xs font-medium uppercase tracking-wider">Description</label>
            <textarea
              className="px-3.5 py-2.5 rounded-lg bg-[#0a0a0a] border border-white/[0.08]
                         text-white text-sm placeholder-[#444] outline-none resize-none
                         focus:border-purple-500/50 transition-colors font-sans"
              placeholder="Describe your video..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* File pickers row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Video file */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#999] text-xs font-medium uppercase tracking-wider">Video File</label>
              <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg
                                bg-[#0a0a0a] border border-white/[0.08] cursor-pointer
                                hover:border-purple-500/40 transition-colors group">
                <Icon name="video" size={16} className="text-[#555] group-hover:text-purple-400 transition-colors shrink-0" />
                <span className="text-sm truncate text-[#555] group-hover:text-[#888] transition-colors">
                  {videoFile ? videoFile.name : "Choose video"}
                </span>
                <input type="file" accept="video/*" className="hidden"
                  onChange={(e) => setVideoFile(e.target.files[0])} />
              </label>
            </div>

            {/* Thumbnail */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#999] text-xs font-medium uppercase tracking-wider">Thumbnail</label>
              <label className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg
                                bg-[#0a0a0a] border border-white/[0.08] cursor-pointer
                                hover:border-purple-500/40 transition-colors group">
                <Icon name="image" size={16} className="text-[#555] group-hover:text-purple-400 transition-colors shrink-0" />
                <span className="text-sm truncate text-[#555] group-hover:text-[#888] transition-colors">
                  {thumbnail ? thumbnail.name : "Choose image"}
                </span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => setThumbnail(e.target.files[0])} />
              </label>
            </div>
          </div>

          {/* Thumbnail preview */}
          {thumbnail && (
            <div className="rounded-lg overflow-hidden border border-white/[0.06] aspect-video bg-[#0a0a0a]">
              <img
                src={URL.createObjectURL(thumbnail)}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleUpload}
            disabled={uploading || !title.trim() || !videoFile || !thumbnail}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg
                       bg-gradient-to-r from-purple-600 to-cyan-600
                       hover:from-purple-500 hover:to-cyan-500
                       text-white text-sm font-semibold
                       transition-all duration-200 active:scale-[0.98]
                       border-none cursor-pointer
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <Icon name="upload" size={16} />
            {uploading ? "Uploading..." : "Publish Video"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Upload;
