import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../api/axios";

function Video() {
  const { id } = useParams(); // URL se id le raha

  const [video, setVideo] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      const res = await API.get(`/videos/${id}`);
      setVideo(res.data.data);
    };

    fetchVideo();
  }, [id]);

  if (!video) return <p>Loading...</p>;

  return (
    <div>
      <video src={video.videoFile} controls width="600" />

      <h2>{video.title}</h2>
      <p>{video.description}</p>
    </div>
  );
}

export default Video;


/*1. User click thumbnail
↓
2. navigate("/video/123")
↓
3. React Router → Video.jsx load
↓
4. useParams() → id = 123
↓
5. API call → /videos/123
↓
6. Backend → DB → video data
↓
7. setVideo()
↓
8. UI render → video play */