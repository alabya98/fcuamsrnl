import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import CoachProfileService from "../../services/CoachProfileService";
import type { CoachColumns } from "../../interfaces/CoachInterface";
import type { AthleteColumns } from "../../interfaces/AthleteInterface";
import type { PracticeScheduleColumns } from "../../interfaces/PracticeScheduleInterface";

interface DashboardStats {
  total_athletes: number;
  active_athletes: number;
  inactive_athletes: number;
  eligible_athletes: number;
  upcoming_practices: number;
  upcoming_events: number;
}

const CoachDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [coachProfile, setCoachProfile] = useState<CoachColumns | null>(null);
  const [athletes, setAthletes] = useState<AthleteColumns[]>([]);
  const [practiceSchedules, setPracticeSchedules] = useState<
    PracticeScheduleColumns[]
  >([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_athletes: 0,
    active_athletes: 0,
    inactive_athletes: 0,
    eligible_athletes: 0,
    upcoming_practices: 0,
    upcoming_events: 0,
  });

  const loadCoachData = async () => {
    try {
      setLoading(true);
      const [profileRes, athletesRes, practiceRes, statsRes] =
        await Promise.all([
          CoachProfileService.getMyProfile(),
          CoachProfileService.getMyAthletes(),
          CoachProfileService.getMyPracticeSchedules(),
          CoachProfileService.getDashboardStats(),
        ]);
      if (profileRes.status === 200) setCoachProfile(profileRes.data.coach);
      if (athletesRes.status === 200) setAthletes(athletesRes.data.athletes);
      if (practiceRes.status === 200)
        setPracticeSchedules(practiceRes.data.practice_schedules);
      if (statsRes.status === 200) setStats(statsRes.data.stats);
    } catch (error) {
      console.error("Error loading coach data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoachData();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (time: string) => (!time ? "" : time.substring(0, 5));

  const handleAthleteFullNameFormat = (athlete: AthleteColumns) => {
    let name = athlete.middle_name
      ? `${athlete.first_name} ${athlete.middle_name.charAt(0)}. ${athlete.last_name}`
      : `${athlete.first_name} ${athlete.last_name}`;
    if (athlete.suffix_name) name += ` ${athlete.suffix_name}`;
    return name;
  };

  const getScheduleStatusStyle = (status: string): React.CSSProperties => {
    switch (status) {
      case "Approved":
        return {
          background: isDark ? "rgba(21,128,61,0.2)" : "#dcfce7",
          color: isDark ? "#4ade80" : "#15803d",
        };
      case "Completed":
        return {
          background: isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9",
          color: isDark ? "#94a3b8" : "#475569",
        };
      case "Pending":
        return {
          background: isDark ? "rgba(234,179,8,0.2)" : "#fef9c3",
          color: isDark ? "#facc15" : "#854d0e",
        };
      case "Declined":
        return {
          background: isDark ? "rgba(185,28,28,0.2)" : "#fee2e2",
          color: isDark ? "#f87171" : "#b91c1c",
        };
      default:
        return {
          background: isDark ? "rgba(37,99,235,0.2)" : "#dbeafe",
          color: isDark ? "#93c5fd" : "#1d4ed8",
        };
    }
  };

  const getAcademicStatusStyle = (status: string): React.CSSProperties => {
    switch (status) {
      case "Eligible":
        return {
          background: isDark ? "rgba(74,222,128,0.15)" : "#dcfce7",
          color: isDark ? "#4ade80" : "#15803d",
        };
      case "Under Review":
        return {
          background: isDark ? "rgba(250,204,21,0.15)" : "#fef9c3",
          color: isDark ? "#facc15" : "#854d0e",
        };
      default:
        return {
          background: isDark ? "rgba(248,113,113,0.15)" : "#fee2e2",
          color: isDark ? "#f87171" : "#b91c1c",
        };
    }
  };

  /* ── Theme-aware style tokens ── */
  const t = {
    pageBg: isDark ? "#0a0e1a" : "#f0f4f8",
    card: isDark ? "rgba(18,24,38,0.97)" : "rgba(255,255,255,0.97)",
    cardBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(57,107,153,0.10)",
    cardShadow: isDark
      ? "0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)"
      : "0 4px 24px rgba(57,107,153,0.10), 0 1px 4px rgba(0,0,0,0.06)",
    heading: isDark ? "#e8edf5" : "#1a2d4a",
    subtext: isDark ? "rgba(160,180,210,0.7)" : "#64748b",
    label: isDark ? "rgba(120,140,170,0.6)" : "#94a3b8",
    tabBg: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
    subBg: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
    subBorder: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
    divider: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
    activeBg: isDark ? "rgba(15,118,110,0.12)" : "#f0fdfa",
    inactiveBg: isDark ? "rgba(71,85,105,0.12)" : "#f8fafc",
    tableHead: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
    tableRow: isDark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.8)",
    tableRowHover: isDark ? "rgba(57,107,153,0.08)" : "rgba(57,107,153,0.04)",
    tableCell: isDark ? "#c8d8ea" : "#1e293b",
    tableCellMuted: isDark ? "rgba(160,180,210,0.6)" : "#64748b",
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

  const fieldSvgColor = isDark
    ? "rgba(99,179,237,0.07)"
    : "rgba(57,107,153,0.06)";
  const fieldBallColor = isDark
    ? "rgba(99,179,237,0.06)"
    : "rgba(57,107,153,0.05)";

  /* ── Loading State ── */
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
            Loading dashboard...
          </p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  /* ── Profile Not Found State ── */
  if (!coachProfile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: t.pageBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            ...cardStyle,
            maxWidth: 560,
            width: "100%",
            textAlign: "center",
          }}
        >
          {goldBarEl}
          <div style={{ padding: "3rem 2rem" }}>
            <div
              style={{
                width: 80,
                height: 80,
                background: isDark ? "rgba(234,179,8,0.15)" : "#fef9c3",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <svg
                width="36"
                height="36"
                fill="none"
                stroke={isDark ? "#facc15" : "#854d0e"}
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2
              style={{
                fontSize: "1.6rem",
                fontWeight: 900,
                color: t.heading,
                marginBottom: "0.75rem",
              }}
            >
              Profile Not Found
            </h2>
            <p
              style={{ color: t.subtext, fontSize: "0.95rem", lineHeight: 1.6 }}
            >
              Your coach profile hasn't been created yet. Please contact your
              administrator.
            </p>
          </div>
          {goldBarEl}
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        .dash-fadein     { animation: fadeUp 0.45s ease both; }
        .action-card     { transition: all 0.25s ease; cursor: pointer; }
        .action-card:hover { transform: translateY(-4px); }
        .stat-card       { transition: all 0.3s ease; }
        .stat-card:hover { transform: translateY(-6px); }
        .row-hover:hover { transform: translateX(-3px); }
        .row-hover       { transition: all 0.2s ease; }
        .vbtn:hover { opacity:0.85; transform:scale(1.03); }
        .vbtn { transition: all 0.18s ease; }
        .trow:hover { background: ${t.tableRowHover} !important; }
        .trow { transition: background 0.15s ease; }
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
                  Welcome back, Coach {user?.last_name}!
                </h1>
                <p
                  style={{
                    color: "rgba(163,210,255,0.85)",
                    fontSize: "0.9rem",
                    marginTop: "0.4rem",
                    fontWeight: 500,
                  }}
                >
                  Manage your team and schedule practice sessions
                </p>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
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
                <button
                  className="vbtn"
                  onClick={() => navigate("/practice-schedules")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.65rem 1.25rem",
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                    border: "1.5px solid rgba(255,255,255,0.25)",
                    borderRadius: 12,
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Book Practice Venue
                </button>
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
          {/* ── Quick Action Cards ── */}
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
                label: "View My Athletes",
                sub: "Manage team roster",
                fn: () => navigate("/athletes"),
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ),
              },
              {
                label: "Book Venue",
                sub: "Schedule practice session",
                fn: () => navigate("/practice-schedules"),
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                ),
              },
              {
                label: "View Events",
                sub: "Check competition schedule",
                fn: () => navigate("/events"),
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                ),
              },
              {
                label: "Academic Reviews",
                sub: "Review athlete eligibility",
                fn: () => navigate("/academic-reviews"),
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
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

          {/* ── Stat Cards ── */}
          <div
            className="dash-fadein"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "1.25rem",
              marginBottom: "1.75rem",
              animationDelay: "0.08s",
            }}
          >
            {[
              {
                label: "MY ATHLETES",
                value: stats.total_athletes,
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
                  { text: `● ${stats.active_athletes} Active` },
                  { text: `○ ${stats.inactive_athletes} Inactive` },
                ],
              },
              {
                label: "PRACTICE SESSIONS",
                value: stats.upcoming_practices,
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                ),
                footer: [{ text: "Upcoming sessions" }],
              },
              {
                label: "EVENTS",
                value: stats.upcoming_events,
                grad: "linear-gradient(135deg,#b45309,#d97706,#f59e0b)",
                shadow: "rgba(217,119,6,0.45)",
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
                footer: [{ text: "Upcoming competitions" }],
              },
              {
                label: "SPORT",
                value: coachProfile.sports_coached,
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                footer: [{ text: coachProfile.position }],
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
                        fontSize:
                          typeof sc.value === "string" && sc.value.length > 6
                            ? "1.5rem"
                            : "3rem",
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

          {/* ── Athlete Status Overview ── */}
          <div
            className="dash-fadein"
            style={{
              ...cardStyle,
              marginBottom: "1.75rem",
              animationDelay: "0.12s",
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
                      {stats.active_athletes}
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
                        {stats.eligible_athletes}
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
                        Total Active
                      </span>
                      <span
                        style={{
                          background: isDark
                            ? "rgba(20,184,166,0.15)"
                            : "#ccfbf1",
                          color: isDark ? "#2dd4bf" : "#0f766e",
                          fontWeight: 800,
                          fontSize: "0.78rem",
                          padding: "0.25rem 0.7rem",
                          borderRadius: 7,
                        }}
                      >
                        {stats.active_athletes}
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
                      {stats.inactive_athletes}
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
                      Athletes currently inactive due to absences or
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
                          background: isDark
                            ? "rgba(255,255,255,0.08)"
                            : "#f1f5f9",
                          color: t.subtext,
                          fontWeight: 800,
                          fontSize: "0.78rem",
                          padding: "0.25rem 0.7rem",
                          borderRadius: 7,
                        }}
                      >
                        {stats.inactive_athletes}
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

          {/* ── Practice Schedules ── */}
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
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
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
                    My Practice Schedules
                  </h2>
                </div>
                <button
                  className="vbtn"
                  onClick={() => navigate("/practice-schedules")}
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

              {practiceSchedules.length === 0 ? (
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
                  <p
                    style={{
                      color: t.subtext,
                      fontWeight: 700,
                      marginBottom: "1rem",
                    }}
                  >
                    No practice sessions booked yet
                  </p>
                  <button
                    className="vbtn"
                    onClick={() => navigate("/practice-schedules")}
                    style={{
                      background: "linear-gradient(135deg,#6d28d9,#7c3aed)",
                      color: "white",
                      border: "none",
                      borderRadius: 10,
                      padding: "0.6rem 1.4rem",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
                    }}
                  >
                    Book Your First Practice
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.9rem",
                  }}
                >
                  {practiceSchedules
                    .slice(0, 5)
                    .map((schedule: PracticeScheduleColumns) => (
                      <div
                        key={schedule.practice_schedule_id}
                        className="row-hover"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          padding: "1rem 1.1rem",
                          borderRadius: 14,
                          border: `2px solid ${isDark ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.12)"}`,
                          background: isDark
                            ? "rgba(124,58,237,0.08)"
                            : "rgba(124,58,237,0.04)",
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
                            {new Date(
                              schedule.practice_date,
                            ).toLocaleDateString("en-US", { month: "short" })}
                          </span>
                          <span
                            style={{
                              color: "white",
                              fontSize: "1.3rem",
                              fontWeight: 900,
                              lineHeight: 1,
                            }}
                          >
                            {new Date(schedule.practice_date).getDate()}
                          </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 800,
                              color: t.heading,
                              fontSize: "0.95rem",
                              marginBottom: "0.2rem",
                            }}
                          >
                            {schedule.venue}
                          </div>
                          <div
                            style={{
                              fontSize: "0.78rem",
                              color: t.subtext,
                              marginBottom: "0.35rem",
                            }}
                          >
                            {schedule.total_players} players expected
                          </div>
                          <div style={{ display: "flex", gap: "0.4rem" }}>
                            <span
                              style={{
                                background: isDark
                                  ? "rgba(124,58,237,0.2)"
                                  : "#f5f3ff",
                                color: isDark ? "#c4b5fd" : "#6d28d9",
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                padding: "0.2rem 0.6rem",
                                borderRadius: 6,
                              }}
                            >
                              {schedule.sport}
                            </span>
                            <span
                              style={{
                                color: t.label,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                              }}
                            >
                              🕐 {formatTime(schedule.start_time)} –{" "}
                              {formatTime(schedule.end_time)}
                            </span>
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div
                            style={{
                              fontWeight: 800,
                              color: t.heading,
                              fontSize: "0.88rem",
                              marginBottom: "0.35rem",
                            }}
                          >
                            {formatDate(schedule.practice_date)}
                          </div>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              padding: "0.25rem 0.7rem",
                              borderRadius: 8,
                              ...getScheduleStatusStyle(schedule.status),
                            }}
                          >
                            {schedule.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            {goldBarEl}
          </div>

          {/* ── My Athletes Table ── */}
          <div
            className="dash-fadein"
            style={{ ...cardStyle, animationDelay: "0.20s" }}
          >
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
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
                    My Athletes ({athletes.length})
                  </h2>
                </div>
                <button
                  className="vbtn"
                  onClick={() => navigate("/athletes")}
                  style={{
                    background: "linear-gradient(135deg,#1d4ed8,#2563eb)",
                    color: "white",
                    border: "none",
                    borderRadius: 9,
                    padding: "0.5rem 1.1rem",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    boxShadow: "0 3px 10px rgba(37,99,235,0.3)",
                  }}
                >
                  View All →
                </button>
              </div>

              {athletes.length === 0 ? (
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <p style={{ color: t.subtext, fontWeight: 700 }}>
                    No athletes assigned yet
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    overflowX: "auto",
                    borderRadius: 14,
                    border: `1.5px solid ${t.subBorder}`,
                  }}
                >
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr
                        style={{
                          background: "linear-gradient(135deg,#1a3a5c,#396B99)",
                        }}
                      >
                        {[
                          "Name",
                          "Position",
                          "Academic Status",
                          "Athlete Status",
                          "Attendance",
                        ].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "0.9rem 1.25rem",
                              textAlign: "left",
                              fontSize: "0.75rem",
                              fontWeight: 800,
                              color: "rgba(255,255,255,0.9)",
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {athletes.slice(0, 5).map((athlete, idx) => (
                        <tr
                          key={athlete.athlete_id}
                          className="trow"
                          style={{
                            background: idx % 2 === 0 ? t.tableRow : t.subBg,
                            borderBottom: `1px solid ${t.subBorder}`,
                          }}
                        >
                          <td
                            style={{
                              padding: "0.9rem 1.25rem",
                              fontSize: "0.875rem",
                              fontWeight: 700,
                              color: t.tableCell,
                              whiteSpace: "nowrap",
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
                                  width: 34,
                                  height: 34,
                                  borderRadius: "50%",
                                  background:
                                    "linear-gradient(135deg,#1d4ed8,#3b82f6)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
                                }}
                              >
                                <span
                                  style={{
                                    color: "white",
                                    fontWeight: 800,
                                    fontSize: "0.72rem",
                                  }}
                                >
                                  {athlete.first_name.charAt(0)}
                                  {athlete.last_name.charAt(0)}
                                </span>
                              </div>
                              {handleAthleteFullNameFormat(athlete)}
                            </div>
                          </td>
                          <td
                            style={{
                              padding: "0.9rem 1.25rem",
                              fontSize: "0.875rem",
                              color: t.tableCellMuted,
                            }}
                          >
                            {athlete.position}
                          </td>
                          <td style={{ padding: "0.9rem 1.25rem" }}>
                            <span
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 800,
                                padding: "0.3rem 0.75rem",
                                borderRadius: 8,
                                ...getAcademicStatusStyle(
                                  athlete.academic_status,
                                ),
                              }}
                            >
                              {athlete.academic_status}
                            </span>
                          </td>
                          <td style={{ padding: "0.9rem 1.25rem" }}>
                            <span
                              style={{
                                fontSize: "0.72rem",
                                fontWeight: 800,
                                padding: "0.3rem 0.75rem",
                                borderRadius: 8,
                                background:
                                  athlete.athlete_status === "active"
                                    ? isDark
                                      ? "rgba(20,184,166,0.15)"
                                      : "#ccfbf1"
                                    : isDark
                                      ? "rgba(255,255,255,0.08)"
                                      : "#f1f5f9",
                                color:
                                  athlete.athlete_status === "active"
                                    ? isDark
                                      ? "#2dd4bf"
                                      : "#0f766e"
                                    : t.tableCellMuted,
                              }}
                            >
                              {athlete.athlete_status === "active"
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "0.9rem 1.25rem",
                              fontSize: "0.875rem",
                              fontWeight: 700,
                              color: t.tableCell,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              <div
                                style={{
                                  flex: 1,
                                  height: 6,
                                  background: t.subBorder,
                                  borderRadius: 4,
                                  overflow: "hidden",
                                  minWidth: 60,
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${Math.min(Number(athlete.attendance_percentage || 0), 100)}%`,
                                    background:
                                      Number(
                                        athlete.attendance_percentage || 0,
                                      ) >= 75
                                        ? "linear-gradient(90deg,#059669,#10b981)"
                                        : Number(
                                              athlete.attendance_percentage ||
                                                0,
                                            ) >= 50
                                          ? "linear-gradient(90deg,#d97706,#f59e0b)"
                                          : "linear-gradient(90deg,#dc2626,#ef4444)",
                                    borderRadius: 4,
                                    transition: "width 0.8s ease",
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  fontSize: "0.78rem",
                                  fontWeight: 700,
                                  color: t.tableCell,
                                  flexShrink: 0,
                                }}
                              >
                                {Number(
                                  athlete.attendance_percentage || 0,
                                ).toFixed(1)}
                                %
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {goldBarEl}
          </div>
        </div>
      </div>
    </>
  );
};

export default CoachDashboardPage;
