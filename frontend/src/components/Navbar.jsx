import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/api";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const [notifRes, chatRes] = await Promise.all([
          api.get("/notifications/unread-count"),
          api.get("/chat/unread-count"),
        ]);
        setUnreadCount(notifRes.data.count);
        setUnreadMessages(chatRes.data.count);
      } catch (error) {
        console.error(error);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const publicLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const privateLinks = [
    { name: "Find Players", path: "/find-players" },
    { name: "Communities", path: "/communities" },
    { name: "Active Users", path: "/active-users" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🏸</span>
            <span className="font-semibold text-lg text-primary">PlayNearby</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-cardText hover:text-primary transition-colors font-medium text-sm"
              >
                {link.name}
              </Link>
            ))}

            {user && (
              <>
                {privateLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-cardText hover:text-primary transition-colors font-medium text-sm"
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/notifications"
                  className="relative text-cardText hover:text-primary transition-colors font-medium text-sm"
                >
                  Notifications
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-3 bg-accent text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/messages"
                  className="relative text-cardText hover:text-primary transition-colors font-medium text-sm"
                >
                  Messages
                  {unreadMessages > 0 && (
                    <span className="absolute -top-2 -right-3 bg-accent text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
              </>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="text-cardText hover:text-primary font-medium text-sm"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-accent text-white px-4 py-2 rounded-lg hover:opacity-90 transition text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-primary font-medium hover:underline text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-cardText"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className="text-cardText hover:text-primary font-medium"
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <>
                {privateLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMenuOpen(false)}
                    className="text-cardText hover:text-primary font-medium"
                  >
                    {link.name}
                  </Link>
                ))}
                <Link to="/notifications" onClick={() => setMenuOpen(false)} className="text-cardText hover:text-primary font-medium">
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </Link>
                <Link to="/messages" onClick={() => setMenuOpen(false)} className="text-cardText hover:text-primary font-medium">
                  Messages {unreadMessages > 0 && `(${unreadMessages})`}
                </Link>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-cardText hover:text-primary font-medium">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-accent text-white px-4 py-2 rounded-lg text-left w-fit"
                >
                  Logout
                </button>
              </>
            )}
            {!user && (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
