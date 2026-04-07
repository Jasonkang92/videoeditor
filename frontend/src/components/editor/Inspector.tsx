export default function Inspector() {
  return (
    <section className="w-80 bg-surface-container flex flex-col border-l border-outline-variant/15 shrink-0">
      <div className="p-4 flex items-center justify-between shrink-0">
        <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Inspector</h2>
        <div className="flex gap-2">
          <button className="p-1 hover:bg-surface-container-highest rounded"><span className="material-symbols-outlined text-sm">visibility</span></button>
          <button className="p-1 hover:bg-surface-container-highest rounded"><span className="material-symbols-outlined text-sm">lock</span></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 space-y-6">

          {/* Transform */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-primary uppercase">Transform</span>
              <span className="material-symbols-outlined text-xs text-on-surface-variant">expand_more</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] text-on-surface-variant">Opacity</span>
                <div className="flex-1 h-1 bg-surface-container-lowest rounded-full relative">
                  <div className="absolute left-0 top-0 h-full w-4/5 bg-primary rounded-full"></div>
                  <div className="absolute left-[80%] -top-1 w-3 h-3 bg-white rounded-full shadow"></div>
                </div>
                <span className="text-[11px] w-8 text-right">80%</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] text-on-surface-variant">Scale</span>
                <div className="flex-1 h-1 bg-surface-container-lowest rounded-full relative">
                  <div className="absolute left-0 top-0 h-full w-[65%] bg-primary rounded-full"></div>
                  <div className="absolute left-[65%] -top-1 w-3 h-3 bg-white rounded-full shadow"></div>
                </div>
                <span className="text-[11px] w-8 text-right">100</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[11px] text-on-surface-variant">Rotation</span>
                <div className="w-32 bg-surface-container-low border-b border-outline-variant/30 py-1 px-2 flex justify-between">
                  <span className="text-[11px]">0.0°</span>
                  <span className="material-symbols-outlined text-xs">rotate_right</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compositing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-primary uppercase">Compositing</span>
              <span className="material-symbols-outlined text-xs text-on-surface-variant">expand_more</span>
            </div>
            <div className="bg-surface-container-low border-b border-outline-variant/30 py-2 px-3 flex justify-between items-center cursor-pointer">
              <span className="text-[11px] text-on-surface-variant">Blending Mode</span>
              <span className="text-[11px] text-white font-medium">Normal</span>
            </div>
          </div>

          {/* Active Effects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-primary uppercase">Active Effects</span>
              <span className="material-symbols-outlined text-xs text-secondary">add</span>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-surface-container-highest rounded-md flex items-center justify-between border-l-2 border-primary">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">tune</span>
                  <span className="text-[11px]">Color Correction</span>
                </div>
                <span className="material-symbols-outlined text-xs text-primary">toggle_on</span>
              </div>
              <div className="p-3 bg-surface-container-highest rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">blur_on</span>
                  <span className="text-[11px]">Gaussian Blur</span>
                </div>
                <span className="material-symbols-outlined text-xs text-on-surface-variant">toggle_off</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
