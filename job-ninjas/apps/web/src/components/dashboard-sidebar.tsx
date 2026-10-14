"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Briefcase, Users, Workflow, Plug,
  BarChart2, Settings, Star, Clock, ChevronDown,
  Plus, Search, Bell, HelpCircle, Video, Hash, ChevronRight
} from "lucide-react";
import { useState } from "react";

const mainNav = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Recent", href: "/roles", icon: Clock },
  { name: "Starred", href: "/roles?filter=starred", icon: Star },
];

const spaces = [
  { name: "Engineering", href: "/roles?space=engineering", color: "bg-blue-500" },
  { name: "Operations", href: "/roles?space=ops", color: "bg-violet-500" },
  { name: "Product", href: "/roles?space=product", color: "bg-emerald-500" },
];

const bottomNav = [
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Integrations", href: "/integrations", icon: Plug },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function DashboardSidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const pathname = usePathname();
  const [spacesOpen, setSpacesOpen] = useState(true);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden" 
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed left-0 top-0 h-full w-60 bg-white border-r border-slate-200 flex flex-col z-40 select-none transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Workspace header */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
        <img src="/logo.png" alt="JobNinjas" width="32" height="32" className="rounded-lg object-contain shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-900 truncate">JobNinjas</p>
          <p className="text-[11px] text-slate-400 truncate">HR Workspace</p>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </div>

      {/* Search */}
      <div className="px-3 py-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-2.5 py-1.5 cursor-text hover:bg-slate-200 transition-colors">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-[12px] text-slate-400">Search by title or topic</span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="px-2 space-y-0.5">
          {mainNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href.split("?")[0]));
            return (
              <Link key={item.name} href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors
                  ${isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Spaces */}
        <div className="mt-4 px-2">
          <button
            onClick={() => setSpacesOpen(!spacesOpen)}
            className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-600 transition-colors">
            <span>Spaces</span>
            <div className="flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" />
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${spacesOpen ? "rotate-90" : ""}`} />
            </div>
          </button>
          {spacesOpen && (
            <div className="mt-1 space-y-0.5">
              {spaces.map((space) => (
                <Link key={space.name} href={space.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${space.color}`}></span>
                  {space.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-4 mx-4 border-t border-slate-100" />

        {/* Bottom nav */}
        <div className="px-2 space-y-0.5">
          {bottomNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors
                  ${isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom user area */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            HR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-slate-900 truncate">HR Manager</p>
            <p className="text-[10px] text-slate-400 truncate">Free plan</p>
          </div>
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
        </div>
      </div>
    </aside>
    </>
  );
}


