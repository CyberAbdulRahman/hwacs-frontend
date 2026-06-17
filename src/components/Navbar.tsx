// import { Link } from "react-router-dom";
// import { Button } from "./ui/button";
// import { Shield } from "lucide-react";

// interface NavbarProps {
//   currentPage?: string;
// }

// export function Navbar({ currentPage }: NavbarProps) {
//   return (
//     <nav className="border-b-2 border-primary/20 bg-white/80 backdrop-blur-sm shadow-sm">
//       <div className="container mx-auto px-4 py-4 flex items-center justify-between">
//         <Link to="/" className="flex items-center gap-2">
//           <Shield className="w-8 h-8 text-primary" />
//           <span className="text-xl font-semibold text-foreground">HWACS</span>
//         </Link>
        
//         <div className="flex items-center gap-6">
//           <Link 
//             to="/" 
//             className={`transition-colors ${
//               currentPage === 'home' 
//                 ? 'text-primary' 
//                 : 'text-foreground hover:text-primary'
//             }`}
//           >
//             Home
//           </Link>
//           <Link to="/login">
//             <Button variant="outline">Login</Button>
//           </Link>
//           <Link to="/signup">
//             <Button>Sign Up</Button>
//           </Link>
//           <Link to="/admin-signup">
//          <Button>Admin Sign Up</Button>
//           </Link>
//           <Link to="/admin-login">
//             <Button variant="outline" className="border-cyan-600 text-cyan-700 hover:bg-cyan-50 hover:text-cyan-800">
//               Admin
//             </Button>
//           </Link>
//         </div>
//       </div>
//     </nav>
//   );
// }

import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "../utils/api";
interface NavbarProps {
  currentPage?: string;
}

// ✅ same logic as App.tsx (auth storage)
function getAuth(): any | null {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function Navbar({ currentPage }: NavbarProps) {
  const navigate = useNavigate();

  const auth = useMemo(() => getAuth(), []);
  const role: "admin" | "user" | null = auth?.user?.role ?? null;

  // ✅ token or apiKey (use whatever you have)
  const token: string | null = auth?.token ?? null;
  const apiKey: string | null = auth?.user?.apiKey ?? localStorage.getItem("apiKey");

  const isLoggedIn = !!role;

  // ✅ role based routes
  const dashboardPath = role === "admin" ? "/admin-dashboard" : "/user-dashboard";
  const notificationsPath = role === "admin" ? "/admin-notifications" : "/user-notifications";
  const profilePath = role === "admin" ? "/admin-profile" : "/profile";

  const [unreadCount, setUnreadCount] = useState<number>(0);

  // ✅ polling unread notifications count
  useEffect(() => {
    if (!isLoggedIn) return;

    let timer: any;

    const fetchUnreadCount = async () => {
      try {
        // ---- OPTION A: JWT token ----
        // const res = await fetch("http://127.0.0.1:5000/api/notifications/unread-count", {
        //   headers: { Authorization: `Bearer ${token}` },
        // });

        // ---- OPTION B: API KEY ----
const res = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {      
      headers: {
            "Content-Type": "application/json",
            ...(apiKey ? { "X-API-KEY": apiKey } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) return;

        const data = await res.json();
        const count = Number(data?.unread ?? data?.count ?? 0);

        // 🔔 optional: popup when new notification arrives
        setUnreadCount((prev) => {
          if (count > prev && prev !== 0) {
            toast("⚠️ New attack detected", {
              description: "Open Notifications to view details.",
              action: {
                label: "View",
                onClick: () => navigate(notificationsPath),
              },
            });
          }
          return count;
        });
      } catch (e) {
        // ignore network errors silently
      }
    };

    fetchUnreadCount();
    timer = setInterval(fetchUnreadCount, 5000);

    return () => clearInterval(timer);
  }, [isLoggedIn, apiKey, token, navigate, notificationsPath]);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("apiKey");
    toast("Logged out");
    navigate("/");
    window.location.reload(); // simple refresh to reset UI
  };

  return (
    <nav className="border-b-2 border-primary/20 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          <span className="text-xl font-semibold text-foreground">HWACS</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/"
            className={`transition-colors ${
              currentPage === "home" ? "text-primary" : "text-foreground hover:text-primary"
            }`}
          >
            Home
          </Link>

          {/* ✅ If NOT logged in */}
          {!isLoggedIn && (
            <>
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
              <Link to="/admin-signup">
                <Button>Admin Sign Up</Button>
              </Link>
              <Link to="/admin-login">
                <Button
                  variant="outline"
                  className="border-cyan-600 text-cyan-700 hover:bg-cyan-50 hover:text-cyan-800"
                >
                  Admin
                </Button>
              </Link>
            </>
          )}

          {/* ✅ If logged in */}
          {isLoggedIn && (
            <>
              <Link to={dashboardPath}>
                <Button variant="outline">Dashboard</Button>
              </Link>

              {/* Notifications Bell */}
              <button
                onClick={() => navigate(notificationsPath)}
                className="relative inline-flex items-center justify-center rounded-md border border-primary/20 bg-white px-3 py-2 text-sm font-medium hover:bg-primary/5"
                title="Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[22px] rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white text-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              <Link to={profilePath}>
                <Button variant="outline">Profile</Button>
              </Link>

              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

