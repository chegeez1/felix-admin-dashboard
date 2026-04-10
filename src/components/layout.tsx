import { Link, useLocation } from "wouter";
import { LayoutDashboard, ShoppingCart, List, Users, LogOut, Database } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders",    href: "/orders",    icon: ShoppingCart },
  { label: "Plans",     href: "/plans",     icon: List },
  { label: "Customers", href: "/customers", icon: Users },
];

/* Inline styles for the dark palette */
const S = {
  shell:     { background: "hsl(237,32%,7%)" } as React.CSSProperties,
  sidebar:   { background: "hsl(237,35%,6%)", borderRight: "1px solid hsl(237,22%,13%)" } as React.CSSProperties,
  divider:   { borderBottom: "1px solid hsl(237,22%,13%)" } as React.CSSProperties,
  logoChip:  { background: "hsl(152,80%,35%)" } as React.CSSProperties,
  brandSub:  { color: "hsl(220,15%,50%)" } as React.CSSProperties,
  avatarBg:  { background: "hsl(237,22%,22%)" } as React.CSSProperties,
  roleText:  { color: "hsl(152,80%,45%)" } as React.CSSProperties,
  navActive: { background: "hsl(152,80%,35%)", color: "#fff" } as React.CSSProperties,
  navIdle:   { color: "hsl(220,15%,55%)" } as React.CSSProperties,
  signOut:   { color: "hsl(220,15%,45%)", borderTop: "1px solid hsl(237,22%,13%)" } as React.CSSProperties,
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setLocation("/");
  };

  return (
    <div className="flex h-screen w-full overflow-hidden" style={S.shell}>
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="flex flex-col shrink-0 w-52" style={S.sidebar}>
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 py-5" style={S.divider}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg text-white text-xs font-bold flex-shrink-0"
            style={S.logoChip}>
            FD
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-none truncate">Felix Data</p>
            <p className="text-[10px] mt-0.5 truncate" style={S.brandSub}>Admin Panel</p>
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5 px-4 py-3.5" style={S.divider}>
          <div className="flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0" style={S.avatarBg}>
            <Database className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white leading-none">Felix</p>
            <p className="text-[10px] mt-0.5" style={S.roleText}>Super Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = location === href || location.startsWith(href + "/");
            return (
              <Link key={href} href={href}>
                <div
                  className={[
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors",
                    active ? "" : "hover:text-white hover:bg-white/5",
                  ].join(" ")}
                  style={active ? S.navActive : S.navIdle}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-2 pb-4 pt-3" style={S.signOut}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors hover:text-white hover:bg-white/5"
            style={{ color: "hsl(220,15%,45%)" }}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
