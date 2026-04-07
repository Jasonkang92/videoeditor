export default function BottomNavBar() {
  return (
    <nav className="fixed bottom-0 w-full z-50 flex justify-around items-center border-t border-[#484847]/15 bg-[#000000] h-12">
      <button className="text-[#b6a0ff] flex flex-col items-center justify-center scale-110 duration-300 ease-out transition-transform">
        <span className="material-symbols-outlined text-lg">view_timeline</span>
        <span className="font-label text-[8px] uppercase tracking-widest mt-0.5">Timeline</span>
      </button>
      <button className="text-[#484847] flex flex-col items-center justify-center hover:text-[#ffffff] transition-colors">
        <span className="material-symbols-outlined text-lg">equalizer</span>
        <span className="font-label text-[8px] uppercase tracking-widest mt-0.5">Mixer</span>
      </button>
      <button className="text-[#484847] flex flex-col items-center justify-center hover:text-[#ffffff] transition-colors">
        <span className="material-symbols-outlined text-lg">layers</span>
        <span className="font-label text-[8px] uppercase tracking-widest mt-0.5">Layers</span>
      </button>
      <button className="text-[#484847] flex flex-col items-center justify-center hover:text-[#ffffff] transition-colors">
        <span className="material-symbols-outlined text-lg">history</span>
        <span className="font-label text-[8px] uppercase tracking-widest mt-0.5">History</span>
      </button>
    </nav>
  );
}
