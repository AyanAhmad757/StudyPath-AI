import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../common/Modal';
import { Play, Pause, Volume2, VolumeX, ExternalLink, Video } from 'lucide-react';

export default function VideoModal() {
  const { activeVideo, setActiveVideo } = useApp();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(25);

  if (!activeVideo) return null;

  return (
    <Modal
      isOpen={!!activeVideo}
      onClose={() => setActiveVideo(null)}
      title={activeVideo.title}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Mock Video Player Screen */}
        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-[#0a0a0a] border border-[#262626] group">
          <img
            src={activeVideo.thumbnail}
            alt={activeVideo.title}
            className="w-full h-full object-cover opacity-80"
          />

          {/* Player controls overlay */}
          <div className="absolute inset-0 bg-[#0a0a0a]/40 flex flex-col justify-between p-4">
            {/* Top info */}
            <div className="flex items-center justify-between font-mono">
              <span className="text-xs text-white bg-[#0a0a0a]/80 px-2.5 py-1 rounded border border-[#262626] flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-crimson" />
                {activeVideo.channel}
              </span>
              <span className="text-xs text-[#a3a3a3] bg-[#0a0a0a]/80 px-2 py-1 rounded border border-[#262626] tabular-nums">
                04:32 / {activeVideo.duration}
              </span>
            </div>

            {/* Center Play/Pause state */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-12 h-12 rounded-lg bg-crimson text-white flex items-center justify-center hover:scale-105 transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>
            </div>

            {/* Bottom scrubber and buttons */}
            <div className="space-y-2">
              {/* Scrub bar */}
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newPercent = Math.round((clickX / rect.width) * 100);
                  setProgress(newPercent);
                }}
                className="h-1.5 w-full bg-white/20 hover:h-2 rounded cursor-pointer relative transition-all"
              >
                <div
                  className="h-full bg-crimson rounded relative"
                  style={{ width: `${progress}%` }}
                >
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
                </div>
              </div>

              {/* Bottom icons */}
              <div className="flex items-center justify-between text-white text-xs pt-1 font-mono">
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-crimson">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setIsMuted(!isMuted)} className="hover:text-crimson">
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={activeVideo.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-crimson flex items-center gap-1 font-medium"
                  >
                    <span>External Stream</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video metadata and description */}
        <div className="p-1">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="font-headline text-sm sm:text-base font-bold text-swiss-black dark:text-white tracking-tight">
              {activeVideo.title}
            </h4>
            <span className="text-xs text-[#737373] font-mono tabular-nums">{activeVideo.views}</span>
          </div>
          <p className="text-xs text-[#737373] leading-relaxed">
            {activeVideo.description || 'Curated video lecture aligned with your syllabus topic. Prepared for YouTube API connection.'}
          </p>
        </div>
      </div>
    </Modal>
  );
}
