import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";
import StreamifyLogo from "./StreamifyLogo";
import Icon from "./Icon";

const NAV_LINKS = [
  { to: "/",          label: "Home",      icon: "home"      },
  { to: "/upload",    label: "Upload",    icon: "upload"    },
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/profile",   label: "Profile",   icon: "profile"   },
];

function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    try { await API.post("/users/logout"); } catch { /* ignore */ }
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between px-6">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 no-underline">
        <StreamifyLogo size={30} />
        <span className="font-bold text-[17px] tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Streamify
        </span>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-0.5">
        {NAV_LINKS.map(({ to, label, icon }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 no-underline
                ${active
                  ? "bg-white/10 text-white"
                  : "text-[#888] hover:text-white hover:bg-white/[0.06]"
                }`}
            >
              <Icon name={icon} size={15} />
              {label}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="ml-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium
                     text-[#888] hover:text-red-400 hover:bg-red-500/10
                     transition-all duration-150 border-none cursor-pointer bg-transparent"
        >
          <Icon name="logout" size={15} />
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
