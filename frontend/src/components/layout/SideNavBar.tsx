export default function SideNavBar() {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] z-40 bg-[#131313] w-20 flex flex-col items-center py-4 border-r border-outline-variant/10 shrink-0">
      <div className="flex flex-col items-center gap-1 mb-8">
        <div className="w-10 h-10 bg-surface-container rounded-md flex items-center justify-center mb-1">
          <span className="material-symbols-outlined text-[#ffffff]">folder</span>
        </div>
        <span className="text-[10px] text-[#adaaaa] font-label font-medium uppercase tracking-tighter">Alpha</span>
      </div>

      <div className="flex flex-col gap-4 w-full items-center">
        <div className="group relative bg-[#b6a0ff]/10 text-[#b6a0ff] rounded-md p-3 cursor-pointer active:opacity-80">
          <span className="material-symbols-outlined">video_library</span>
          <span className="absolute left-full ml-4 px-2 py-1 bg-surface-container-highest text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 transition-opacity">Media</span>
        </div>
        <div className="group relative text-[#adaaaa] p-3 hover:bg-[#262626] rounded-md transition-colors cursor-pointer active:opacity-80">
          <span className="material-symbols-outlined">music_note</span>
          <span className="absolute left-full ml-4 px-2 py-1 bg-surface-container-highest text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 transition-opacity">Audio</span>
        </div>
        <div className="group relative text-[#adaaaa] p-3 hover:bg-[#262626] rounded-md transition-colors cursor-pointer active:opacity-80">
          <span className="material-symbols-outlined">title</span>
          <span className="absolute left-full ml-4 px-2 py-1 bg-surface-container-highest text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 transition-opacity">Text</span>
        </div>
        <div className="group relative text-[#adaaaa] p-3 hover:bg-[#262626] rounded-md transition-colors cursor-pointer active:opacity-80">
          <span className="material-symbols-outlined">auto_fix_high</span>
          <span className="absolute left-full ml-4 px-2 py-1 bg-surface-container-highest text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 transition-opacity">Effects</span>
        </div>
        <div className="group relative text-[#adaaaa] p-3 hover:bg-[#262626] rounded-md transition-colors cursor-pointer active:opacity-80">
          <span className="material-symbols-outlined">movie_filter</span>
          <span className="absolute left-full ml-4 px-2 py-1 bg-surface-container-highest text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 transition-opacity">Transitions</span>
        </div>
      </div>

      <button className="mt-auto p-3 text-primary hover:bg-[#262626] rounded-md transition-colors">
        <span className="material-symbols-outlined">add_circle</span>
      </button>
    </aside>
  );
}
