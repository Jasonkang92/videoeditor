import { Link } from "react-router-dom";
import TopNavBar from "../components/layout/TopNavBar";

export default function Dashboard() {
  return (
    <>
      <TopNavBar />
      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1 overflow-y-auto custom-scrollbar">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">Workspace</h1>
            <p className="text-on-surface-variant text-lg max-w-md">Continue where you left off or start a new cinematic sequence.</p>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary font-headline font-bold px-6 py-3 rounded-md shadow-[0_4px_14px_0_rgba(182,160,255,0.15)] hover:opacity-90 active:scale-95 transition-all">
            <span className="material-symbols-outlined">add</span>
            <span>New Project</span>
          </button>
        </div>

        {/* Filters & View Toggle */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/15">
          <div className="flex gap-4">
            <button className="text-sm font-semibold text-primary border-b-2 border-primary pb-4">All Projects</button>
            <button className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors pb-4">Shared with me</button>
            <button className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors pb-4">Archived</button>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 bg-surface-container-highest rounded-md text-primary transition-colors">
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-md transition-colors">
              <span className="material-symbols-outlined">view_list</span>
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* Project Card 1: Featured/Large */}
          <Link to="/project/alpha" className="group relative bg-surface-container rounded-lg overflow-hidden lg:col-span-2 aspect-[21/9] flex flex-col justify-end p-8 transition-all hover:bg-surface-container-high cursor-pointer">
            <div className="absolute inset-0 z-0 opacity-60 group-hover:opacity-40 transition-opacity">
              <img
                className="w-full h-full object-cover"
                alt="Project thumbnail"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuABlzSRjMbzWMZKBN2b5r1RFCfueVnyvDgwklSVzPuUompGiFFuOVkhfZnURwouNT6-_UKJpcQNr-_V6kI02_w8WKMUdZh-vPuuK04mblo1GLgK3GTTAb52Gd_Dq_GEWW-bp_vy4jyRNvmyeFQdHeNbwc5c7fGf69OEeOVjdoFFUAVvW7rAoiQvXFLxN9QQxjtF8HFxVZwudnMaEmfwzktSlHXyrk-03RFrPuA0dOyNXh2LeKL4xtMjEh-FnNSeZLE-uRUxy1gW7bY"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest rounded">Featured</span>
                  <span className="text-on-surface-variant text-xs font-medium">Last edited 2h ago</span>
                </div>
                <h3 className="font-headline text-3xl font-extrabold text-on-surface mb-1">Neon Drift - Final Cut</h3>
                <p className="text-on-surface-variant/80 text-sm">Commercial campaign for Cyber-X sneakers</p>
              </div>
              <div className="flex -space-x-3">
                <div className="h-10 w-10 rounded-full border-2 border-surface-container overflow-hidden">
                  <img alt="Team Member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8MNwWj2xSfk3VVeOTSzA3ptZ7QRwaAttj-66qEULR6IYw1R2I6hQxxM4hIMuM6xyADNbsaB1qhh3PHsL3W4SH6NfkESVNWPGbvpFV2Ud1MFkUueFw77L5MZ096AEBhUZ6_6x8lsXpHpRaCgmn6LC0G_T9SVBPyr9MYfy0EKZZhha0KbvnYV42Z9ZG3JpTzijpCwoxXsSf5kaG3ij80-v8NwgJtqeFylczhrK41lHzA50VU7Kme4zlyfMkhRBnSqSsUrm2TkT5cGk" />
                </div>
                <div className="h-10 w-10 rounded-full border-2 border-surface-container overflow-hidden">
                  <img alt="Team Member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCphanC5PWVRZFCMcAWBQIr55mvMWOA74vX-ahOx2pKoKQ-qVsH9FZEt-IzXhx9ccbtmJjctH2Ohgtn8Vhs1vSYvIu7PeZS6OjNYaNnjbAMM2x5SvqocIdb3zwL-UKD4nhk9e5xZvg0f_bebuNJMuPa35lrtkGArd3bQTOiet-VOfcxDo1ndR9sRnXwq5I7v72sVLWK00vE_-kCCn-a96SryXHwvI-nR3d85zere1GefbD38di8XRUMLG0f53FXo_tLBT2wMRL3uxU" />
                </div>
                <div className="h-10 w-10 rounded-full border-2 border-surface-container bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-primary">
                  +4
                </div>
              </div>
            </div>
          </Link>

          {/* Project Card 2 */}
          <Link to="/project/synthwave" className="group bg-surface-container rounded-lg overflow-hidden flex flex-col p-4 transition-all hover:bg-surface-container-high cursor-pointer">
            <div className="aspect-video w-full rounded-md overflow-hidden mb-4 relative bg-surface-container-lowest">
              <img
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                alt="Project thumbnail"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbDPBJfG9TPD5MIKuX2IZyDHZeKxV3VKbhqsnOHadSi6RUPoT8ikTKMNsEqQQU8BvQ0wtYe_UwZmukCEMLV1D2t9EjKfINaeWp5saiMTNs-q-wPR_sPRwPS9zufvf9MSfTFjVs3moa7NrH-K5EUvp4WPWdoUrkKHXYLQTAtmceKCVINKuExgCUVxuefewiU_7oKkgfePZKa6B5llubpOjoe9BWysRAe2sUcHRTgCvQ10Xe0qRS1OUpXsZAR4BXS5SjYNyQHM-qNI4"
              />
              <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-medium text-on-surface">12:45</div>
            </div>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-headline font-bold text-on-surface truncate">Synthwave Documentary</h4>
              <button className="text-on-surface-variant hover:text-on-surface" onClick={(e) => e.preventDefault()}>
                <span className="material-symbols-outlined text-sm">more_vert</span>
              </button>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-on-surface-variant text-[11px] font-medium">Edited yesterday</span>
              <div className="flex -space-x-2">
                <div className="h-6 w-6 rounded-full border-2 border-surface-container overflow-hidden ring-2 ring-secondary">
                  <img alt="Team Member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8ejMVd-0lzjG5e9V0vbFFj8eKBhH9s-cEqGRzalnvptl0veFlF1F1IO-ouK3RjXHJ71ZEHqSVdBS2pW7XE1i_Mb-idyhLt_8VQAlHS0oGQEcTekWrIDGF-yXVrdWnDbZ6rZnedJIDX1sC0HYy_MilVgzT7Q1ar6Q2WbXfFTJJtq0OHqUUPqVCJ776oVCBZz4NVw5_iaG_WF6tnJG7Ssw-MeA3aR6w46XcN4n2fpripwTp49CyoZFA6npj-2JkLCh1AwOjSTzsjgk" />
                </div>
              </div>
            </div>
          </Link>

          {/* Project Card 3 */}
          <Link to="/project/showcase" className="group bg-surface-container rounded-lg overflow-hidden flex flex-col p-4 transition-all hover:bg-surface-container-high cursor-pointer">
            <div className="aspect-video w-full rounded-md overflow-hidden mb-4 relative bg-surface-container-lowest">
              <img
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                alt="Project thumbnail"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuABkqezNXWayW3BXyk-SMyIa4a8j4zxTw4q5_hmRZAaHku6w3eK6HEVx9gDdRV_OE-OKC3VScnSZkJr6zJKlBXO9tpTsV31rYZbERnEyDBCHLs3mKN6fZqT6o2mWOyO4KQaPxUQljaOGosmGcnNg84_qDP5JQEIjVbXmN_-9aNd0KysoAPNp-MzgQXzYDugbj42Hldj-tJH8pRtH8nLAhBJn66EGmAj6RaTvXnpnzGPhvUljgdqGa9dUKr1-06bHaUxXoDAaQzkkTg"
              />
              <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-medium text-on-surface">04:20</div>
            </div>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-headline font-bold text-on-surface truncate">Product Showcase V2</h4>
              <button className="text-on-surface-variant hover:text-on-surface" onClick={(e) => e.preventDefault()}>
                <span className="material-symbols-outlined text-sm">more_vert</span>
              </button>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-on-surface-variant text-[11px] font-medium">Edited 3d ago</span>
              <div className="flex -space-x-2">
                <div className="h-6 w-6 rounded-full border-2 border-surface-container overflow-hidden">
                  <img alt="Team Member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDy2Ix6r2gMEVHlJq4U0q3CjDkWkPICGVqXCfcQeVVXrasjQ16ymGsi_n0au_ZXvf4HoUWFs1J9wg9Ht6BaoZoxOLPpCEZW7Y21NcpDC7_5gVRTCbCVSvw0pIhWWQXgeajyDCWf-xP6O_I56lYRTXmuF0ik8JumDZ4I4DzzqtptgmKdbb1CWhgYcS-fTJQ0lfu4nQAVgaAfaBdc6t9gthlgx7nF1qcH_emyWOYkPUoxWaMsy3s0U9hIh9MB6jEsGd3ZhbWIqwdHcno" />
                </div>
              </div>
            </div>
          </Link>

          {/* Project Card 4 */}
          <Link to="/project/abstract" className="group bg-surface-container rounded-lg overflow-hidden flex flex-col p-4 transition-all hover:bg-surface-container-high cursor-pointer">
            <div className="aspect-video w-full rounded-md overflow-hidden mb-4 relative bg-surface-container-lowest">
              <img
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                alt="Project thumbnail"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdAPBLb_0toxI4dM9wapw-4czKQ_v4XVJz0rraUi6Q0Xxuku1_XaKm3AEnhNB4jLqkkAoy0jFO7x1dnx02Hotb_QgDRAPJVp5tfR6WqPD3kt8Bu8oDsEcl-2rp50txv_EcwMGhb8IFA2glKTChBFQkdv5M6N1HvsXLphsltUQ3rWKcahorTco9uyRl2LdF_FUmwRB0amNE6c4g1DynT2Eqbsqwns4xPVtK7j4Chpr1JKrWHR3JdPWOLSVuIlLlBPx3Z-iwDqiatpA"
              />
              <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-medium text-on-surface">01:15</div>
            </div>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-headline font-bold text-on-surface truncate">Abstract Motion Piece</h4>
              <button className="text-on-surface-variant hover:text-on-surface" onClick={(e) => e.preventDefault()}>
                <span className="material-symbols-outlined text-sm">more_vert</span>
              </button>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-on-surface-variant text-[11px] font-medium">Edited 1w ago</span>
              <div className="flex -space-x-2">
                <div className="h-6 w-6 rounded-full border-2 border-surface-container overflow-hidden ring-2 ring-tertiary">
                  <img alt="Team Member" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCq-dX5tYOhcWbAtgYNDRMbWzYy4Ukkgr0rj2bwMe_GfIDtpb8oLE1hLrPI7zu6mNpiNljBBBL_wCHHjJmSRNj41QEYxa5lXpgDv7IHAZYa0PIHXIa508oTzBbiIZWJ28UvVAEZ1Ed_mXP11WDXj-uN3nyFlx5FGsPJo2-rrpjO6JZSIyPBSujm4my1eihdraqJKlZUYs2CJi4kzl7B-FiYZgvHfFPmwda9lEhgvwFBR8tBsygd2ZnVUqj-vxPAaKoiQ80MV62BKl8" />
                </div>
              </div>
            </div>
          </Link>

          {/* Empty State / New Project Placeholder */}
          <div className="border-2 border-dashed border-outline-variant/20 rounded-lg flex flex-col items-center justify-center p-8 transition-all hover:border-primary/40 group cursor-pointer bg-surface-container/20">
            <div className="h-12 w-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors mb-4">
              <span className="material-symbols-outlined text-3xl">add_circle</span>
            </div>
            <p className="font-headline font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">Create from template</p>
            <p className="text-[11px] text-on-surface-variant/60 mt-1 uppercase tracking-widest">Speed up your workflow</p>
          </div>
        </div>
      </main>
    </>
  );
}
