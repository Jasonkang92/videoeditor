import { Link, useLocation } from "react-router-dom";

export default function TopNavBar() {
  const location = useLocation();

  const isLinkActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="flex justify-between items-center px-6 h-16 w-full z-50 bg-[#0e0e0e] md:bg-[#1a1a1a] top-0 sticky shrink-0">
      <div className="flex items-center gap-8">
        <Link to="/">
          <span className="text-xl font-black text-[#b6a0ff] tracking-tight font-headline">KineticEdit</span>
        </Link>
        <div className="hidden md:flex gap-6 items-center h-full">
          <Link
            to="/"
            className={`font-headline font-bold text-lg transition-colors ${
              isLinkActive("/") ? "text-[#ffffff] border-b-2 border-[#b6a0ff] pb-1" : "text-[#adaaaa] hover:text-[#ffffff]"
            }`}
          >
            Projects
          </Link>
          <Link
            to="#"
            className="font-headline font-bold text-lg text-[#adaaaa] hover:text-[#ffffff] transition-colors"
          >
            Assets
          </Link>
          <Link
            to="#"
            className="font-headline font-bold text-lg text-[#adaaaa] hover:text-[#ffffff] transition-colors"
          >
            Collaborators
          </Link>
          <Link
            to="/export"
            className={`font-headline font-bold text-lg transition-colors ${
              location.pathname.includes("/export") ? "text-[#ffffff] border-b-2 border-[#b6a0ff] pb-1" : "text-[#adaaaa] hover:text-[#ffffff]"
            }`}
          >
            Export
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input
            className="bg-surface-container-low border-none border-b border-outline-variant/15 text-sm py-2 pl-10 pr-4 focus:ring-0 focus:border-primary transition-all w-64 rounded-md outline-none"
            placeholder="Search projects..."
            type="text"
          />
        </div>

        {/* Collaborators cluster (shows when inside a project) */}
        {location.pathname.includes('/project') && (
          <div className="hidden md:flex -space-x-2 mr-4">
            <div className="relative">
              <img className="w-8 h-8 rounded-full border-2 border-secondary" alt="Collaborator" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDL28uT8o91YgRGUOjk09rmNqe4sTcX4R96ojyWshffn3KmwZz8uTIZ0qS3YGA-ysMEtO0KfW1woDefz0bTqWgJstaqnqWMpHTYA2PqWo2Ntj8GMOrxFgpjnqnYYV4yMfwOSqHecOBFlPhug1kWBMB1npcXVlUzYwkHJuoDbN5V-3DgahFZfG5tBbocroreg2nVtfZx313ZIyX6v3hx9KnRah8pSV23wrk5P7_tf2MQf_-79frj2j3N3vgyRxQnryLeH9pfpGav23k" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full"></div>
            </div>
            <div className="relative">
              <img className="w-8 h-8 rounded-full border-2 border-tertiary" alt="Collaborator" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu3pSD4H64jsz2JExWG8d2joqWZb-3_OOui5tIvt5bEhKgTjFtOOWTgGpU8wun_jcWg_DsB1VtYpHheaYq2nLiJFYg-E3IEfcTx8QEHOPZKW0uIaHNsQDRWUHEy-Jt8mu6NEDVX8eiPVQh7gfwi0jo1qeXM-zEuo-B19IJ94WqtrbJCKkek9L-RKpZ1TDwACI_P1tXVPFeyfH2-dsaCytSSpdFb1UScfL4dJhO7TLTOBO_Nh7LvrISish9HVAooKGnIRySDhML_rA" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-tertiary rounded-full"></div>
            </div>
          </div>
        )}

        <button className="p-2 text-[#adaaaa] hover:bg-[#262626] transition-all rounded-md active:scale-95 duration-200">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-[#adaaaa] hover:bg-[#262626] transition-all rounded-md active:scale-95 duration-200">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="h-8 w-8 rounded-full bg-surface-container overflow-hidden border border-outline-variant/20 ml-0 md:ml-2">
          <img alt="User profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnoqunUtC3v2ei_oXJvEVQrRxeR8_P5-hS95tRNhbejaa6E24oVD0lu-B8mYcsFNkAhRSStROJaoCCt0PmqBHTCV4xWvq-E5fYcch0zPqBoMZfhYp9REuCdsw01mTlbiA1QISLXQce0s6tnK8lPYUnXSUXtilDC1t1NY0PrZCC8ezQ-gvMQLvE1OsV4-HvkPcMVsSSwKxUKbyiwDKtVe3xmlGtFvQ5bb-Fy1wpTZqaRU83deSxuJbIAIFUZ4a-WrJddcfqXx_49tI" />
        </div>
      </div>
    </nav>
  );
}
