import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Video,
  ClipboardList,
  Users,
  BarChart3,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
} from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { useLogout } from "../hooks/useLogout";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Meetings", href: "/meetings", icon: Video },
  { name: "Action Items", href: "/tasks", icon: ClipboardList },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export default function AppLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const logout = useLogout();

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
      {/* Mobile Overlay - Ferme la sidebar en cliquant à côté */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
              I
            </div>
            <span className="font-bold text-xl tracking-tight">IntellMeet</span>
          </div>
          <button
            className="lg:hidden text-muted-foreground"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsSidebarOpen(false)} 
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          onClick={logout}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 transition-colors shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="lg:hidden p-2 text-muted-foreground hover:bg-accent rounded-md"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            <div className="relative hidden sm:block w-full max-w-96">
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-card border border-input rounded-full py-2 px-4 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              <div className="absolute left-3 top-2.5 text-muted-foreground">
                <Search size={16} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <button className="hidden xs:flex w-10 h-10 rounded-full bg-muted hover:bg-accent items-center justify-center text-muted-foreground transition-colors">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-background overflow-hidden shadow-sm shrink-0">
              <img
                src="https://ui-avatars.com/api/?name=Sophie+M&background=0D9488&color=fff"
                alt="Profile"
              />
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-background/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
