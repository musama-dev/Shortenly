import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Wordmark } from "../Logo";
import { Sun, Moon, Home, LinkList, Chart, QrCode, Settings, Plus } from "../icons";
import { useTheme } from "../../lib/theme";
import { Button } from "../ui/Button";
import { CreateLinkModal } from "./CreateLinkModal";
import { useState } from "react";
import "./dashboard.css";

const NAV = [
  { to: "/app", label: "Overview", icon: Home, end: true },
  { to: "/app/links", label: "Links", icon: LinkList },
  { to: "/app/analytics", label: "Analytics", icon: Chart },
  { to: "/app/qr", label: "QR Codes", icon: QrCode },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

const MOBILE_NAV = NAV.filter((n) => n.label !== "QR Codes");

export function DashboardLayout() {
  const { resolved, setTheme } = useTheme();
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="dash">
      <header className="dash__topbar">
        <NavLink to="/app" className="dash__logo"><Wordmark /></NavLink>
        <div className="dash__topbar-actions">
          <button className="dash__iconbtn" onClick={() => setTheme(resolved === "dark" ? "light" : "dark")}
            aria-label="Toggle theme">
            {resolved === "dark" ? <Sun /> : <Moon />}
          </button>
          <span className="dash__avatar" aria-hidden>AK</span>
        </div>
      </header>

      <div className="dash__body">
        <aside className="dash__sidebar">
          <Button size="sm" icon={<Plus />} onClick={() => setCreateOpen(true)} style={{ width: "100%" }}>
            Create link
          </Button>
          <nav className="dash__nav" aria-label="Dashboard">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `dash__navlink ${isActive ? "dash__navlink--active" : ""}`}>
                <Icon width={15} height={15} />
                {label}
              </NavLink>
            ))}
          </nav>
          <p className="dash__sidebar-foot">Shortenly · open source</p>
        </aside>

        <main className="dash__main" id="main">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="dash__bottomnav" aria-label="Mobile navigation">
        {MOBILE_NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `dash__bottomnav-item ${isActive ? "dash__bottomnav-item--active" : ""}`}>
            <Icon width={18} height={18} />
            <span>{label}</span>
          </NavLink>
        ))}
        <button className="dash__bottomnav-item dash__bottomnav-item--create" onClick={() => setCreateOpen(true)}>
          <Plus width={18} height={18} />
          <span>Create</span>
        </button>
      </nav>

      <CreateLinkModal open={createOpen} onClose={() => setCreateOpen(false)}
        onCreated={() => { setCreateOpen(false); navigate("/app/links"); }} />
    </div>
  );
}
