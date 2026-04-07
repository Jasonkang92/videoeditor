export default function MediaLibrary() {
  return (
    <section className="w-72 bg-surface-container flex flex-col border-r border-outline-variant/15 shrink-0">
      <div className="p-4 flex justify-between items-center shrink-0">
        <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Media Assets</h2>
        <span className="material-symbols-outlined text-sm text-primary">search</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
        <div className="grid grid-cols-1 gap-2">

          <div className="group relative rounded-md overflow-hidden bg-surface-container-lowest h-32 border border-outline-variant/10 hover:border-primary/50 transition-all cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            <div className="absolute bottom-2 left-2 z-20">
              <p className="text-[10px] font-medium text-white">intro_sequence.mp4</p>
              <p className="text-[8px] text-primary">00:15:20</p>
            </div>
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB0h9zybAYCU1dMYFVpgdEPct9l2PdfXz3xi4M96xVz9k9uEEA_E8oee_QM1Y9ZWj035FTdHXQyHiGhZQPieB7hBbng8Y2PNDcJ0lenPez91wYUosA1ISEhJZKP2SoGhqEWN7sime0y6CJ75mxzimy3NheP27SQ8_vINXWJWnZxljfz2U8IcbhtsUg7K71Gc1Hd3A4uL8pxOGM3DbPsCcfVGbBeOo2p3z7b6AFPZ_0BOyyFaXDJ53aBrqAfGGgMsa_fwRPqPYKpNH4')" }}
            ></div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative rounded-md overflow-hidden bg-surface-container-lowest h-20 border border-outline-variant/10 cursor-pointer">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCA1FwfLVEGouTHhDRnOkUxly6K7OKYrdJat5rtZshZ7ZrMmXpZUWY7GrQflmEAh683LltyGEv40UE_ugioBn2vK2nJHFSHuq8LDjAbHmXSpgMQ-YnRgFJNdYLKVY4hVEb1cKwEFawClCfH7xYaYCxTE6U3xwKtMG_e6_zmnjex4wldhRsxqdsYC8hPJYK6asF8v_t9DaQWHJz5wps4edKbER3aGzTKuuf38qBqNehmafl7H2sjHhVzZr0UKNvuwdU5WSyURyIHEC0')" }}
              ></div>
            </div>
            <div className="flex-1 relative rounded-md overflow-hidden bg-surface-container-lowest h-20 border border-outline-variant/10 cursor-pointer">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCVhcIYFuTccYPZ-6x43LYAVrwfGP-JYhj0YFaj9u3JuFDMrCCBBcHdLwJUZWBFM63q-9FjoKXl0rsnV7JgM-v-rfMXV-CYTihsD2bZaRanXNgSeobzxhAzPm-TaUTH3YQvhL8tako8Kn7khhOIh6uORR5W_c2LdhD5e-Vj4fk36tyh1SzE3SyQowpoaABphES232va2o2uF0AMxlhS1Eli-fpkWNi2oAQWcghoWQUOQ2ToN0itDaMvAbNHOO4L1IYTkf5rIj6kphs')" }}
              ></div>
            </div>
          </div>

          <div className="p-3 bg-surface-container-high rounded-md flex items-center gap-3 hover:bg-surface-container-highest cursor-pointer">
            <span className="material-symbols-outlined text-tertiary">music_note</span>
            <div className="flex-1">
              <p className="text-[10px] text-white">background_lofi.wav</p>
              <p className="text-[8px] text-on-surface-variant">03:45</p>
            </div>
            <span className="material-symbols-outlined text-[10px] text-on-surface-variant">more_vert</span>
          </div>

        </div>
      </div>

      <div className="p-4 shrink-0">
        <button className="w-full py-2 bg-[#b6a0ff] text-[#340090] text-xs font-bold rounded-md active:scale-95 transition-all">
          Import Media
        </button>
      </div>
    </section>
  );
}
