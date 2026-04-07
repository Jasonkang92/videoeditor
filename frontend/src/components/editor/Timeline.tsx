export default function Timeline() {
  return (
    <section className="h-64 bg-surface-container-lowest flex flex-col border-t border-outline-variant/15 shrink-0">
      {/* Timeline Header / Controls */}
      <div className="h-10 flex items-center justify-between px-4 bg-surface-container border-b border-outline-variant/10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-on-surface-variant cursor-pointer hover:text-white">content_cut</span>
            <span className="material-symbols-outlined text-sm text-primary cursor-pointer">near_me</span>
            <span className="material-symbols-outlined text-sm text-on-surface-variant cursor-pointer hover:text-white">edit</span>
          </div>
          <div className="h-4 w-[1px] bg-outline-variant/30"></div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-on-surface-variant cursor-pointer">zoom_out</span>
            <div className="w-24 h-1 bg-surface-container-highest rounded-full">
              <div className="h-full w-1/2 bg-primary rounded-full"></div>
            </div>
            <span className="material-symbols-outlined text-sm text-on-surface-variant cursor-pointer">zoom_in</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-on-surface-variant">
          <span>00:00:00:00</span>
          <span className="text-primary">00:08:14:02</span>
          <span>00:15:20:00</span>
        </div>
      </div>

      {/* Timeline Tracks */}
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        {/* Tracks Layout */}
        <div className="w-full flex flex-col min-h-full p-2 gap-1 min-w-[800px]">

          {/* Track V2 (Overlays) */}
          <div className="h-12 w-full bg-surface-container/30 rounded flex items-center relative">
            <div className="absolute left-0 w-24 h-full bg-surface-container flex items-center px-3 z-10 border-r border-outline-variant/10">
              <span className="text-[9px] font-bold uppercase text-on-surface-variant">V2</span>
            </div>
            <div className="flex-1 ml-24 flex items-center gap-1 px-4">
              <div className="h-10 w-40 bg-surface-bright border border-primary/40 rounded px-2 flex flex-col justify-center">
                <span className="text-[8px] font-bold truncate">logo_overlay.png</span>
                <div className="h-1 w-full bg-primary/20 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-primary w-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Track V1 (Main Video) */}
          <div className="h-12 w-full bg-surface-container/30 rounded flex items-center relative">
            <div className="absolute left-0 w-24 h-full bg-surface-container flex items-center px-3 z-10 border-r border-outline-variant/10">
              <span className="text-[9px] font-bold uppercase text-on-surface-variant">V1</span>
            </div>
            <div className="flex-1 ml-24 flex items-center gap-1 px-4">
              <div className="h-10 w-[400px] bg-primary-container/20 border border-primary/50 rounded px-2 flex flex-col justify-center">
                <span className="text-[8px] font-bold truncate text-primary-fixed">main_sequence_shot_01.mp4</span>
                <div className="flex gap-1 mt-1">
                  <div className="h-1 w-20 bg-primary/40 rounded-full"></div>
                  <div className="h-1 w-20 bg-primary/40 rounded-full"></div>
                  <div className="h-1 w-20 bg-primary/40 rounded-full"></div>
                </div>
              </div>
              <div className="h-10 w-[200px] bg-surface-bright border border-outline-variant/30 rounded px-2 flex flex-col justify-center opacity-60">
                <span className="text-[8px] font-bold truncate">beach_transition.mp4</span>
              </div>
            </div>
          </div>

          {/* Track A1 (Audio) */}
          <div className="h-12 w-full bg-surface-container/30 rounded flex items-center relative">
            <div className="absolute left-0 w-24 h-full bg-surface-container flex items-center px-3 z-10 border-r border-outline-variant/10">
              <span className="text-[9px] font-bold uppercase text-on-surface-variant">A1</span>
            </div>
            <div className="flex-1 ml-24 flex items-center gap-1 px-4">
              <div className="h-10 w-full bg-tertiary-container/10 border border-tertiary/30 rounded relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-around px-2 opacity-30">
                  <div className="w-0.5 h-4 bg-tertiary"></div><div className="w-0.5 h-8 bg-tertiary"></div><div className="w-0.5 h-6 bg-tertiary"></div><div className="w-0.5 h-2 bg-tertiary"></div><div className="w-0.5 h-8 bg-tertiary"></div><div className="w-0.5 h-4 bg-tertiary"></div><div className="w-0.5 h-10 bg-tertiary"></div><div className="w-0.5 h-6 bg-tertiary"></div><div className="w-0.5 h-8 bg-tertiary"></div><div className="w-0.5 h-4 bg-tertiary"></div><div className="w-0.5 h-2 bg-tertiary"></div><div className="w-0.5 h-6 bg-tertiary"></div><div className="w-0.5 h-4 bg-tertiary"></div><div className="w-0.5 h-8 bg-tertiary"></div><div className="w-0.5 h-10 bg-tertiary"></div><div className="w-0.5 h-6 bg-tertiary"></div>
                </div>
                <span className="absolute top-1 left-2 text-[8px] font-bold text-tertiary">atmospheric_ambience.wav</span>
              </div>
            </div>
          </div>

        </div>

        {/* Playhead */}
        <div className="absolute top-0 bottom-0 left-[350px] w-0.5 bg-primary z-30 flex flex-col items-center">
          <div className="w-3 h-3 bg-primary rounded-sm rotate-45 -mt-1.5 shadow-[0_0_8px_rgba(182,160,255,0.6)]"></div>
          <div className="h-full w-[1px] bg-primary"></div>
        </div>
      </div>
    </section>
  );
}
