export default function VideoPreview() {
  return (
    <section className="flex-1 flex flex-col items-center justify-center p-6 bg-surface min-w-0 overflow-hidden relative">
      <div className="relative w-full max-w-4xl aspect-video bg-surface-container-lowest rounded-md shadow-2xl border border-outline-variant/5 overflow-hidden group">
        <div
          className="absolute inset-0 flex items-center justify-center bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDs_JTh9q_yYQvDWZp9Y2FxkvU3oTQcEgRzFHKLAhJn1p0FdnaXmGYOmV7ARiUkjmecugefcIQnRf0NdMAmiOTIHpp9mw_sJyu5HA6jHUVobjhOwnujjl5Ql4f3CFPXnJ063AJdiBfuqm2L-JQWE-mxoVhKsocuxgzI95-LgxYG19mWtMvgx0cPA3pLvqVWjoswomOypI9voY_v9EI6S8wuADto8ojmss3XmezBZ80bIVGsghN9eUhDyzc79hnEyGmcVQkHFVNNi28')" }}
        ></div>

        {/* Preview Controls (Overlay) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-2 glass-panel rounded-full border border-outline-variant/15 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined cursor-pointer hover:text-primary">skip_previous</span>
          <span className="material-symbols-outlined cursor-pointer hover:text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          <span className="material-symbols-outlined cursor-pointer hover:text-primary">skip_next</span>
        </div>

        {/* Collaborator Cursors */}
        <div className="absolute top-1/4 left-1/3 flex flex-col items-center animate-pulse">
          <span className="material-symbols-outlined text-secondary -scale-x-100">near_me</span>
          <div className="bg-secondary px-1 rounded text-[8px] font-bold text-on-secondary">Alex</div>
        </div>
      </div>

      {/* Preview Stats */}
      <div className="mt-4 flex gap-8 items-center">
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-tighter text-on-surface-variant">Timecode</span>
          <span className="text-lg font-mono text-primary">00:08:14:02</span>
        </div>
        <div className="h-8 w-[1px] bg-outline-variant/20"></div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-tighter text-on-surface-variant">Resolution</span>
          <span className="text-sm font-bold text-white">3840 x 2160</span>
        </div>
        <div className="h-8 w-[1px] bg-outline-variant/20"></div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-tighter text-on-surface-variant">FPS</span>
          <span className="text-sm font-bold text-white">23.976</span>
        </div>
      </div>
    </section>
  );
}
