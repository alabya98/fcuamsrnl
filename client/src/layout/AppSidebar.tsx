import { useSidebar } from "../contexts/SidebarContext";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AppSidebar = () => {
  const { isOpen, toggleSidebar } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();

  const getMenuItems = () => {
    if (user?.role === "Athlete") {
      return [
        {
          path: "/athlete-dashboard",
          text: "Dashboard",
          icon: (
            <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
        },
        {
          path: "/athlete/practice-sessions",
          text: "Practice Sessions",
          icon: (
            <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          ),
        },
        {
          path: "/athlete/events",
          text: "Events",
          icon: (
            <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          path: "/athlete/attendance",
          text: "Attendance",
          icon: (
            <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
        },
        {
          path: "/athlete/documents",
          text: "Documents",
          icon: (
            <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          path: "/athlete/academic-records",
          text: "Upload Grades",
          icon: (
            <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
        },
        {
          path: "/announcements",
          text: "Announcements",
          icon: (
            <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          ),
        },
      ];
    }

    if (user?.role === "Coach") {
      return [
        {
          path: "/coach-dashboard",
          text: "Dashboard",
          icon: (
            <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          ),
        },
        {
          path: "/athletes",
          text: "Athletes",
          icon: (
            <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
          ),
        },
        {
          path: "/academic-reviews",
          text: "Academic Reviews",
          icon: (
            <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          ),
        },
        {
          path: "/practice-schedules",
          text: "Practice Schedules",
          icon: (
            <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          ),
        },
        {
          path: "/events",
          text: "Events",
          icon: (
            <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          path: "/records",
          text: "Records",
          icon: (
            <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          ),
        },
        {
          path: "/announcements",
          text: "Announcements",
          icon: (
            <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          ),
        },
        {
          path: "/equipment",
          text: "Equipment",
          icon: (
            <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          ),
        },
      ];
    }

    // Admin menu
    return [
      {
        path: "/",
        text: "Dashboard",
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
      {
        path: "/users",
        text: "Users",
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      },
      {
        path: "/athletes",
        text: "Athletes",
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
        ),
      },
      {
        path: "/coaches",
        text: "Coaches",
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
      },
      {
        path: "/events",
        text: "Events",
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        path: "/announcements",
        text: "Announcements",
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        ),
      },
      {
        path: "/practice-schedules",
        text: "Practice Schedules",
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        ),
      },
      {
        path: "/records",
        text: "Records",
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        ),
      },
      {
        path: "/reports",
        text: "Reports",
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        path: "/equipment",
        text: "Equipment",
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        ),
      },
      {
        path: "/genders",
        text: "Genders",
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        ),
      },
      {
        path: "/sports",
        text: "Sports",
        icon: (
          <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
    ];
  };

  const sidebarItems = getMenuItems();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm sm:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 w-60 h-screen pt-[68px]
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          sm:translate-x-0
          bg-gradient-to-b from-[#2d5577] via-[#396B99] to-[#2d5577]
          dark:bg-none dark:bg-[#0d1117]
          border-r border-white/10 dark:border-white/5
          shadow-[4px_0_20px_rgba(36,69,97,0.5)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.4)]
        `}
      >
        {/* Light mode: subtle inner glow. Dark mode: faint blue radial tint */}
        <div className="absolute inset-0 pointer-events-none
          bg-[radial-gradient(ellipse_90%_35%_at_50%_0%,rgba(255,255,255,0.08)_0%,transparent_70%)]
          dark:bg-[radial-gradient(ellipse_80%_30%_at_50%_0%,rgba(57,107,153,0.07)_0%,transparent_70%)]"
        />

        <div className="relative h-full px-3 pb-4 overflow-y-auto flex flex-col">

          {/* NAVIGATION MENU Header Badge */}
          <div className="mb-3 pt-2">
            <div className="rounded-xl px-3.5 py-3 relative overflow-hidden
              bg-white/8 border border-white/15
              dark:bg-white/[0.04] dark:border-white/[0.08]"
            >
              <div className="relative z-10">
                {/* Label row */}
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-5 h-[2px] rounded-full bg-white/50 dark:bg-[#396B99]/80" />
                  <p className="text-[9.5px] font-bold uppercase tracking-widest text-white/70 dark:text-white/40">
                    Navigation Menu
                  </p>
                </div>

                {/* Role badge */}
                {user?.role && (
                  <div className="rounded-lg px-2.5 py-2
                    bg-white/10 border border-white/15
                    dark:bg-[#396B99]/15 dark:border-[#396B99]/25"
                  >
                    <p className="text-[9px] mb-0.5 uppercase tracking-wider text-white/55 dark:text-white/35">
                      Current Role
                    </p>
                    <p className="text-[11.5px] font-bold flex items-center gap-1.5 text-white/95 dark:text-white/90">
                      <svg
                        className="w-3.5 h-3.5 text-white/75 dark:text-[#396B99]/90"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {user.role}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-0.5 flex-1">
            {sidebarItems.map((item, index) => {
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200 group relative overflow-hidden
                    ${isActive
                      ? "bg-white/18 border border-white/25 shadow-[0_2px_10px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] dark:bg-[#396B99]/25 dark:border-[#396B99]/40 dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                      : "bg-transparent border border-transparent hover:bg-white/8 hover:border-white/12 dark:hover:bg-white/[0.04] dark:hover:border-white/[0.07]"
                    }
                  `}
                >
                  {/* Active left accent bar */}
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-white/90 dark:bg-[#396B99]" />
                  )}

                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 relative z-10 p-1.5 rounded-lg transition-all duration-200
                    ${isActive
                      ? "bg-white/20 text-white dark:bg-[#396B99]/35 dark:text-[#7eb3d8]"
                      : "bg-white/8 text-white/65 dark:bg-white/[0.05] dark:text-white/45"
                    }
                  `}>
                    <div className={`transition-transform duration-200 ${isActive ? "scale-105" : "group-hover:scale-105"}`}>
                      {item.icon}
                    </div>
                  </div>

                  {/* Label */}
                  <span className={`
                    text-[13px] font-semibold relative z-10 flex-1 transition-colors duration-200
                    ${isActive
                      ? "text-white dark:text-[#a8cce0]"
                      : "text-white/72 dark:text-white/55"
                    }
                  `}>
                    {item.text}
                  </span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full relative z-10 flex-shrink-0
                      bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]
                      dark:bg-[#396B99] dark:shadow-[0_0_6px_rgba(57,107,153,0.8)]"
                    />
                  )}

                  {/* Hover arrow (inactive only) */}
                  {!isActive && (
                    <svg
                      className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-all duration-200 relative z-10 group-hover:translate-x-0.5 flex-shrink-0 text-white/80 dark:text-white/60"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="my-3 mx-1 h-px bg-white/15 dark:bg-white/[0.07]" />

          {/* ACCOUNT SETTINGS label */}
          <div className="px-3 mb-1.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/45 dark:text-white/25">
              Account Settings
            </p>
          </div>

          {/* Account Settings Link */}
          {(() => {
            const isActive = location.pathname === "/account-settings";
            return (
              <Link
                to="/account-settings"
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 group relative overflow-hidden
                  ${isActive
                    ? "bg-white/18 border border-white/25 shadow-[0_2px_10px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] dark:bg-[#396B99]/25 dark:border-[#396B99]/40 dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                    : "bg-transparent border border-transparent hover:bg-white/8 hover:border-white/12 dark:hover:bg-white/[0.04] dark:hover:border-white/[0.07]"
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-white/90 dark:bg-[#396B99]" />
                )}

                <div className={`
                  flex-shrink-0 relative z-10 p-1.5 rounded-lg transition-all duration-200
                  ${isActive
                    ? "bg-white/20 text-white dark:bg-[#396B99]/35 dark:text-[#7eb3d8]"
                    : "bg-white/8 text-white/65 dark:bg-white/[0.05] dark:text-white/45"
                  }
                `}>
                  <svg className="w-[17px] h-[17px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>

                <span className={`
                  text-[13px] font-semibold relative z-10 flex-1 transition-colors duration-200
                  ${isActive
                    ? "text-white dark:text-[#a8cce0]"
                    : "text-white/72 dark:text-white/55"
                  }
                `}>
                  Account Settings
                </span>

                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full relative z-10 flex-shrink-0
                    bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]
                    dark:bg-[#396B99] dark:shadow-[0_0_6px_rgba(57,107,153,0.8)]"
                  />
                )}

                {!isActive && (
                  <svg
                    className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-all duration-200 relative z-10 group-hover:translate-x-0.5 flex-shrink-0 text-white/80 dark:text-white/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Link>
            );
          })()}

          {/* Version */}
          <div className="mt-3 px-3 py-1.5 text-center">
            <p className="text-[10px] font-medium tracking-wider text-white/35 dark:text-white/20">
              FAMS v1.08
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;