import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import DashboardService from "../../services/DashboardService";
import type {
  DashboardStats,
  UpcomingEvent,
  RecentRecord,
  AthleteRetention,
  SportParticipation,
} from "../../interfaces/DashboardInterface";
import type { AthleteColumns } from "../../interfaces/AthleteInterface";
import type { CoachColumns } from "../../interfaces/CoachInterface";

const DashboardMainPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [recentRecords, setRecentRecords] = useState<RecentRecord[]>([]);
  const [athleteRetention, setAthleteRetention] = useState<AthleteRetention[]>(
    [],
  );
  const [sportParticipation, setSportParticipation] = useState<
    SportParticipation[]
  >([]);
  const [searchType, setSearchType] = useState<"athlete" | "coach">("athlete");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    (AthleteColumns | CoachColumns)[]
  >([]);
  const [searching, setSearching] = useState(false);

  const loadDashboardData = async () => {
  try {
    setLoading(true);
    const res = await DashboardService.getAllDashboardData();
    if (res.status === 200) {
      const data = res.data;
      if (data.stats)         setStats(data.stats);
      if (data.events)        setUpcomingEvents(data.events);
      if (data.records)       setRecentRecords(data.records);
      if (data.retention)     setAthleteRetention(data.retention);
      if (data.participation) setSportParticipation(data.participation);
    }
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  } finally {
    setLoading(false);
  }
};
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setSearching(true);
      const res =
        searchType === "athlete"
          ? await DashboardService.searchAthletes(searchQuery)
          : await DashboardService.searchCoaches(searchQuery);
      if (res.status === 200) setSearchResults(res.data.results);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery) handleSearch();
      else setSearchResults([]);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery, searchType]);

  const getMaxValue = (data: AthleteRetention[]) =>
    Math.max(...data.map((d) => d.total));

  const handleAddAthlete = () => navigate("/athletes");
  const handleScheduleEvent = () => navigate("/events");
  const handleAddRecord = () => navigate("/records");
  const handleViewReports = () => navigate("/reports");
  const handleViewAllEvents = () => navigate("/events");
  const handleViewAllRecords = () => navigate("/records");

  /* ── Theme-aware style tokens ── */
  const t = {
    /* Page background */
    pageBg: isDark ? "#0a0e1a" : "#f0f4f8",
    /* Card */
    card: isDark ? "rgba(18,24,38,0.97)" : "rgba(255,255,255,0.97)",
    cardBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(57,107,153,0.10)",
    cardShadow: isDark
      ? "0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)"
      : "0 4px 24px rgba(57,107,153,0.10), 0 1px 4px rgba(0,0,0,0.06)",
    /* Text */
    heading: isDark ? "#e8edf5" : "#1a2d4a",
    subtext: isDark ? "rgba(160,180,210,0.7)" : "#64748b",
    label: isDark ? "rgba(120,140,170,0.6)" : "#94a3b8",
    /* Input */
    inputBg: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
    inputBorder: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
    inputText: isDark ? "#e8edf5" : "#1e293b",
    inputPlaceholder: isDark ? "rgba(120,140,170,0.5)" : "#94a3b8",
    /* Tab pill bg */
    tabBg: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
    tabText: isDark ? "rgba(160,180,210,0.7)" : "#64748b",
    /* Section sub-bg */
    subBg: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
    subBorder: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
    /* Stat pill */
    pillBg: isDark ? "rgba(255,255,255,0.1)" : "#f1f5f9",
    pillText: isDark ? "#c8d8ea" : "#475569",
    /* Event row */
    eventRowBg: isDark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.04)",
    eventRowBorder: isDark ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.12)",
    /* Record card */
    recordBg: isDark
      ? "rgba(217,119,6,0.08)"
      : "linear-gradient(135deg,#fffbeb,#fff7ed)",
    recordBorder: isDark ? "rgba(217,119,6,0.2)" : "rgba(217,119,6,0.15)",
    /* Divider */
    divider: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
    /* Search result */
    resultBg: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
    resultBorder: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
    /* Active status bg */
    activeBg: isDark ? "rgba(15,118,110,0.12)" : "#f0fdfa",
    inactiveBg: isDark ? "rgba(71,85,105,0.12)" : "#f8fafc",
    /* Bar bg */
    barBg: isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9",
    /* Gold bar */
    goldBar:
      "linear-gradient(90deg,transparent,#1a3a5c,#396B99,#63b3ed,#396B99,#1a3a5c,transparent)",
  };

  const cardStyle: React.CSSProperties = {
    background: t.card,
    borderRadius: 20,
    boxShadow: t.cardShadow,
    border: `1.5px solid ${t.cardBorder}`,
    overflow: "hidden",
  };

  const goldBarEl = <div style={{ height: 3, background: t.goldBar }} />;

  /* ── Sport field SVG background ── */
  const fieldSvgColor = isDark
    ? "rgba(99,179,237,0.07)"
    : "rgba(57,107,153,0.06)";
  const fieldBallColor = isDark
    ? "rgba(99,179,237,0.06)"
    : "rgba(57,107,153,0.05)";

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: isDark
            ? "linear-gradient(135deg,#0a0e1a,#0f1525)"
            : "linear-gradient(135deg,#0f1f35,#1a3a5c,#396B99)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 52,
              height: 52,
              border: "3px solid rgba(99,179,237,0.25)",
              borderTopColor: "#63b3ed",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1.25rem",
            }}
          />
          <p
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: "0.82rem",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Loading Dashboard...
          </p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes fadeUp{ from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        .dash-fadein   { animation: fadeUp 0.45s ease both; }
        .action-card   { transition: all 0.25s ease; cursor: pointer; }
        .action-card:hover { transform: translateY(-4px); }
        .stat-card     { transition: all 0.3s ease; }
        .stat-card:hover { transform: translateY(-6px); }
        .s-result:hover { transform: translateY(-2px); }
        .s-result       { transition: all 0.2s ease; }
        .event-row:hover { transform: translateX(-3px); }
        .event-row       { transition: all 0.2s ease; }
        .rec-card:hover  { box-shadow: 0 8px 24px rgba(217,119,6,0.15); }
        .rec-card        { transition: all 0.2s ease; }
        .vbtn:hover { opacity:0.85; transform:scale(1.03); }
        .vbtn { transition: all 0.18s ease; }
        .tab-btn { transition: all 0.2s ease; }
        input:focus { outline: none; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: t.pageBg,
          position: "relative",
        }}
      >
        {/* ── Fixed sporty background layer ── */}
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            overflow: "hidden",
          }}
        >
          {/* Diagonal speed lines */}
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <line
              x1="-10%"
              y1="10%"
              x2="60%"
              y2="110%"
              stroke={fieldSvgColor}
              strokeWidth="80"
            />
            <line
              x1="10%"
              y1="-5%"
              x2="80%"
              y2="95%"
              stroke={fieldSvgColor}
              strokeWidth="55"
            />
            <line
              x1="30%"
              y1="-15%"
              x2="110%"
              y2="85%"
              stroke={fieldSvgColor}
              strokeWidth="100"
            />
            <line
              x1="-30%"
              y1="30%"
              x2="50%"
              y2="130%"
              stroke={fieldSvgColor}
              strokeWidth="60"
            />
            <line
              x1="50%"
              y1="-20%"
              x2="130%"
              y2="80%"
              stroke={fieldSvgColor}
              strokeWidth="40"
            />
          </svg>
          {/* Field circle */}
          <svg
            style={{
              position: "absolute",
              left: "-8%",
              top: "10%",
              width: "40%",
              height: "65%",
              opacity: isDark ? 0.45 : 1,
            }}
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="200"
              cy="200"
              r="190"
              fill="none"
              stroke={fieldSvgColor}
              strokeWidth="2.5"
            />
            <circle
              cx="200"
              cy="200"
              r="140"
              fill="none"
              stroke={fieldSvgColor}
              strokeWidth="1.5"
            />
            <circle
              cx="200"
              cy="200"
              r="80"
              fill="none"
              stroke={isDark ? "rgba(99,179,237,0.1)" : "rgba(57,107,153,0.08)"}
              strokeWidth="2"
            />
            <line
              x1="200"
              y1="10"
              x2="200"
              y2="390"
              stroke={fieldSvgColor}
              strokeWidth="1.5"
            />
            <line
              x1="10"
              y1="200"
              x2="390"
              y2="200"
              stroke={fieldSvgColor}
              strokeWidth="1.5"
            />
            <rect
              x="130"
              y="10"
              width="140"
              height="60"
              fill="none"
              stroke={fieldSvgColor}
              strokeWidth="1.5"
            />
            <rect
              x="130"
              y="330"
              width="140"
              height="60"
              fill="none"
              stroke={fieldSvgColor}
              strokeWidth="1.5"
            />
          </svg>
          {/* Basketball */}
          <svg
            style={{
              position: "absolute",
              right: "-6%",
              top: "-6%",
              width: "35%",
              height: "35%",
              opacity: isDark ? 0.35 : 1,
            }}
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="100"
              cy="100"
              r="95"
              fill="none"
              stroke={fieldBallColor}
              strokeWidth="3"
            />
            <path
              d="M5,100 Q50,60 100,100 Q150,140 195,100"
              fill="none"
              stroke={fieldBallColor}
              strokeWidth="2.5"
            />
            <path
              d="M5,100 Q50,140 100,100 Q150,60 195,100"
              fill="none"
              stroke={fieldBallColor}
              strokeWidth="2.5"
            />
            <path
              d="M100,5 Q60,50 100,100 Q140,150 100,195"
              fill="none"
              stroke={fieldBallColor}
              strokeWidth="2.5"
            />
            <path
              d="M100,5 Q140,50 100,100 Q60,150 100,195"
              fill="none"
              stroke={fieldBallColor}
              strokeWidth="2.5"
            />
          </svg>
          {/* Track oval */}
          <svg
            style={{
              position: "absolute",
              right: "-8%",
              bottom: "-8%",
              width: "42%",
              height: "48%",
              opacity: isDark ? 0.3 : 1,
            }}
            viewBox="0 0 300 220"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse
              cx="150"
              cy="110"
              rx="145"
              ry="105"
              fill="none"
              stroke={fieldBallColor}
              strokeWidth="2.5"
            />
            <ellipse
              cx="150"
              cy="110"
              rx="115"
              ry="78"
              fill="none"
              stroke={fieldBallColor}
              strokeWidth="1.8"
            />
            <ellipse
              cx="150"
              cy="110"
              rx="85"
              ry="52"
              fill="none"
              stroke={isDark ? "rgba(99,179,237,0.1)" : "rgba(57,107,153,0.07)"}
              strokeWidth="1.5"
            />
            <ellipse
              cx="150"
              cy="110"
              rx="55"
              ry="28"
              fill="none"
              stroke={fieldBallColor}
              strokeWidth="1.2"
            />
            <line
              x1="5"
              y1="110"
              x2="295"
              y2="110"
              stroke={fieldBallColor}
              strokeWidth="1"
              strokeDasharray="8,6"
            />
          </svg>
          {/* Dot grid */}
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="ddots"
                x="0"
                y="0"
                width="30"
                height="30"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="2"
                  cy="2"
                  r="1"
                  fill={
                    isDark ? "rgba(99,179,237,0.06)" : "rgba(57,107,153,0.07)"
                  }
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ddots)" />
          </svg>
          {/* Glow orbs — visible in dark mode */}
          {isDark && (
            <>
              <div
                style={{
                  position: "absolute",
                  width: 500,
                  height: 500,
                  top: -150,
                  right: -150,
                  background:
                    "radial-gradient(circle,rgba(30,60,120,0.4) 0%,transparent 70%)",
                  filter: "blur(60px)",
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: 400,
                  height: 400,
                  bottom: -100,
                  left: -100,
                  background:
                    "radial-gradient(circle,rgba(20,50,100,0.35) 0%,transparent 70%)",
                  filter: "blur(60px)",
                  borderRadius: "50%",
                }}
              />
            </>
          )}
          {/* Top/bottom accent lines */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg,transparent,${isDark ? "rgba(99,179,237,0.5)" : "rgba(57,107,153,0.4)"},${isDark ? "rgba(99,179,237,0.7)" : "rgba(99,179,237,0.5)"},${isDark ? "rgba(99,179,237,0.5)" : "rgba(57,107,153,0.4)"},transparent)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg,transparent,${isDark ? "rgba(99,179,237,0.4)" : "rgba(57,107,153,0.3)"},${isDark ? "rgba(99,179,237,0.6)" : "rgba(99,179,237,0.4)"},${isDark ? "rgba(99,179,237,0.4)" : "rgba(57,107,153,0.3)"},transparent)`,
            }}
          />
        </div>

        {/* ── HEADER BANNER ── */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            background: isDark
              ? "linear-gradient(135deg,#0a1628 0%,#0f2040 40%,#1a3a5c 100%)"
              : "linear-gradient(135deg,#0f1f35 0%,#1a3a5c 40%,#396B99 100%)",
            boxShadow: isDark
              ? "0 4px 32px rgba(0,0,0,0.6)"
              : "0 4px 24px rgba(15,31,53,0.35)",
            overflow: "hidden",
          }}
        >
          {/* Inner field markings on banner */}
          <svg
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              opacity: 0.12,
            }}
            viewBox="0 0 1200 120"
            preserveAspectRatio="xMidYMid slice"
          >
            <line
              x1="0"
              y1="60"
              x2="1200"
              y2="60"
              stroke="white"
              strokeWidth="1"
            />
            <circle
              cx="600"
              cy="60"
              r="45"
              fill="none"
              stroke="white"
              strokeWidth="1.2"
            />
            <circle cx="600" cy="60" r="6" fill="white" opacity="0.5" />
            <rect
              x="0"
              y="0"
              width="200"
              height="120"
              fill="none"
              stroke="white"
              strokeWidth="1"
            />
            <rect
              x="1000"
              y="0"
              width="200"
              height="120"
              fill="none"
              stroke="white"
              strokeWidth="1"
            />
            <line
              x1="-10%"
              y1="0"
              x2="40%"
              y2="130%"
              stroke="white"
              strokeWidth="25"
            />
            <line
              x1="60%"
              y1="-20%"
              x2="110%"
              y2="110%"
              stroke="white"
              strokeWidth="20"
            />
          </svg>
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "2rem 2rem",
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    marginBottom: "0.35rem",
                  }}
                >
                  {[0, 1].map((i) => (
                    <svg
                      key={i}
                      width="14"
                      height="14"
                      fill="#fbbf24"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.55)",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                    }}
                  >
                    Filamer Christian University
                  </span>
                </div>
                <h1
                  style={{
                    fontSize: "2.2rem",
                    fontWeight: 900,
                    color: "#fff",
                    margin: 0,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.1,
                  }}
                >
                  Dashboard Overview
                </h1>
                <p
                  style={{
                    color: "rgba(163,210,255,0.85)",
                    fontSize: "0.9rem",
                    marginTop: "0.4rem",
                    fontWeight: 500,
                  }}
                >
                  Welcome to Filamer Athlete Management System
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 5,
                  alignItems: "flex-end",
                  opacity: 0.35,
                }}
              >
                {[28, 42, 22, 36, 18, 32, 26].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: 4,
                      height: h,
                      background: "#63b3ed",
                      borderRadius: 2,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div style={{ height: 3, background: t.goldBar }} />
        </div>

        {/* ── MAIN CONTENT ── */}
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "2rem 2rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Quick Actions */}
          <div
            className="dash-fadein"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "1.25rem",
              marginBottom: "1.75rem",
            }}
          >
            {[
              {
                label: "Add Athlete",
                sub: "Register new athlete",
                fn: handleAddAthlete,
                grad: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                hover: isDark ? "rgba(37,99,235,0.18)" : "rgba(37,99,235,0.10)",
                icon: (
                  <svg
                    width="26"
                    height="26"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                ),
              },
              {
                label: "Schedule Event",
                sub: "Create new event",
                fn: handleScheduleEvent,
                grad: "linear-gradient(135deg,#059669,#047857)",
                hover: isDark ? "rgba(5,150,105,0.18)" : "rgba(5,150,105,0.10)",
                icon: (
                  <svg
                    width="26"
                    height="26"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                ),
              },
              {
                label: "Add Record",
                sub: "Log achievement",
                fn: handleAddRecord,
                grad: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                hover: isDark
                  ? "rgba(124,58,237,0.18)"
                  : "rgba(124,58,237,0.10)",
                icon: (
                  <svg
                    width="26"
                    height="26"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                ),
              },
              {
                label: "View Reports",
                sub: "Analytics & insights",
                fn: handleViewReports,
                grad: "linear-gradient(135deg,#d97706,#b45309)",
                hover: isDark ? "rgba(217,119,6,0.18)" : "rgba(217,119,6,0.10)",
                icon: (
                  <svg
                    width="26"
                    height="26"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                ),
              },
            ].map((a, i) => (
              <button
                key={i}
                className="action-card"
                onClick={a.fn}
                style={{
                  ...cardStyle,
                  padding: "1.5rem",
                  border: "none",
                  textAlign: "left",
                  position: "relative",
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 80,
                    height: 80,
                    background: a.hover,
                    borderBottomLeftRadius: "100%",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: t.goldBar,
                  }}
                />
                <div
                  style={{
                    width: 52,
                    height: 52,
                    background: a.grad,
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.22)",
                    position: "relative",
                  }}
                >
                  {a.icon}
                </div>
                <div
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 800,
                    color: t.heading,
                    marginBottom: "0.25rem",
                  }}
                >
                  {a.label}
                </div>
                <div style={{ fontSize: "0.8rem", color: t.subtext }}>
                  {a.sub}
                </div>
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div
            className="dash-fadein"
            style={{
              ...cardStyle,
              marginBottom: "1.75rem",
              animationDelay: "0.08s",
            }}
          >
            {goldBarEl}
            <div style={{ padding: "1.75rem 2rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem",
                  marginBottom: "1.4rem",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    background: "linear-gradient(135deg,#1a3a5c,#396B99)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(57,107,153,0.3)",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: t.heading,
                    margin: 0,
                  }}
                >
                  Quick Search
                </h2>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    background: t.tabBg,
                    borderRadius: 12,
                    padding: 5,
                    gap: 4,
                  }}
                >
                  {(["athlete", "coach"] as const).map((tp) => (
                    <button
                      key={tp}
                      className="tab-btn"
                      onClick={() => setSearchType(tp)}
                      style={{
                        padding: "0.6rem 1.25rem",
                        borderRadius: 9,
                        border: "none",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        background:
                          searchType === tp
                            ? "linear-gradient(135deg,#1a3a5c,#396B99)"
                            : "transparent",
                        color: searchType === tp ? "#fff" : t.tabText,
                        boxShadow:
                          searchType === tp
                            ? "0 3px 10px rgba(57,107,153,0.35)"
                            : "none",
                      }}
                    >
                      {tp === "athlete" ? "Search Athletes" : "Search Coaches"}
                    </button>
                  ))}
                </div>
                <div style={{ flex: 1, minWidth: 280, position: "relative" }}>
                  <svg
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                    width="17"
                    height="17"
                    fill="none"
                    stroke={t.label}
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${searchType === "athlete" ? "athletes" : "coaches"} by name...`}
                    style={{
                      width: "100%",
                      paddingLeft: 42,
                      paddingRight: 16,
                      paddingTop: "0.75rem",
                      paddingBottom: "0.75rem",
                      border: `2px solid ${t.inputBorder}`,
                      borderRadius: 12,
                      fontSize: "0.9rem",
                      color: t.inputText,
                      background: t.inputBg,
                      fontWeight: 500,
                      boxSizing: "border-box",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#396B99")}
                    onBlur={(e) => (e.target.style.borderColor = t.inputBorder)}
                  />
                </div>
              </div>

              {searchQuery && (
                <div
                  style={{
                    marginTop: "1.5rem",
                    paddingTop: "1.5rem",
                    borderTop: `2px solid ${t.divider}`,
                  }}
                >
                  {searching ? (
                    <div style={{ textAlign: "center", padding: "3rem 0" }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          border: "3px solid rgba(57,107,153,0.2)",
                          borderTopColor: "#396B99",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                          margin: "0 auto 1rem",
                        }}
                      />
                      <p style={{ color: t.subtext, fontWeight: 600 }}>
                        Searching...
                      </p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill,minmax(260px,1fr))",
                        gap: "1.1rem",
                      }}
                    >
                      {searchResults.map((result: any, index) => (
                        <div
                          key={index}
                          className="s-result"
                          style={{
                            background: t.resultBg,
                            borderRadius: 14,
                            padding: "1.2rem",
                            border: `2px solid ${t.resultBorder}`,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.85rem",
                              marginBottom: "1rem",
                            }}
                          >
                            <div
                              style={{
                                width: 48,
                                height: 48,
                                background:
                                  searchType === "athlete"
                                    ? "linear-gradient(135deg,#2563eb,#1d4ed8)"
                                    : "linear-gradient(135deg,#059669,#047857)",
                                borderRadius: 12,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 3px 10px rgba(0,0,0,0.18)",
                                flexShrink: 0,
                              }}
                            >
                              <span
                                style={{
                                  color: "white",
                                  fontWeight: 800,
                                  fontSize: "1rem",
                                }}
                              >
                                {result.first_name?.charAt(0)}
                                {result.last_name?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div
                                style={{
                                  fontWeight: 800,
                                  color: t.heading,
                                  fontSize: "0.95rem",
                                }}
                              >
                                {result.first_name} {result.last_name}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.72rem",
                                  color: t.label,
                                  marginTop: 2,
                                }}
                              >
                                {result.school_id || result.staff_id}
                              </div>
                            </div>
                          </div>
                          {searchType === "athlete" ? (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                              }}
                            >
                              {[
                                {
                                  label: "Sport",
                                  val: result.sport,
                                  bg: isDark
                                    ? "rgba(37,99,235,0.12)"
                                    : "#eff6ff",
                                  col: "#3b82f6",
                                },
                                {
                                  label: "Position",
                                  val: result.position,
                                  bg: isDark
                                    ? "rgba(5,150,105,0.12)"
                                    : "#f0fdf4",
                                  col: "#10b981",
                                },
                                {
                                  label: "Department",
                                  val: result.department,
                                  bg: isDark
                                    ? "rgba(124,58,237,0.12)"
                                    : "#faf5ff",
                                  col: "#8b5cf6",
                                },
                              ].map(({ label, val, bg, col }) => (
                                <div
                                  key={label}
                                  style={{
                                    background: bg,
                                    borderRadius: 8,
                                    padding: "0.4rem 0.75rem",
                                    fontSize: "0.78rem",
                                    color: t.subtext,
                                  }}
                                >
                                  <span style={{ fontWeight: 700, color: col }}>
                                    {label}:
                                  </span>{" "}
                                  {val}
                                </div>
                              ))}
                              <div
                                style={{
                                  display: "flex",
                                  gap: "0.5rem",
                                  marginTop: "0.25rem",
                                  flexWrap: "wrap",
                                }}
                              >
                                <span
                                  style={{
                                    background:
                                      result.academic_status === "Eligible"
                                        ? isDark
                                          ? "rgba(21,128,61,0.25)"
                                          : "#dcfce7"
                                        : isDark
                                          ? "rgba(185,28,28,0.25)"
                                          : "#fee2e2",
                                    color:
                                      result.academic_status === "Eligible"
                                        ? "#4ade80"
                                        : "#f87171",
                                    fontSize: "0.72rem",
                                    fontWeight: 800,
                                    padding: "0.3rem 0.75rem",
                                    borderRadius: 8,
                                  }}
                                >
                                  {result.academic_status}
                                </span>
                                <span
                                  style={{
                                    background:
                                      result.athlete_status === "active"
                                        ? isDark
                                          ? "rgba(37,99,235,0.2)"
                                          : "#dbeafe"
                                        : isDark
                                          ? "rgba(255,255,255,0.06)"
                                          : "#f1f5f9",
                                    color:
                                      result.athlete_status === "active"
                                        ? "#60a5fa"
                                        : t.subtext,
                                    fontSize: "0.72rem",
                                    fontWeight: 800,
                                    padding: "0.3rem 0.75rem",
                                    borderRadius: 8,
                                  }}
                                >
                                  {result.athlete_status === "active"
                                    ? "Active"
                                    : "Inactive"}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                              }}
                            >
                              {[
                                {
                                  label: "Position",
                                  val: result.position,
                                  bg: isDark
                                    ? "rgba(37,99,235,0.12)"
                                    : "#eff6ff",
                                  col: "#3b82f6",
                                },
                                {
                                  label: "Sports",
                                  val: result.sports_coached,
                                  bg: isDark
                                    ? "rgba(5,150,105,0.12)"
                                    : "#f0fdf4",
                                  col: "#10b981",
                                },
                                {
                                  label: "Email",
                                  val: result.contact_email,
                                  bg: isDark
                                    ? "rgba(217,119,6,0.12)"
                                    : "#fff7ed",
                                  col: "#f59e0b",
                                },
                              ].map(({ label, val, bg, col }) => (
                                <div
                                  key={label}
                                  style={{
                                    background: bg,
                                    borderRadius: 8,
                                    padding: "0.4rem 0.75rem",
                                    fontSize: "0.78rem",
                                    color: t.subtext,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  <span style={{ fontWeight: 700, color: col }}>
                                    {label}:
                                  </span>{" "}
                                  {val}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "3rem 0" }}>
                      <div
                        style={{
                          width: 64,
                          height: 64,
                          background: t.tabBg,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 1rem",
                        }}
                      >
                        <svg
                          width="30"
                          height="30"
                          fill="none"
                          stroke={t.label}
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <p
                        style={{
                          color: t.subtext,
                          fontWeight: 700,
                          fontSize: "1rem",
                        }}
                      >
                        No {searchType === "athlete" ? "athletes" : "coaches"}{" "}
                        found
                      </p>
                      <p
                        style={{
                          color: t.label,
                          fontSize: "0.82rem",
                          marginTop: 4,
                        }}
                      >
                        Try a different search term
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            {goldBarEl}
          </div>

          {/* Stat Cards */}
          <div
            className="dash-fadein"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "1.25rem",
              marginBottom: "1.75rem",
              animationDelay: "0.12s",
            }}
          >
            {[
              {
                label: "TOTAL ATHLETES",
                value: stats?.total_athletes ?? 0,
                grad: "linear-gradient(135deg,#1d4ed8,#2563eb,#3b82f6)",
                shadow: "rgba(37,99,235,0.45)",
                icon: (
                  <svg
                    width="36"
                    height="36"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                ),
                footer: [
                  { text: `✓ ${stats?.eligible_athletes ?? 0} Eligible` },
                  { text: `✕ ${stats?.ineligible_athletes ?? 0} Ineligible` },
                ],
              },
              {
                label: "ATHLETE STATUS",
                value: stats?.active_athletes ?? 0,
                grad: "linear-gradient(135deg,#0f766e,#0d9488,#14b8a6)",
                shadow: "rgba(13,148,136,0.45)",
                icon: (
                  <svg
                    width="36"
                    height="36"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                footer: [
                  { text: `● ${stats?.active_athletes ?? 0} Active` },
                  { text: `○ ${stats?.inactive_athletes ?? 0} Inactive` },
                ],
              },
              {
                label: "TOTAL COACHES",
                value: stats?.total_coaches ?? 0,
                grad: "linear-gradient(135deg,#15803d,#16a34a,#22c55e)",
                shadow: "rgba(22,163,74,0.45)",
                icon: (
                  <svg
                    width="36"
                    height="36"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                ),
                footer: [{ text: "Active coaching staff" }],
              },
              {
                label: "TOTAL EVENTS",
                value: stats?.total_events ?? 0,
                grad: "linear-gradient(135deg,#6d28d9,#7c3aed,#8b5cf6)",
                shadow: "rgba(124,58,237,0.45)",
                icon: (
                  <svg
                    width="36"
                    height="36"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                ),
                footer: [{ text: `${stats?.upcoming_events ?? 0} Upcoming` }],
              },
            ].map((sc, i) => (
              <div
                key={i}
                className="stat-card"
                style={{
                  background: sc.grad,
                  borderRadius: 20,
                  padding: "1.5rem",
                  color: "white",
                  boxShadow: `0 8px 28px ${sc.shadow}`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -24,
                    right: -24,
                    width: 100,
                    height: 100,
                    background: "rgba(255,255,255,0.12)",
                    borderRadius: "50%",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: -20,
                    left: -20,
                    width: 80,
                    height: 80,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "50%",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(118deg,transparent 60%,rgba(255,255,255,0.06) 60%,rgba(255,255,255,0.06) 62%,transparent 62%)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        letterSpacing: "0.18em",
                        opacity: 0.8,
                        marginBottom: "0.5rem",
                        textTransform: "uppercase",
                      }}
                    >
                      {sc.label}
                    </div>
                    <div
                      style={{
                        fontSize: "3rem",
                        fontWeight: 900,
                        lineHeight: 1,
                      }}
                    >
                      {sc.value}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(8px)",
                      borderRadius: 14,
                      padding: "0.75rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  >
                    {sc.icon}
                  </div>
                </div>
                <div
                  style={{
                    position: "relative",
                    paddingTop: "0.85rem",
                    borderTop: "1px solid rgba(255,255,255,0.2)",
                    display: "flex",
                    gap: "0.6rem",
                    flexWrap: "wrap",
                  }}
                >
                  {sc.footer.map((f, j) => (
                    <span
                      key={j}
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "0.3rem 0.7rem",
                        borderRadius: 8,
                      }}
                    >
                      {f.text}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Athlete Status Overview */}
          <div
            className="dash-fadein"
            style={{
              ...cardStyle,
              marginBottom: "1.75rem",
              animationDelay: "0.16s",
            }}
          >
            {goldBarEl}
            <div style={{ padding: "1.75rem 2rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.85rem",
                  marginBottom: "1.4rem",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    background: "linear-gradient(135deg,#0f766e,#0d9488)",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(13,148,136,0.3)",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: t.heading,
                    margin: 0,
                  }}
                >
                  Athlete Status Overview
                </h2>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.25rem",
                }}
              >
                {/* Active */}
                <div
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "2px solid rgba(13,148,136,0.25)",
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg,#0f766e,#0d9488)",
                      padding: "0.9rem 1.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          background: "white",
                          borderRadius: "50%",
                        }}
                      />
                      <span
                        style={{
                          color: "white",
                          fontWeight: 800,
                          fontSize: "0.95rem",
                        }}
                      >
                        Active Athletes
                      </span>
                    </div>
                    <span
                      style={{
                        background: "rgba(255,255,255,0.25)",
                        color: "white",
                        fontWeight: 800,
                        fontSize: "0.82rem",
                        padding: "0.25rem 0.75rem",
                        borderRadius: 8,
                      }}
                    >
                      {stats?.active_athletes ?? 0}
                    </span>
                  </div>
                  <div
                    style={{
                      background: t.activeBg,
                      padding: "1.1rem 1.25rem",
                    }}
                  >
                    <p
                      style={{
                        color: t.subtext,
                        fontSize: "0.82rem",
                        marginBottom: "0.85rem",
                      }}
                    >
                      Athletes currently active and participating in training.
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: t.heading,
                          fontSize: "0.85rem",
                        }}
                      >
                        Eligible
                      </span>
                      <span
                        style={{
                          background: isDark
                            ? "rgba(74,222,128,0.15)"
                            : "#dcfce7",
                          color: isDark ? "#4ade80" : "#15803d",
                          fontWeight: 800,
                          fontSize: "0.78rem",
                          padding: "0.25rem 0.7rem",
                          borderRadius: 7,
                        }}
                      >
                        {stats?.eligible_athletes ?? 0}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.85rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: t.heading,
                          fontSize: "0.85rem",
                        }}
                      >
                        Ineligible
                      </span>
                      <span
                        style={{
                          background: isDark
                            ? "rgba(248,113,113,0.15)"
                            : "#fee2e2",
                          color: isDark ? "#f87171" : "#b91c1c",
                          fontWeight: 800,
                          fontSize: "0.78rem",
                          padding: "0.25rem 0.7rem",
                          borderRadius: 7,
                        }}
                      >
                        {stats?.ineligible_athletes ?? 0}
                      </span>
                    </div>
                    <button
                      className="vbtn"
                      onClick={() => navigate("/athletes")}
                      style={{
                        background: "linear-gradient(135deg,#0f766e,#0d9488)",
                        color: "white",
                        border: "none",
                        borderRadius: 9,
                        padding: "0.5rem 1.1rem",
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        boxShadow: "0 3px 10px rgba(13,148,136,0.3)",
                      }}
                    >
                      View All →
                    </button>
                  </div>
                </div>
                {/* Inactive */}
                <div
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    border: `2px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(100,116,139,0.2)"}`,
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg,#475569,#64748b)",
                      padding: "0.9rem 1.25rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          background: "rgba(255,255,255,0.5)",
                          borderRadius: "50%",
                        }}
                      />
                      <span
                        style={{
                          color: "white",
                          fontWeight: 800,
                          fontSize: "0.95rem",
                        }}
                      >
                        Inactive Athletes
                      </span>
                    </div>
                    <span
                      style={{
                        background: "rgba(255,255,255,0.25)",
                        color: "white",
                        fontWeight: 800,
                        fontSize: "0.82rem",
                        padding: "0.25rem 0.75rem",
                        borderRadius: 8,
                      }}
                    >
                      {stats?.inactive_athletes ?? 0}
                    </span>
                  </div>
                  <div
                    style={{
                      background: t.inactiveBg,
                      padding: "1.1rem 1.25rem",
                    }}
                  >
                    <p
                      style={{
                        color: t.subtext,
                        fontSize: "0.82rem",
                        marginBottom: "0.85rem",
                      }}
                    >
                      Athletes currently inactive due to absences or manual
                      deactivation.
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.85rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: t.heading,
                          fontSize: "0.85rem",
                        }}
                      >
                        Total Inactive
                      </span>
                      <span
                        style={{
                          background: t.tabBg,
                          color: t.subtext,
                          fontWeight: 800,
                          fontSize: "0.78rem",
                          padding: "0.25rem 0.7rem",
                          borderRadius: 7,
                        }}
                      >
                        {stats?.inactive_athletes ?? 0}
                      </span>
                    </div>
                    <button
                      className="vbtn"
                      onClick={() => navigate("/athletes")}
                      style={{
                        background: "linear-gradient(135deg,#475569,#64748b)",
                        color: "white",
                        border: "none",
                        borderRadius: 9,
                        padding: "0.5rem 1.1rem",
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        boxShadow: "0 3px 10px rgba(100,116,139,0.3)",
                      }}
                    >
                      View All →
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {goldBarEl}
          </div>

          {/* Upcoming Events + Achievements */}
          <div
            className="dash-fadein"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 380px",
              gap: "1.25rem",
              marginBottom: "1.75rem",
              animationDelay: "0.20s",
            }}
          >
            {/* Upcoming Events */}
            <div style={{ ...cardStyle }}>
              {goldBarEl}
              <div style={{ padding: "1.75rem 2rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1.4rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.85rem",
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        background: "linear-gradient(135deg,#6d28d9,#7c3aed)",
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <h2
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        color: t.heading,
                        margin: 0,
                      }}
                    >
                      Upcoming Events
                    </h2>
                  </div>
                  <button
                    className="vbtn"
                    onClick={handleViewAllEvents}
                    style={{
                      background: "linear-gradient(135deg,#6d28d9,#7c3aed)",
                      color: "white",
                      border: "none",
                      borderRadius: 9,
                      padding: "0.5rem 1.1rem",
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      boxShadow: "0 3px 10px rgba(124,58,237,0.3)",
                    }}
                  >
                    View All →
                  </button>
                </div>
                {upcomingEvents.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3.5rem 0",
                      background: t.subBg,
                      borderRadius: 16,
                      border: `2px dashed ${t.subBorder}`,
                    }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        background: t.tabBg,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1rem",
                      }}
                    >
                      <svg
                        width="28"
                        height="28"
                        fill="none"
                        stroke={t.label}
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p style={{ color: t.subtext, fontWeight: 700 }}>
                      No upcoming events scheduled
                    </p>
                    <p
                      style={{
                        color: t.label,
                        fontSize: "0.82rem",
                        marginTop: 4,
                      }}
                    >
                      Schedule a new event to see it here
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.9rem",
                    }}
                  >
                    {upcomingEvents.slice(0, 5).map((event) => (
                      <div
                        key={event.event_id}
                        className="event-row"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          padding: "1rem 1.1rem",
                          borderRadius: 14,
                          border: `2px solid ${t.eventRowBorder}`,
                          background: t.eventRowBg,
                        }}
                      >
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            background:
                              "linear-gradient(135deg,#6d28d9,#7c3aed)",
                            borderRadius: 12,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 3px 10px rgba(124,58,237,0.3)",
                          }}
                        >
                          <span
                            style={{
                              color: "rgba(221,214,254,0.9)",
                              fontSize: "0.58rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          >
                            {new Date(event.event_date).toLocaleDateString(
                              "en-US",
                              { month: "short" },
                            )}
                          </span>
                          <span
                            style={{
                              color: "white",
                              fontSize: "1.3rem",
                              fontWeight: 900,
                              lineHeight: 1,
                            }}
                          >
                            {new Date(event.event_date).getDate()}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 800,
                              color: t.heading,
                              fontSize: "0.92rem",
                              marginBottom: "0.2rem",
                            }}
                          >
                            {event.event_name}
                          </div>
                          <div
                            style={{
                              fontSize: "0.78rem",
                              color: t.subtext,
                              display: "flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                          >
                            <svg
                              width="12"
                              height="12"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            {event.venue}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.4rem",
                              marginTop: "0.4rem",
                            }}
                          >
                            <span
                              style={{
                                background: isDark
                                  ? "rgba(37,99,235,0.2)"
                                  : "#eff6ff",
                                color: isDark ? "#93c5fd" : "#1d4ed8",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                padding: "0.2rem 0.6rem",
                                borderRadius: 6,
                              }}
                            >
                              {event.sport}
                            </span>
                            <span
                              style={{
                                color: t.label,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                              }}
                            >
                              🕐 {event.start_time}
                            </span>
                          </div>
                        </div>
                        <span
                          style={{
                            background:
                              "linear-gradient(135deg,#1a3a5c,#396B99)",
                            color: "white",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            padding: "0.3rem 0.75rem",
                            borderRadius: 8,
                            flexShrink: 0,
                          }}
                        >
                          {event.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {goldBarEl}
            </div>

            {/* Achievements */}
            <div style={{ ...cardStyle }}>
              {goldBarEl}
              <div style={{ padding: "1.75rem 1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1.4rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        background: "linear-gradient(135deg,#b45309,#d97706)",
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(217,119,6,0.3)",
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                    <h2
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 800,
                        color: t.heading,
                        margin: 0,
                      }}
                    >
                      Achievements
                    </h2>
                  </div>
                  <button
                    className="vbtn"
                    onClick={handleViewAllRecords}
                    style={{
                      color: "#d97706",
                      background: "none",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    View All →
                  </button>
                </div>
                {recentRecords.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3rem 0",
                      background: t.subBg,
                      borderRadius: 16,
                      border: `2px dashed ${t.subBorder}`,
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        background: t.tabBg,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 0.85rem",
                      }}
                    >
                      <svg
                        width="24"
                        height="24"
                        fill="none"
                        stroke={t.label}
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                    <p
                      style={{
                        color: t.subtext,
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      No recent records
                    </p>
                    <p
                      style={{
                        color: t.label,
                        fontSize: "0.78rem",
                        marginTop: 4,
                      }}
                    >
                      Achievements will appear here
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.85rem",
                    }}
                  >
                    {recentRecords.slice(0, 5).map((record) => (
                      <div
                        key={record.record_id}
                        className="rec-card"
                        style={{
                          background: isDark
                            ? "rgba(217,119,6,0.08)"
                            : "linear-gradient(135deg,#fffbeb,#fff7ed)",
                          borderRadius: 14,
                          padding: "1rem",
                          border: `2px solid ${isDark ? "rgba(217,119,6,0.18)" : "rgba(217,119,6,0.15)"}`,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            marginBottom: "0.6rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.65rem",
                            }}
                          >
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                background:
                                  "linear-gradient(135deg,#d97706,#f59e0b)",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 3px 10px rgba(217,119,6,0.3)",
                                flexShrink: 0,
                              }}
                            >
                              <span
                                style={{
                                  color: "white",
                                  fontWeight: 800,
                                  fontSize: "0.95rem",
                                }}
                              >
                                {record.athlete_name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div
                                style={{
                                  fontWeight: 800,
                                  color: t.heading,
                                  fontSize: "0.85rem",
                                }}
                              >
                                {record.athlete_name}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.72rem",
                                  color: t.label,
                                  marginTop: 1,
                                }}
                              >
                                {record.event_name}
                              </div>
                            </div>
                          </div>
                          <span
                            style={{
                              background:
                                "linear-gradient(135deg,#d97706,#f59e0b)",
                              color: "white",
                              fontSize: "0.68rem",
                              fontWeight: 800,
                              padding: "0.25rem 0.65rem",
                              borderRadius: 7,
                              flexShrink: 0,
                              boxShadow: "0 2px 8px rgba(217,119,6,0.3)",
                            }}
                          >
                            {record.achievement}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            fontSize: "0.72rem",
                            color: t.label,
                          }}
                        >
                          <svg
                            width="11"
                            height="11"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span style={{ fontWeight: 600 }}>
                            {record.competition_level}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {goldBarEl}
            </div>
          </div>

          {/* Retention + Participation */}
          <div
            className="dash-fadein"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.25rem",
              animationDelay: "0.24s",
            }}
          >
            {/* Athlete Retention */}
            <div style={{ ...cardStyle }}>
              {goldBarEl}
              <div style={{ padding: "1.75rem 2rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1.4rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.85rem",
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        background: "linear-gradient(135deg,#1d4ed8,#2563eb)",
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                      </svg>
                    </div>
                    <h2
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        color: t.heading,
                        margin: 0,
                      }}
                    >
                      Athlete Retention
                    </h2>
                  </div>
                  <button
                    className="vbtn"
                    onClick={() => {}}
                    style={{
                      color: "#2563eb",
                      background: "none",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    
                  </button>
                </div>
                {athleteRetention.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3rem 0",
                      background: t.subBg,
                      borderRadius: 16,
                      border: `2px dashed ${t.subBorder}`,
                    }}
                  >
                    <p style={{ color: t.subtext, fontWeight: 700 }}>
                      No data available
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.1rem",
                    }}
                  >
                    {athleteRetention.map((data, index) => {
                      const maxValue = getMaxValue(athleteRetention);
                      const pct =
                        maxValue > 0 ? (data.total / maxValue) * 100 : 0;
                      const grads = [
                        "linear-gradient(90deg,#1d4ed8,#3b82f6)",
                        "linear-gradient(90deg,#15803d,#22c55e)",
                        "linear-gradient(90deg,#6d28d9,#8b5cf6)",
                        "linear-gradient(90deg,#0f766e,#14b8a6)",
                        "linear-gradient(90deg,#b45309,#f59e0b)",
                      ];
                      return (
                        <div key={index}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 800,
                                color: t.heading,
                                fontSize: "0.9rem",
                              }}
                            >
                              {data.year}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.6rem",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.78rem",
                                  color: t.subtext,
                                  fontWeight: 600,
                                }}
                              >
                                {data.total} athletes
                              </span>
                              <span
                                style={{
                                  background: t.pillBg,
                                  fontSize: "0.72rem",
                                  fontWeight: 800,
                                  color: t.pillText,
                                  padding: "0.2rem 0.6rem",
                                  borderRadius: 6,
                                }}
                              >
                                {pct.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              position: "relative",
                              height: 44,
                              background: t.barBg,
                              borderRadius: 12,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                width: `${pct}%`,
                                background: grads[index % grads.length],
                                borderRadius: 12,
                                transition: "width 1s ease",
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  background:
                                    "linear-gradient(90deg,transparent 50%,rgba(255,255,255,0.15))",
                                }}
                              />
                            </div>
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                display: "flex",
                                alignItems: "center",
                                paddingLeft: "0.85rem",
                              }}
                            >
                              <span
                                style={{
                                  color: "white",
                                  fontWeight: 800,
                                  fontSize: "0.82rem",
                                  textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                                }}
                              >
                                {data.total} Athletes
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {goldBarEl}
            </div>

            {/* Sport Participation */}
            <div style={{ ...cardStyle }}>
              {goldBarEl}
              <div style={{ padding: "1.75rem 2rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1.4rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.85rem",
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        background: "linear-gradient(135deg,#15803d,#16a34a)",
                        borderRadius: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 4px 12px rgba(22,163,74,0.3)",
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                        />
                      </svg>
                    </div>
                    <h2
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        color: t.heading,
                        margin: 0,
                      }}
                    >
                      Sport Participation
                    </h2>
                  </div>
                  <button
                    className="vbtn"
                    onClick={() => navigate("/sports")}
                    style={{
                      color: "#16a34a",
                      background: "none",
                      border: "none",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    View All →
                  </button>
                </div>
                {sportParticipation.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3rem 0",
                      background: t.subBg,
                      borderRadius: 16,
                      border: `2px dashed ${t.subBorder}`,
                    }}
                  >
                    <p style={{ color: t.subtext, fontWeight: 700 }}>
                      No data available
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {sportParticipation.map((sport, index) => {
                      const maxCount = Math.max(
                        ...sportParticipation.map((s) => s.count),
                      );
                      const pct = (sport.count / maxCount) * 100;
                      const palette = [
                        {
                          bar: "linear-gradient(90deg,#1d4ed8,#3b82f6)",
                          icon: isDark ? "rgba(37,99,235,0.2)" : "#eff6ff",
                          ico: "#3b82f6",
                        },
                        {
                          bar: "linear-gradient(90deg,#15803d,#22c55e)",
                          icon: isDark ? "rgba(5,150,105,0.2)" : "#f0fdf4",
                          ico: "#10b981",
                        },
                        {
                          bar: "linear-gradient(90deg,#6d28d9,#8b5cf6)",
                          icon: isDark ? "rgba(124,58,237,0.2)" : "#faf5ff",
                          ico: "#8b5cf6",
                        },
                        {
                          bar: "linear-gradient(90deg,#b45309,#f59e0b)",
                          icon: isDark ? "rgba(217,119,6,0.2)" : "#fffbeb",
                          ico: "#f59e0b",
                        },
                        {
                          bar: "linear-gradient(90deg,#be123c,#f43f5e)",
                          icon: isDark ? "rgba(190,18,60,0.2)" : "#fff1f2",
                          ico: "#f43f5e",
                        },
                        {
                          bar: "linear-gradient(90deg,#0f766e,#14b8a6)",
                          icon: isDark ? "rgba(15,118,110,0.2)" : "#f0fdfa",
                          ico: "#14b8a6",
                        },
                        {
                          bar: "linear-gradient(90deg,#be185d,#ec4899)",
                          icon: isDark ? "rgba(190,24,93,0.2)" : "#fdf2f8",
                          ico: "#ec4899",
                        },
                        {
                          bar: "linear-gradient(90deg,#1e40af,#6366f1)",
                          icon: isDark ? "rgba(30,64,175,0.2)" : "#eef2ff",
                          ico: "#6366f1",
                        },
                      ];
                      const c = palette[index % palette.length];
                      return (
                        <div key={index}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.65rem",
                              }}
                            >
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  background: c.icon,
                                  borderRadius: 10,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  fill="none"
                                  stroke={c.ico}
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: t.heading,
                                  fontSize: "0.88rem",
                                }}
                              >
                                {sport.sport}
                              </span>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: t.subtext,
                                  fontWeight: 600,
                                }}
                              >
                                {sport.count} athletes
                              </span>
                              <span
                                style={{
                                  background: t.pillBg,
                                  fontSize: "0.7rem",
                                  fontWeight: 800,
                                  color: t.pillText,
                                  padding: "0.2rem 0.55rem",
                                  borderRadius: 6,
                                }}
                              >
                                {pct.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              height: 8,
                              background: t.barBg,
                              borderRadius: 8,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${pct}%`,
                                background: c.bar,
                                borderRadius: 8,
                                transition: "width 1s ease",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {goldBarEl}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardMainPage;
