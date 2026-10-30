import React from 'react';
import { useApp } from '../../context/AppContext';
import Button from '../common/Button';
import { Play, Clock, Video, Eye } from 'lucide-react';

export default function VideoCard({ video }) {
  const { setActiveVideo } = useApp();

  return (
    <div className="bg-white dark:bg-[#171717] rounded-lg overflow-hidden border border-swiss-border dark:border-[#262626] flex flex-col justify-between group hover:border-swiss-black dark:hover:border-white transition-colors">
      {/* Thumbnail with overlay */}
      <div
        onClick={() => setActiveVideo(video)}
        className="relative aspect-video w-full overflow-hidden bg-[#0a0a0a] cursor-pointer"
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
        />
        <div className="absolute inset-0 bg-[#0a0a0a]/30" />

        {/* Center Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-lg bg-crimson text-white flex items-center justify-center group-hover:scale-105 transition-transform">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2.5 right-2.5 bg-[#0a0a0a]/90 text-white font-mono text-[10px] px-2 py-0.5 rounded flex items-center gap-1 border border-[#262626]">
          <Clock className="w-3 h-3 text-crimson" />
          <span className="tabular-nums">{video.duration}</span>
        </div>
      </div>

      {/* Video Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-[#737373] mb-1.5 font-mono">
            <span className="font-semibold text-swiss-black dark:text-white flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-crimson" />
              {video.channel}
            </span>
            {video.views && (
              <span className="flex items-center gap-1 text-[#737373] tabular-nums text-[11px]">
                <Eye className="w-3 h-3" />
                {video.views}
              </span>
            )}
          </div>

          <h4
            onClick={() => setActiveVideo(video)}
            className="font-headline text-xs sm:text-sm font-bold text-swiss-black dark:text-white line-clamp-2 hover:text-crimson cursor-pointer transition-colors leading-snug mb-2 tracking-tight"
          >
            {video.title}
          </h4>

          {video.description && (
            <p className="text-xs text-[#737373] line-clamp-2 leading-relaxed mb-3">
              {video.description}
            </p>
          )}
        </div>

        <button
          onClick={() => setActiveVideo(video)}
          className="w-full py-2 rounded-lg bg-swiss-surface dark:bg-[#262626] border border-swiss-border dark:border-[#333333] text-swiss-black dark:text-white font-mono text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 hover:border-swiss-black dark:hover:border-white transition-colors"
          type="button"
        >
          <Play className="w-3 h-3 fill-current text-crimson" />
          Stream Lecture
        </button>
      </div>
    </div>
  );
}
