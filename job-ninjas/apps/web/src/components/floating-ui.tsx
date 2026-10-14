import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  Briefcase, 
  Users, 
  Settings, 
  BarChart, 
  Workflow, 
  LayoutDashboard,
  Plug,
  Search,
  Bell,
  MoreHorizontal,
  Timer,
  MessageSquareText,
  Video,
  Users as UsersIcon,
  Share2,
  Lock,
  ChevronDown,
  Menu
} from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { useState, useRef, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Roles", href: "/roles", icon: Briefcase },
  { name: "Candidates", href: "/candidates", icon: Users },
  { name: "Workflows", href: "/workflows", icon: Workflow },
  { name: "Integrations", href: "/integrations", icon: Plug },
  { name: "Analytics", href: "/analytics", icon: BarChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function FloatingSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 bg-background/90 backdrop-blur-md rounded-2xl shadow-xl border border-border p-2 flex flex-col gap-2 transition-all duration-300">
      {navigation.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            title={item.name}
            className={`
              p-3 rounded-xl flex items-center justify-center transition-all group relative
              ${isActive 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
            `}
          >
            <Icon className="w-5 h-5" />
            
            {/* Tooltip */}
            <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs font-medium rounded-md opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all shadow-sm border border-border whitespace-nowrap z-50">
              {item.name}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function FloatingHeader() {
  const { roles, updateRole } = useDemoStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  
  const pathname = usePathname();
  
  // Extract roleId if we are in a role page
  const roleMatch = pathname.match(/\/roles\/([^\/]+)/);
  const roleId = roleMatch ? roleMatch[1] : null;
  const currentRole = roleId ? roles.find(r => r.id === roleId) : null;
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    if (!currentRole) return;
    setEditedTitle(currentRole.title);
    setIsEditingTitle(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 10);
  };

  const saveTitle = () => {
    if (currentRole && editedTitle.trim() && editedTitle !== currentRole.title) {
      updateRole(currentRole.id, { title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveTitle();
    if (e.key === 'Escape') setIsEditingTitle(false);
  };

  return (
    <>
      {/* Top Left - Brand & Breadcrumb */}
      <div className="fixed top-4 left-4 z-40 flex items-center bg-background/90 backdrop-blur-md rounded-xl shadow-md border border-border p-1.5 transition-all duration-300">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors mr-1"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2 px-3 border-r border-border">
          <div className="w-6 h-6 text-blue-600 flex items-center justify-center">
            <Image 
              src="/logo.png" 
              alt="Job Ninjas" 
              width={24} 
              height={24}
              className="object-contain drop-shadow-sm "
            />
          </div>
          <span className="font-bold text-foreground tracking-tight">Job Ninjas</span>
        </div>

        <div className="flex items-center gap-2 px-4 text-sm font-medium">
          <span className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-full text-xs font-semibold">Acme Corp</span>
          <span className="text-muted-foreground">/</span>
          {isEditingTitle ? (
            <input
              ref={inputRef}
              type="text"
              value={editedTitle}
              onChange={e => setEditedTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none ring-1 ring-blue-500 rounded px-1 min-w-[150px] text-foreground"
            />
          ) : (
            <span 
              className="text-foreground hover:bg-muted px-1 py-0.5 rounded cursor-text transition-colors"
              onClick={startEditing}
              title="Click to edit board name"
            >
              {currentRole ? currentRole.title : "Acme Corp Hiring"}
            </span>
          )}
        </div>
      </div>

      {/* Hamburger Dropdown Menu */}
      {isMenuOpen && (
        <div className="fixed top-20 left-4 z-50 w-64 bg-popover rounded-xl shadow-xl border border-border overflow-hidden py-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-4 py-2 border-b border-border mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Navigation</p>
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      )}

      {/* Top Right - Actions & Profile */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-1 bg-background/90 backdrop-blur-md rounded-xl shadow-md border border-border p-1.5 transition-all duration-300">
        <button className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors" title="Timer">
          <Timer className="w-5 h-5" />
        </button>
        <button className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors" title="Comments">
          <MessageSquareText className="w-5 h-5" />
        </button>
        <button className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors" title="Video Chat">
          <Video className="w-5 h-5" />
        </button>
        
        <div className="w-px h-6 bg-border mx-1"></div>
        
        <button className="flex items-center gap-1 hover:bg-muted rounded-lg p-1 transition-colors">
          <div className="w-8 h-8 rounded-full bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-sm shadow-inner">
            <UsersIcon className="w-4 h-4" />
          </div>
          <span className="text-[10px] text-muted-foreground mr-1">▼</span>
        </button>
        
        <button 
          onClick={() => setIsShareOpen(true)}
          className="ml-1 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </>
  );
}


