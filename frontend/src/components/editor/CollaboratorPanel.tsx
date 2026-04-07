export default function CollaboratorPanel() {
  return (
    <aside className="w-80 bg-surface-container border-l border-outline-variant/10 flex flex-col h-full overflow-hidden shrink-0">
      {/* Presence Header */}
      <div className="p-6 border-b border-outline-variant/5 shrink-0">
        <h2 className="font-headline font-bold text-lg mb-4">Active Now</h2>
        <div className="flex flex-col gap-4">

          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img alt="Sarah J." className="w-10 h-10 rounded-full ring-2 ring-secondary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCERxfAxI79xbwERMadF0gyLszYZVQuZ5FzQI6as6CYQ5auh8hZYahDHZcsy8O9yL9yA9B57KkYCULzYI1IJi82Pqp31TKefEHdkrYppRXMlQt0kCQkSMt8Ujl7JAtNyo2oULRIAY3F-JM4ZgaXo-4odUtzeMyCTqm7YacUkJNiuafD2AR1uLNgj-tgk_UaMJ3P8hBdyif19WOV95dQbXo8XeWEHKVACUKOzs8AfD94q2V7FoZ3QHBQhbEE4D_HNwEe5idKshilPIQ" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-surface-container"></span>
              </div>
              <div>
                <p className="text-sm font-semibold">Sarah J.</p>
                <p className="text-[10px] text-on-surface-variant">Editing Audio Track 2</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">near_me</span>
          </div>

          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img alt="Marcus K." className="w-10 h-10 rounded-full ring-2 ring-tertiary" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpeZbKBbWbVCP2Ib6n5cB1qLBz-peus9RUTkvCbnizkRb1KTCXQRuHeOLgYBZ98rpFbsoQvGkOx15f9El9-LtTwDwg82AMPOtTVhTQSB57-UzOHNtzjf1arLFDb7BzstOpYycp9NajrBIMAGa12KmCWfaQwNOJuanB18iOVdqlmYw_t7LMMihkvjwy3MRwlBW-t39sqKFu3pzg5I90ppoyjWHoyuo7G11R5Ii9LNRliTlRHr6vH3hqc3Cyn-ZotD56TErwIaNutdY" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-tertiary rounded-full border-2 border-surface-container"></span>
              </div>
              <div>
                <p className="text-sm font-semibold">Marcus K.</p>
                <p className="text-[10px] text-on-surface-variant">Reviewing Sequence</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">near_me</span>
          </div>

          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="relative opacity-60">
                <img alt="Elena V." className="w-10 h-10 rounded-full grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBK42D2dq3c-yG3gHAqdPmookOU6zM5UqXoCknmGMj3zg5z9KBbqR2tHUs83Hwb-Ur37kgfhEaxUD5zD6GS6I-PVOs3H8wxDuU3LPmwvEwfdCoBfo2LU-9WHGJdoUFfjOORQTSaGKuEGKshh57dx3GfdFt409pQX3sI6YpWnDQ9eu0Uro4NnQcrn8dnakK_mWV__tz77982u2d-Q2B17rDGsRR5tb6Dv386EGViQsVR0OihUPbJxu1OydpHJ3RLeqPKGJ538xi1wB0" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-outline rounded-full border-2 border-surface-container"></span>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface-variant">Elena V.</p>
                <p className="text-[10px] text-on-surface-variant/50">Last seen 12m ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-surface-container-low/30 relative">
        <div className="px-6 py-4 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Team Chat</span>
          <span className="material-symbols-outlined text-sm text-on-surface-variant">more_horiz</span>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-6 custom-scrollbar pb-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-secondary">Sarah J.</span>
              <span className="text-[9px] text-on-surface-variant">10:42 AM</span>
            </div>
            <p className="text-xs bg-surface-container-highest/50 p-3 rounded-md rounded-tl-none border-l border-secondary/30">
              Hey team, I've adjusted the gain on the opening sequence. Let me know what you think!
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-tertiary">Marcus K.</span>
              <span className="text-[9px] text-on-surface-variant">10:45 AM</span>
            </div>
            <p className="text-xs bg-surface-container-highest/50 p-3 rounded-md rounded-tl-none border-l border-tertiary/30">
              Sounds much cleaner. I'm going to start the color grade on the bridge section now.
            </p>
          </div>

          <div className="flex flex-col gap-1 items-end">
            <div className="flex items-center justify-between w-full">
              <span className="text-[9px] text-on-surface-variant">10:48 AM</span>
              <span className="text-[11px] font-bold text-primary">You</span>
            </div>
            <p className="text-xs bg-primary/10 p-3 rounded-md rounded-tr-none border-r border-primary/30 text-primary-fixed text-right">
              Copy that. I'll focus on the transition effects.
            </p>
          </div>
        </div>

        <div className="p-4 shrink-0 bg-surface-container-low/30 z-10">
          <div className="relative">
            <input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/30 text-xs py-3 pl-3 pr-10 focus:ring-0 focus:border-primary transition-all outline-none" placeholder="Type a message..." type="text" />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary">
              <span className="material-symbols-outlined text-lg">send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manage Permissions Section */}
      <div className="p-6 bg-surface-container-high/50 border-t border-outline-variant/10 shrink-0">
        <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">group_add</span>
          Invite Members
        </h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <input className="flex-1 bg-background text-xs border border-outline-variant/15 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" placeholder="collab@email.com" type="email" />
            <button className="bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-md active:scale-95 transition-transform">Send</button>
          </div>
          <div className="p-3 bg-surface-container-lowest/50 rounded-md border border-dashed border-outline-variant/20 flex items-center justify-between group cursor-pointer hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="material-symbols-outlined text-sm text-on-surface-variant">link</span>
              <span className="text-[10px] text-on-surface-variant truncate">kinetic.edit/project-alpha-x92...</span>
            </div>
            <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">COPY</span>
          </div>
          <button className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-on-surface-variant hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">settings_account_box</span>
            Advanced Permissions
          </button>
        </div>
      </div>
    </aside>
  );
}
