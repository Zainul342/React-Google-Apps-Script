import React from 'react';

interface VideoEmbedProps {
  videoId: string;
}

const VideoEmbed: React.FC<VideoEmbedProps> = ({ videoId }) => {
  return (
    <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-sm bg-slate-200 my-2">
      <iframe
        className="absolute top-0 left-0 w-full h-full border-0"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default VideoEmbed;
