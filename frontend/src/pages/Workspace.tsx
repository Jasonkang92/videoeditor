import { useState } from "react";
import TopNavBar from "../components/layout/TopNavBar";
import SideNavBar from "../components/layout/SideNavBar";
import BottomNavBar from "../components/layout/BottomNavBar";
import MediaLibrary from "../components/editor/MediaLibrary";
import VideoPreview from "../components/editor/VideoPreview";
import Inspector from "../components/editor/Inspector";
import Timeline from "../components/editor/Timeline";
import CollaboratorPanel from "../components/editor/CollaboratorPanel";

export default function Workspace() {
  // Toggle between editor view (media + inspector) and collab view
  const [activeRightPanel, setActiveRightPanel] = useState<"editor" | "collaborators">("editor");

  return (
    <>
      <TopNavBar />
      <div className="flex flex-1 overflow-hidden relative">
        {/* We can pass down state or handle it via a context, but for simplicity here we assume the nav links can toggle this in the future */}
        <SideNavBar />

        <main className="ml-20 flex-1 flex flex-col bg-[#0e0e0e] pb-12 overflow-hidden">
          {/* Upper Section: Assets, Preview, Inspector/Collaborators */}
          <div className="flex-1 flex overflow-hidden">
            {activeRightPanel === "editor" && <MediaLibrary />}

            <VideoPreview />

            {activeRightPanel === "editor" && <Inspector />}
            {activeRightPanel === "collaborators" && <CollaboratorPanel />}
          </div>

          {/* Timeline Section */}
          <Timeline />
        </main>

        {/* Simple Panel Toggle for Demo Purposes (Optional) */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <button
            onClick={() => setActiveRightPanel("editor")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${activeRightPanel === "editor" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"}`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveRightPanel("collaborators")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${activeRightPanel === "collaborators" ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"}`}
          >
            Team
          </button>
        </div>
      </div>
      <BottomNavBar />
    </>
  );
}
