import { useAuth } from "../contexts/AuthContext";
import { useHeader } from "../contexts/HeaderContext";
import { useSidebar } from "../contexts/SidebarContext";
import { useTheme } from "../contexts/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import myLogo from "../assets/logo.png";
import AthleteService from "../services/AthleteService";
import CoachService from "../services/CoachService";

const AppHeader = () => {
  const { isOpen, toggleIsUserMenu } = useHeader();
  const { toggleSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [userSport, setUserSport] = useState<string>("");

  // FIX: Track image error state in React — never touch the DOM directly.
  // The previous onError handler called parent.innerHTML = "..." which
  // removed the <img> node from the DOM while React still held a fiber
  // reference to it. When React later tried removeChild on that fiber it
  // threw "NotFoundError: node is not a child of this node" and the entire
  // tree crashed (white screen).
  const [headerImgError, setHeaderImgError] = useState(false);
  const [dropdownImgError, setDropdownImgError] = useState(false);

  // Reset image error flags whenever the profile picture URL changes
  // (e.g. after a successful upload) so the new image is tried again.
  useEffect(() => {
    setHeaderImgError(false);
    setDropdownImgError(false);
  }, [user?.profile_picture_url]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getUserFullName = () => {
    if (!user) return "Guest";
    let fullName = `${user.first_name} ${user.last_name}`;
    if (user.suffix_name) fullName += ` ${user.suffix_name}`;
    return fullName;
  };

  const getInitials = () => {
    if (!user) return "G";
    return `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();
  };

  useEffect(() => {
    const fetchUserSport = async () => {
      if (!user) return;
      try {
        if (user.role === "Athlete") {
          const res = await AthleteService.loadAthletes();
          if (res.status === 200) {
            const currentAthlete = res.data.athletes.find(
              (a: any) => a.user_id === user.user_id
            );
            if (currentAthlete) setUserSport(currentAthlete.sport);
          }
        } else if (user.role === "Coach") {
          const res = await CoachService.loadCoaches();
          if (res.status === 200) {
            const currentCoach = res.data.coaches.find(
              (c: any) => c.user_id === user.user_id
            );
            if (currentCoach) setUserSport(currentCoach.sports_coached);
          }
        }
      } catch (error) {
        console.error("Error fetching user sport:", error);
      }
    };
    fetchUserSport();
  }, [user]);

  const getRoleDisplay = () => {
    if (!user) return "";
    if (user.role === "Admin") return "Admin";
    if (userSport) return `${user.role} - ${userSport}`;
    return user.role;
  };

  // Whether to show the actual image in the header button avatar
  const showHeaderImg = !!user?.profile_picture_url && !headerImgError;
  // Whether to show the actual image in the dropdown header
  const showDropdownImg = !!user?.profile_picture_url && !dropdownImgError;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={toggleIsUserMenu} />
      )}

      <nav className="fixed top-0 z-50 w-full bg-white/80 dark:bg-[#0f1117]/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 shadow-md dark:shadow-black/30 transition-colors duration-300">
        <div className="px-4 py-2.5 lg:px-5">
          <div className="flex items-center justify-between">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Toggle */}
              <button
                type="button"
                onClick={toggleSidebar}
                className="inline-flex items-center p-2 text-gray-600 dark:text-gray-400 rounded-lg sm:hidden hover:bg-gradient-to-r hover:from-[#396B99] hover:to-[#2d5577] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#396B99]/20 transition-all duration-200"
              >
                <span className="sr-only">Open sidebar</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    clipRule="evenodd"
                    fillRule="evenodd"
                    d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                  />
                </svg>
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center group">
                <img
                  src={myLogo}
                  className="h-9 transition-all duration-300 group-hover:scale-105 drop-shadow-md"
                  alt="FAMS Logo"
                />
              </Link>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? (
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleIsUserMenu}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200 group border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                >
                  {/* FIX: conditional rendering via React state — no DOM mutation */}
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-br from-[#396B99] to-[#2d5577] flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 flex-shrink-0">
                    {showHeaderImg ? (
                      <img
                        src={user!.profile_picture_url!}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={() => setHeaderImgError(true)}
                      />
                    ) : (
                      <span className="text-sm font-bold text-white">
                        {getInitials()}
                      </span>
                    )}
                  </div>

                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">
                      {getUserFullName()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {getRoleDisplay()}
                    </p>
                  </div>

                  <svg
                    className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1a1f2e] rounded-xl shadow-2xl dark:shadow-black/50 border border-gray-100 dark:border-white/5 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Dropdown header */}
                    <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
                      {/* FIX: same pattern — React state, no innerHTML */}
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-[#396B99] to-[#2d5577] flex items-center justify-center flex-shrink-0">
                        {showDropdownImg ? (
                          <img
                            src={user!.profile_picture_url!}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onError={() => setDropdownImgError(true)}
                          />
                        ) : (
                          <span className="text-sm font-bold text-white">
                            {getInitials()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                          {getUserFullName()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {getRoleDisplay()}
                        </p>
                      </div>
                    </div>

                    <div className="py-2">
                      <Link
                        to="/account-settings"
                        onClick={toggleIsUserMenu}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Account Settings
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 dark:border-white/5 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default AppHeader;