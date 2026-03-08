import { Link, useLocation } from "wouter";
import { 
  Home, 
  MessageCircle, 
  Smile, 
  CheckCircle, 
  PieChart, 
  History, 
  Settings, 
  LogOut,
  Leaf
} from "lucide-react";
import { useUser } from "@/hooks/use-user";

export function Sidebar() {
  const [location] = useLocation();
  const { data: user } = useUser();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/chat", label: "Therapist Chat", icon: MessageCircle },
    { href: "/mood", label: "Mood Tracker", icon: Smile },
    { href: "/habits", label: "Habits", icon: CheckCircle },
    { href: "/statistics", label: "Statistics", icon: PieChart },
    { href: "/history", label: "Emotional History", icon: History },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="w-64 h-screen bg-card border-r border-border/50 flex flex-col fixed left-0 top-0 shadow-lg shadow-teal-900/5 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
          <Leaf className="w-6 h-6" />
        </div>
        <span className="font-display font-bold text-xl text-foreground">TalkEasy</span>
      </div>

      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || (location.startsWith(item.href) && item.href !== '/dashboard');
          return (
            <Link key={item.href} href={item.href} className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${isActive 
                ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 font-semibold' 
                : 'text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-foreground'
              }
            `}>
              <item.icon className={`w-5 h-5 ${isActive ? 'text-teal-600 dark:text-teal-400' : ''}`} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          {user?.profileImageUrl ? (
            <img src={user.profileImageUrl} alt="Profile" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold">
              {user?.firstName?.[0] || user?.email?.[0] || 'U'}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-foreground truncate">{user?.firstName || 'User'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
