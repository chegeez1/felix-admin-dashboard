import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, ShoppingCart, List, Users, LogOut, Database,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",  href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders",     href: "/orders",    icon: ShoppingCart },
  { label: "Plans",      href: "/plans",     icon: List },
  { label: "Customers",  href: "/customers", icon: Users },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setLocation("/");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "hsl(237,32%,7%)" }}>
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className="flex flex-col shrink-0 w-52"
        style={{ background: "hsl(237,35%,6%)", borderRight: "1px solid hsl(237,22%,13%)" }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 py-5" style={{ borderBottom: "1px solid hsl(237,22%,13%)" }}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg text-white text-xs font-bold"
            style={{ background: "hsl(152,80%,35%)" }}>
            FD
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">Felix Data</p>
            <p className="text-[10px] mt-0.5" style={{ color: "hsl(220,15%,50%)" }}>Admin Panel</p>
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5 px-4 py-3.5" style={{ borderBottom: "1px solid hsl(237,22%,13%)" }}>
          <div className="flex items-center justify-center w-7 h-7 rounded-full text-white text-[11px] font-semibold"
            style={{ background: "hsl(237,22%,22%)" }}>
            <Database className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white leading-none">Felix</p>
            <p className="text-[10px] mt-0.5" style={{ color: "hsl(152,80%,45%)" }}>Super Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = location === href || location.startsWith(href + "/");
            return (
              <Link key={href} href={href}>
                <div
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium transition-all"
                  style={active
                    ? { background: "hsl(152,80%,35%)", color: "#fff" }
                    : { color: "hsl(220,15%,55%)" }
                  }
                  onMouseEnter={e => {
                    if (!active) (e.currentTarget as HTMLDivElement).style.color = "#fff";
                  }}
                  onMouseLeave={e => {
                    if (!active) (e.currentTarget as HTMLDivElement).style.color = "hsl(220,15%,55%)";
                  }}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-2 pb-4" style={{ borderTop: "1px solid hsl(237,22%,13%)" }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-all mt-3"
            style={{ color: "hsl(220,15%,45%)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "hsl(220,15%,45%)"; }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
