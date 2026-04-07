import TopNavBar from "../components/layout/TopNavBar";

export default function Export() {
  return (
    <>
      <TopNavBar />
      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <section className="lg:col-span-8 flex flex-col gap-6">
            <header>
              <h1 className="font-headline text-4xl font-extrabold tracking-tight mb-2">Final Review</h1>
              <p className="text-on-surface-variant font-medium">Project Alpha • Last edited 2 minutes ago</p>
            </header>

            <div className="aspect-video w-full rounded-xl overflow-hidden bg-surface-container-lowest relative group">
              <img
                alt="Final video preview"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVqvLjr1U6vLTb1OBgvWG7xkPut_-Knm59292qQomfK3Ndrg41EHWUIn-StAZn-DNeR1LIVlvmQJm1hasAfFTBv8sNvDL-GUL68n-5LURlSv-NYA3k9mbT3hcG-P7y5lEGKSRSafoqd43R75rfpQumQFH7BM4x6KoInHJeZrrrdQs3UB3x7pf9B2XdDT7gNGDlOwxuSgD3CUcPho93pBg1Ah0nIlJ7_ZGc-zCnI-CK-_P93YBRXWISzrqeboxm6sbqXwyXXI_DuIk"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center text-on-primary shadow-[0_0_40px_rgba(182,160,255,0.4)]">
                  <span className="material-symbols-outlined !text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/3 shadow-[0_0_12px_rgba(182,160,255,0.8)]"></div>
              </div>
            </div>

            <div className="bg-surface-container p-6 rounded-xl">
              <h3 className="font-headline text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">group</span>
                Share with Team
              </h3>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full ring-2 ring-surface border-2 border-secondary overflow-hidden">
                    <img alt="Collab 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuWvUEsHfMu7dzRpMhhws4slTJ0GpWPCumql4I51Uv4SoEPWrzdz3sA0I-q1wYCsYm13QUxxB1nQHcgToCixWXF0BmgKp_dTf7P0Vq3DhBdNfmqTuU85hkkTFAlizCq6Vq6RhlCzmeERMWWKZNBOU6sMqMNmasa8Jm44Anj5UG_tohHSjtUI25859h8DV0cww4ksbqmaM1wwtxV_kiVIX8UJxQlVLQvueN29IT_6Jk39mDQn4xXqQXtatmfn3hZe247rtmdzC2A5w" />
                  </div>
                  <div className="w-10 h-10 rounded-full ring-2 ring-surface border-2 border-tertiary overflow-hidden">
                    <img alt="Collab 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFX5uQgguNMIPafw1m1cP23NU1jxk7rxFfglQtx5wmkhX9fy1KBqRQOhSCEXMECF7mDVro97JYk-T-v4QTOsUBIGtzlmK__Lj0KEfNCQq6kxAVuGcr3GV-o4FpH9cYNBEt8XkxqQRYtmWenIl1hxfBPF-wGofu0FcfkUuhGdm7sCxtWIBHn4GRRzLpZ6AarkHjytU2JD_Z-UVBdmMVq-AQ6vYzeOlUXrdcNKUYxVYh1CqjhsrvOliF9J_hVuDmxtt9DSKivfnuhjQ" />
                  </div>
                  <div className="w-10 h-10 rounded-full ring-2 ring-surface bg-surface-container-highest flex items-center justify-center border-2 border-outline-variant">
                    <span className="text-xs font-bold">+4</span>
                  </div>
                </div>
                <div className="h-8 w-px bg-outline-variant/30 mx-2"></div>
                <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest text-primary font-medium rounded-md hover:bg-surface-bright transition-colors active:scale-95">
                  <span className="material-symbols-outlined text-sm">link</span>
                  Copy Link
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant/20 text-on-surface font-medium rounded-md hover:bg-surface-container-highest transition-colors active:scale-95">
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  Invite
                </button>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container p-6 rounded-xl h-fit">
              <h3 className="font-headline text-lg font-bold mb-6">Export Settings</h3>
              <div className="space-y-6">

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Resolution</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="px-4 py-3 rounded-md border-2 border-primary bg-primary/5 text-primary font-bold text-sm">4K Ultra HD</button>
                    <button className="px-4 py-3 rounded-md border-2 border-transparent bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest transition-colors font-medium text-sm">1080p Full HD</button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Format</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-md border-b border-outline-variant/20">
                      <span className="font-medium text-sm">MP4 (H.264)</span>
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <div className="flex items-center justify-between p-3 hover:bg-surface-container-low rounded-md transition-colors cursor-pointer group">
                      <span className="font-medium text-sm text-on-surface-variant group-hover:text-on-surface">MOV (ProRes 422)</span>
                      <span className="material-symbols-outlined text-outline-variant">radio_button_unchecked</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">Quality</label>
                  <div className="w-full h-1.5 bg-surface-container-low rounded-full mb-4 relative">
                    <div className="absolute top-0 left-0 h-full w-3/4 bg-primary rounded-full"></div>
                    <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary border-4 border-surface rounded-full shadow-[0_0_10px_rgba(182,160,255,0.5)]"></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">
                    <span>Fast Render</span>
                    <span className="text-primary">High Quality</span>
                    <span>Master</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant/15">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm text-on-surface-variant">Estimated File Size</span>
                    <span className="text-sm font-bold">1.24 GB</span>
                  </div>
                  <button className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-extrabold text-lg py-4 rounded-md shadow-[0_20px_40px_-10px_rgba(182,160,255,0.3)] active:scale-95 transition-transform">
                    Export Video
                  </button>
                </div>

              </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/10 p-6 rounded-xl">
              <h4 className="font-headline font-bold text-sm mb-4">Export Queue</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary-fixed-dim">movie</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">Intro_Teaser.mp4</span>
                      <span className="text-secondary">82%</span>
                    </div>
                    <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-secondary w-[82%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </>
  );
}
