import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import AthleteProfileService from "../../services/AthleteProfileService";
import type { AthleteColumns } from "../../interfaces/AthleteInterface";
import type { AthleteDocumentColumns } from "../../interfaces/AthleteDocumentInterface";
import type { PracticeScheduleColumns } from "../../interfaces/PracticeScheduleInterface";
import type { RecordColumns } from "../../interfaces/RecordInterface";

const AthleteDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [athleteProfile, setAthleteProfile] = useState<AthleteColumns | null>(null);
  const [medicalDocuments, setMedicalDocuments] = useState<AthleteDocumentColumns[]>([]);
  const [practiceSchedules, setPracticeSchedules] = useState<PracticeScheduleColumns[]>([]);
  const [records, setRecords] = useState<RecordColumns[]>([]);

  const isPastDate = (dateString: string) => {
    const scheduleDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return scheduleDate < today;
  };

  const getUpcomingSchedules = () =>
    practiceSchedules.filter(
      (schedule: PracticeScheduleColumns) =>
        schedule.status !== "Completed" && !isPastDate(schedule.practice_date),
    );

  const loadAthleteData = async () => {
  try {
    setLoading(true);
    const res = await AthleteProfileService.getAllDashboardData();

    if (res.status === 200) {
      const data = res.data;

      if (data.athlete) {
        setAthleteProfile(data.athlete);
      }

      if (data.practice_schedules) {
        setPracticeSchedules(data.practice_schedules);
      }

      if (data.records) {
        setRecords(data.records);
      }

      if (data.documents) {
        setMedicalDocuments(data.documents);
      }
    }
  } catch (error) {
    console.error("Error loading athlete data:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadAthleteData();
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (time: string) => (!time ? "" : time.substring(0, 5));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return {
          background: isDark ? "rgba(74,222,128,0.15)" : "#dcfce7",
          color: isDark ? "#4ade80" : "#15803d",
        };
      case "Rejected":
        return {
          background: isDark ? "rgba(248,113,113,0.15)" : "#fee2e2",
          color: isDark ? "#f87171" : "#b91c1c",
        };
      case "Pending Review":
      default:
        return {
          background: isDark ? "rgba(250,204,21,0.15)" : "#fef9c3",
          color: isDark ? "#facc15" : "#854d0e",
        };
    }
  };

  const getScheduleStatusColor = (status: string): React.CSSProperties => {
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
    inputBg: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
    inputBorder: isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0",
    tabBg: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
    tabText: isDark ? "rgba(160,180,210,0.7)" : "#64748b",
    subBg: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
    subBorder: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
    pillBg: isDark ? "rgba(255,255,255,0.1)" : "#f1f5f9",
    pillText: isDark ? "#c8d8ea" : "#475569",
    divider: isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9",
    resultBg: isDark ? "rgba(255,255,255,0.05)" : "#f8fafc",
    resultBorder: isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0",
    activeBg: isDark ? "rgba(15,118,110,0.12)" : "#f0fdfa",
    inactiveBg: isDark ? "rgba(71,85,105,0.12)" : "#f8fafc",
    barBg: isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9",
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
            Loading your profile...
          </p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!athleteProfile) {
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
            padding: "3rem",
            textAlign: "center",
          }}
        >
          {goldBarEl}
          <div style={{ padding: "2rem" }}>
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
            <p style={{ color: t.subtext, fontSize: "0.95rem", lineHeight: 1.6 }}>
              Your athlete profile hasn't been created yet. Please contact your
              coach or administrator.
            </p>
          </div>
          {goldBarEl}
        </div>
      </div>
    );
  }

  const upcomingSchedules = getUpcomingSchedules();

  return (
    <>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        .dash-fadein    { animation: fadeUp 0.45s ease both; }
        .action-card    { transition: all 0.25s ease; cursor: pointer; }
        .action-card:hover { transform: translateY(-4px); }
        .stat-card      { transition: all 0.3s ease; }
        .stat-card:hover { transform: translateY(-6px); }
        .row-hover:hover { transform: translateX(-3px); }
        .row-hover       { transition: all 0.2s ease; }
        .rec-card:hover  { box-shadow: 0 8px 24px rgba(217,119,6,0.15); }
        .rec-card        { transition: all 0.2s ease; }
        .vbtn:hover { opacity:0.85; transform:scale(1.03); }
        .vbtn { transition: all 0.18s ease; }
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
          <svg
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
          >
            <line x1="-10%" y1="10%" x2="60%" y2="110%" stroke={fieldSvgColor} strokeWidth="80" />
            <line x1="10%" y1="-5%" x2="80%" y2="95%" stroke={fieldSvgColor} strokeWidth="55" />
            <line x1="30%" y1="-15%" x2="110%" y2="85%" stroke={fieldSvgColor} strokeWidth="100" />
            <line x1="-30%" y1="30%" x2="50%" y2="130%" stroke={fieldSvgColor} strokeWidth="60" />
            <line x1="50%" y1="-20%" x2="130%" y2="80%" stroke={fieldSvgColor} strokeWidth="40" />
          </svg>
          <svg
            style={{ position: "absolute", left: "-8%", top: "10%", width: "40%", height: "65%", opacity: isDark ? 0.45 : 1 }}
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="200" cy="200" r="190" fill="none" stroke={fieldSvgColor} strokeWidth="2.5" />
            <circle cx="200" cy="200" r="140" fill="none" stroke={fieldSvgColor} strokeWidth="1.5" />
            <circle cx="200" cy="200" r="80" fill="none" stroke={isDark ? "rgba(99,179,237,0.1)" : "rgba(57,107,153,0.08)"} strokeWidth="2" />
            <line x1="200" y1="10" x2="200" y2="390" stroke={fieldSvgColor} strokeWidth="1.5" />
            <line x1="10" y1="200" x2="390" y2="200" stroke={fieldSvgColor} strokeWidth="1.5" />
            <rect x="130" y="10" width="140" height="60" fill="none" stroke={fieldSvgColor} strokeWidth="1.5" />
            <rect x="130" y="330" width="140" height="60" fill="none" stroke={fieldSvgColor} strokeWidth="1.5" />
          </svg>
          <svg
            style={{ position: "absolute", right: "-6%", top: "-6%", width: "35%", height: "35%", opacity: isDark ? 0.35 : 1 }}
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="95" fill="none" stroke={fieldBallColor} strokeWidth="3" />
            <path d="M5,100 Q50,60 100,100 Q150,140 195,100" fill="none" stroke={fieldBallColor} strokeWidth="2.5" />
            <path d="M5,100 Q50,140 100,100 Q150,60 195,100" fill="none" stroke={fieldBallColor} strokeWidth="2.5" />
            <path d="M100,5 Q60,50 100,100 Q140,150 100,195" fill="none" stroke={fieldBallColor} strokeWidth="2.5" />
            <path d="M100,5 Q140,50 100,100 Q60,150 100,195" fill="none" stroke={fieldBallColor} strokeWidth="2.5" />
          </svg>
          <svg
            style={{ position: "absolute", right: "-8%", bottom: "-8%", width: "42%", height: "48%", opacity: isDark ? 0.3 : 1 }}
            viewBox="0 0 300 220"
            xmlns="http://www.w3.org/2000/svg"
          >
            <ellipse cx="150" cy="110" rx="145" ry="105" fill="none" stroke={fieldBallColor} strokeWidth="2.5" />
            <ellipse cx="150" cy="110" rx="115" ry="78" fill="none" stroke={fieldBallColor} strokeWidth="1.8" />
            <ellipse cx="150" cy="110" rx="85" ry="52" fill="none" stroke={isDark ? "rgba(99,179,237,0.1)" : "rgba(57,107,153,0.07)"} strokeWidth="1.5" />
            <ellipse cx="150" cy="110" rx="55" ry="28" fill="none" stroke={fieldBallColor} strokeWidth="1.2" />
            <line x1="5" y1="110" x2="295" y2="110" stroke={fieldBallColor} strokeWidth="1" strokeDasharray="8,6" />
          </svg>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="ddots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill={isDark ? "rgba(99,179,237,0.06)" : "rgba(57,107,153,0.07)"} />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ddots)" />
          </svg>
          {isDark && (
            <>
              <div style={{ position: "absolute", width: 500, height: 500, top: -150, right: -150, background: "radial-gradient(circle,rgba(30,60,120,0.4) 0%,transparent 70%)", filter: "blur(60px)", borderRadius: "50%" }} />
              <div style={{ position: "absolute", width: 400, height: 400, bottom: -100, left: -100, background: "radial-gradient(circle,rgba(20,50,100,0.35) 0%,transparent 70%)", filter: "blur(60px)", borderRadius: "50%" }} />
            </>
          )}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${isDark ? "rgba(99,179,237,0.5)" : "rgba(57,107,153,0.4)"},${isDark ? "rgba(99,179,237,0.7)" : "rgba(99,179,237,0.5)"},${isDark ? "rgba(99,179,237,0.5)" : "rgba(57,107,153,0.4)"},transparent)` }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${isDark ? "rgba(99,179,237,0.4)" : "rgba(57,107,153,0.3)"},${isDark ? "rgba(99,179,237,0.6)" : "rgba(99,179,237,0.4)"},${isDark ? "rgba(99,179,237,0.4)" : "rgba(57,107,153,0.3)"},transparent)` }} />
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
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.12 }}
            viewBox="0 0 1200 120"
            preserveAspectRatio="xMidYMid slice"
          >
            <line x1="0" y1="60" x2="1200" y2="60" stroke="white" strokeWidth="1" />
            <circle cx="600" cy="60" r="45" fill="none" stroke="white" strokeWidth="1.2" />
            <circle cx="600" cy="60" r="6" fill="white" opacity="0.5" />
            <rect x="0" y="0" width="200" height="120" fill="none" stroke="white" strokeWidth="1" />
            <rect x="1000" y="0" width="200" height="120" fill="none" stroke="white" strokeWidth="1" />
            <line x1="-10%" y1="0" x2="40%" y2="130%" stroke="white" strokeWidth="25" />
            <line x1="60%" y1="-20%" x2="110%" y2="110%" stroke="white" strokeWidth="20" />
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
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
                  {[0, 1].map((i) => (
                    <svg key={i} width="14" height="14" fill="#fbbf24" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.25em", textTransform: "uppercase" }}>
                    Filamer Christian University
                  </span>
                </div>
                <h1 style={{ fontSize: "2.2rem", fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.01em", lineHeight: 1.1 }}>
                  Welcome back, {user?.first_name}!
                </h1>
                <p style={{ color: "rgba(163,210,255,0.85)", fontSize: "0.9rem", marginTop: "0.4rem", fontWeight: 500 }}>
                  Here's your athletic profile and upcoming activities
                </p>
              </div>
              <div style={{ display: "flex", gap: 5, alignItems: "flex-end", opacity: 0.35 }}>
                {[28, 42, 22, 36, 18, 32, 26].map((h, i) => (
                  <div key={i} style={{ width: 4, height: h, background: "#63b3ed", borderRadius: 2 }} />
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
                label: "Practice Sessions",
                sub: "View training schedule",
                fn: () => navigate("/athlete/practice-sessions"),
                grad: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                hover: isDark ? "rgba(37,99,235,0.18)" : "rgba(37,99,235,0.10)",
                icon: (
                  <svg width="26" height="26" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                label: "My Events",
                sub: "View competitions",
                fn: () => navigate("/athlete/events"),
                grad: "linear-gradient(135deg,#059669,#047857)",
                hover: isDark ? "rgba(5,150,105,0.18)" : "rgba(5,150,105,0.10)",
                icon: (
                  <svg width="26" height="26" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                ),
              },
              {
                label: "My Documents",
                sub: "Upload files",
                fn: () => navigate("/athlete/documents"),
                grad: "linear-gradient(135deg,#d97706,#b45309)",
                hover: isDark ? "rgba(217,119,6,0.18)" : "rgba(217,119,6,0.10)",
                icon: (
                  <svg width="26" height="26" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                label: "Upload Grades",
                sub: "Submit academic records",
                fn: () => navigate("/athlete/academic-records"),
                grad: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                hover: isDark ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.10)",
                icon: (
                  <svg width="26" height="26" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
                <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: a.hover, borderBottomLeftRadius: "100%" }} />
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: t.goldBar }} />
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
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: t.heading, marginBottom: "0.25rem" }}>{a.label}</div>
                <div style={{ fontSize: "0.8rem", color: t.subtext }}>{a.sub}</div>
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
                label: "TOTAL RECORDS",
                value: records.length,
                grad: "linear-gradient(135deg,#1d4ed8,#2563eb,#3b82f6)",
                shadow: "rgba(37,99,235,0.45)",
                icon: (
                  <svg width="36" height="36" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                ),
                footer: [{ text: "Performance achievements" }],
              },
              {
                label: "UPCOMING PRACTICES",
                value: upcomingSchedules.length,
                grad: "linear-gradient(135deg,#0f766e,#0d9488,#14b8a6)",
                shadow: "rgba(13,148,136,0.45)",
                icon: (
                  <svg width="36" height="36" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                footer: [{ text: "Training sessions ahead" }],
              },
              {
                label: "ATTENDANCE RATE",
                value: `${Number(athleteProfile.attendance_percentage || 0).toFixed(1)}%`,
                grad: "linear-gradient(135deg,#15803d,#16a34a,#22c55e)",
                shadow: "rgba(22,163,74,0.45)",
                icon: (
                  <svg width="36" height="36" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
                footer: [{ text: "Practice participation" }],
              },
              {
                label: "ACADEMIC STATUS",
                value: athleteProfile.academic_status,
                grad:
                  athleteProfile.academic_status === "Eligible"
                    ? "linear-gradient(135deg,#6d28d9,#7c3aed,#8b5cf6)"
                    : athleteProfile.academic_status === "Under Review"
                    ? "linear-gradient(135deg,#b45309,#d97706,#f59e0b)"
                    : "linear-gradient(135deg,#b91c1c,#dc2626,#ef4444)",
                shadow:
                  athleteProfile.academic_status === "Eligible"
                    ? "rgba(124,58,237,0.45)"
                    : athleteProfile.academic_status === "Under Review"
                    ? "rgba(217,119,6,0.45)"
                    : "rgba(220,38,38,0.45)",
                icon: (
                  <svg width="36" height="36" fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                footer: [{ text: `${athleteProfile.sport} • ${athleteProfile.position}` }],
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
                <div style={{ position: "absolute", top: -24, right: -24, width: 100, height: 100, background: "rgba(255,255,255,0.12)", borderRadius: "50%" }} />
                <div style={{ position: "absolute", bottom: -20, left: -20, width: 80, height: 80, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(118deg,transparent 60%,rgba(255,255,255,0.06) 60%,rgba(255,255,255,0.06) 62%,transparent 62%)", pointerEvents: "none" }} />
                <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", opacity: 0.8, marginBottom: "0.5rem", textTransform: "uppercase" }}>{sc.label}</div>
                    <div style={{ fontSize: typeof sc.value === "string" && sc.value.length > 5 ? "1.6rem" : "3rem", fontWeight: 900, lineHeight: 1 }}>{sc.value}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", borderRadius: 14, padding: "0.75rem", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                    {sc.icon}
                  </div>
                </div>
                <div style={{ position: "relative", paddingTop: "0.85rem", borderTop: "1px solid rgba(255,255,255,0.2)", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                  {sc.footer.map((f, j) => (
                    <span key={j} style={{ background: "rgba(255,255,255,0.2)", fontSize: "0.75rem", fontWeight: 700, padding: "0.3rem 0.7rem", borderRadius: 8 }}>{f.text}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Profile Overview + Medical Documents Summary ── */}
          <div
            className="dash-fadein"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 340px",
              gap: "1.25rem",
              marginBottom: "1.75rem",
              animationDelay: "0.12s",
            }}
          >
            {/* Profile Card */}
            <div style={{ ...cardStyle }}>
              {goldBarEl}
              <div style={{ padding: "1.75rem 2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.4rem" }}>
                  <div style={{ width: 42, height: 42, background: "linear-gradient(135deg,#1a3a5c,#396B99)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(57,107,153,0.3)" }}>
                    <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: t.heading, margin: 0 }}>Athlete Profile</h2>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#1d4ed8,#2563eb,#3b82f6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 6px 20px rgba(37,99,235,0.4)",
                      flexShrink: 0,
                      border: `3px solid ${isDark ? "rgba(99,179,237,0.25)" : "rgba(37,99,235,0.2)"}`,
                    }}
                  >
                    <span style={{ color: "white", fontWeight: 900, fontSize: "1.6rem" }}>
                      {athleteProfile.first_name.charAt(0)}{athleteProfile.last_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 900, color: t.heading, lineHeight: 1.2 }}>
                      {athleteProfile.first_name}{" "}
                      {athleteProfile.middle_name?.charAt(0) ? `${athleteProfile.middle_name.charAt(0)}. ` : ""}
                      {athleteProfile.last_name}
                      {athleteProfile.suffix_name ? ` ${athleteProfile.suffix_name}` : ""}
                    </div>
                    <div style={{ color: t.subtext, fontSize: "0.9rem", marginTop: "0.3rem", fontWeight: 600 }}>
                      {athleteProfile.sport} • {athleteProfile.position}
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "0.85rem" }}>
                  {[
                    { label: "School ID", value: athleteProfile.school_id },
                    { label: "Department", value: athleteProfile.department },
                    { label: "Age", value: `${athleteProfile.age} years` },
                    { label: "Gender", value: athleteProfile.gender.gender },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: t.subBg, border: `1.5px solid ${t.subBorder}`, borderRadius: 14, padding: "0.85rem 1rem" }}>
                      <div style={{ fontSize: "0.72rem", color: t.label, fontWeight: 700, marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
                      <div style={{ fontWeight: 800, color: t.heading, fontSize: "0.95rem" }}>{value}</div>
                    </div>
                  ))}
                  <div style={{ background: t.subBg, border: `1.5px solid ${t.subBorder}`, borderRadius: 14, padding: "0.85rem 1rem" }}>
                    <div style={{ fontSize: "0.72rem", color: t.label, fontWeight: 700, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Academic Status</div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.3rem 0.85rem",
                        borderRadius: 9,
                        fontSize: "0.8rem",
                        fontWeight: 800,
                        background:
                          athleteProfile.academic_status === "Eligible"
                            ? isDark ? "rgba(74,222,128,0.15)" : "#dcfce7"
                            : athleteProfile.academic_status === "Under Review"
                            ? isDark ? "rgba(250,204,21,0.15)" : "#fef9c3"
                            : isDark ? "rgba(248,113,113,0.15)" : "#fee2e2",
                        color:
                          athleteProfile.academic_status === "Eligible"
                            ? isDark ? "#4ade80" : "#15803d"
                            : athleteProfile.academic_status === "Under Review"
                            ? isDark ? "#facc15" : "#854d0e"
                            : isDark ? "#f87171" : "#b91c1c",
                      }}
                    >
                      {athleteProfile.academic_status}
                    </span>
                  </div>
                  <div style={{ background: t.subBg, border: `1.5px solid ${t.subBorder}`, borderRadius: 14, padding: "0.85rem 1rem" }}>
                    <div style={{ fontSize: "0.72rem", color: t.label, fontWeight: 700, marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Attendance</div>
                    <div style={{ fontWeight: 800, color: t.heading, fontSize: "0.95rem" }}>
                      {Number(athleteProfile.attendance_percentage || 0).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
              {goldBarEl}
            </div>

            {/* Medical Documents Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ ...cardStyle, flex: 1 }}>
                {goldBarEl}
                <div style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                    <div style={{ width: 42, height: 42, background: "linear-gradient(135deg,#be123c,#dc2626)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(220,38,38,0.3)" }}>
                      <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: t.heading, margin: 0 }}>Medical Documents</h2>
                  </div>

                  {medicalDocuments.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2.5rem 0", background: t.subBg, borderRadius: 14, border: `2px dashed ${t.subBorder}` }}>
                      <div style={{ width: 52, height: 52, background: t.tabBg, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.85rem" }}>
                        <svg width="24" height="24" fill="none" stroke={t.label} strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p style={{ color: t.subtext, fontWeight: 700, fontSize: "0.9rem" }}>No medical documents</p>
                      <p style={{ color: t.label, fontSize: "0.78rem", marginTop: 4 }}>Upload via Documents page</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {medicalDocuments.slice(0, 3).map((doc) => (
                        <div
                          key={doc.document_id}
                          className="rec-card"
                          style={{
                            background: isDark ? "rgba(220,38,38,0.07)" : "linear-gradient(135deg,#fff1f2,#ffe4e6)",
                            borderRadius: 12,
                            padding: "0.9rem 1rem",
                            border: `1.5px solid ${isDark ? "rgba(220,38,38,0.18)" : "rgba(220,38,38,0.15)"}`,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                            <span style={{ fontSize: "0.78rem", fontWeight: 800, color: t.heading, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>
                              {doc.document_type}
                            </span>
                            <span style={{ fontSize: "0.68rem", fontWeight: 800, padding: "0.2rem 0.6rem", borderRadius: 7, flexShrink: 0, ...getStatusColor(doc.status) }}>
                              {doc.status}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.72rem", color: t.label }}>
                            {doc.file_name} • {new Date(doc.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                      {medicalDocuments.length > 3 && (
                        <button
                          onClick={() => navigate("/athlete/documents")}
                          style={{ background: "none", border: "none", color: isDark ? "#93c5fd" : "#2563eb", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", textAlign: "center", padding: "0.25rem 0" }}
                        >
                          +{medicalDocuments.length - 3} more →
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {goldBarEl}
              </div>
            </div>
          </div>

          {/* ── Upcoming Practice Sessions ── */}
          <div className="dash-fadein" style={{ ...cardStyle, marginBottom: "1.75rem", animationDelay: "0.16s" }}>
            {goldBarEl}
            <div style={{ padding: "1.75rem 2rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.4rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                  <div style={{ width: 42, height: 42, background: "linear-gradient(135deg,#6d28d9,#7c3aed)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(124,58,237,0.3)" }}>
                    <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: t.heading, margin: 0 }}>Upcoming Practice Sessions</h2>
                </div>
                <button
                  className="vbtn"
                  onClick={() => navigate("/athlete/practice-sessions")}
                  style={{ background: "linear-gradient(135deg,#6d28d9,#7c3aed)", color: "white", border: "none", borderRadius: 9, padding: "0.5rem 1.1rem", fontWeight: 700, fontSize: "0.78rem", cursor: "pointer", boxShadow: "0 3px 10px rgba(124,58,237,0.3)" }}
                >
                  View All →
                </button>
              </div>

              {upcomingSchedules.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3.5rem 0", background: t.subBg, borderRadius: 16, border: `2px dashed ${t.subBorder}` }}>
                  <div style={{ width: 60, height: 60, background: t.tabBg, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                    <svg width="28" height="28" fill="none" stroke={t.label} strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p style={{ color: t.subtext, fontWeight: 700 }}>No upcoming practice sessions</p>
                  <p style={{ color: t.label, fontSize: "0.82rem", marginTop: 4 }}>Check back later for new schedules</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                  {upcomingSchedules.slice(0, 5).map((schedule) => (
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
                        background: isDark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.04)",
                      }}
                    >
                      <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,#6d28d9,#7c3aed)", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 3px 10px rgba(124,58,237,0.3)" }}>
                        <span style={{ color: "rgba(221,214,254,0.9)", fontSize: "0.58rem", fontWeight: 700, textTransform: "uppercase" }}>
                          {new Date(schedule.practice_date).toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span style={{ color: "white", fontSize: "1.3rem", fontWeight: 900, lineHeight: 1 }}>
                          {new Date(schedule.practice_date).getDate()}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, color: t.heading, fontSize: "0.95rem", marginBottom: "0.2rem" }}>{schedule.venue}</div>
                        <div style={{ fontSize: "0.78rem", color: t.subtext, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Coach: {schedule.coach?.first_name} {schedule.coach?.last_name}
                        </div>
                        <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.4rem" }}>
                          <span style={{ background: isDark ? "rgba(124,58,237,0.2)" : "#f5f3ff", color: isDark ? "#c4b5fd" : "#6d28d9", fontSize: "0.7rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 6 }}>
                            {schedule.sport}
                          </span>
                          <span style={{ color: t.label, fontSize: "0.7rem", fontWeight: 600 }}>
                            🕐 {formatTime(schedule.start_time)} – {formatTime(schedule.end_time)}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: "0.72rem", fontWeight: 800, padding: "0.3rem 0.75rem", borderRadius: 8, flexShrink: 0, ...getScheduleStatusColor(schedule.status) }}>
                        {schedule.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {goldBarEl}
          </div>

          {/* ── Performance Records + Medical Documents (full list) ── */}
          <div
            className="dash-fadein"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", animationDelay: "0.20s" }}
          >
            {/* Performance Records */}
            <div style={{ ...cardStyle }}>
              {goldBarEl}
              <div style={{ padding: "1.75rem 2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.4rem" }}>
                  <div style={{ width: 42, height: 42, background: "linear-gradient(135deg,#b45309,#d97706)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(217,119,6,0.3)" }}>
                    <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: t.heading, margin: 0 }}>Performance Records</h2>
                </div>

                {records.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 0", background: t.subBg, borderRadius: 16, border: `2px dashed ${t.subBorder}` }}>
                    <div style={{ width: 60, height: 60, background: t.tabBg, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                      <svg width="28" height="28" fill="none" stroke={t.label} strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <p style={{ color: t.subtext, fontWeight: 700 }}>No records yet</p>
                    <p style={{ color: t.label, fontSize: "0.82rem", marginTop: 4 }}>Keep training hard!</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", maxHeight: 460, overflowY: "auto" }}>
                    {records.slice(0, 5).map((record) => (
                      <div
                        key={record.record_id}
                        className="rec-card"
                        style={{
                          background: isDark ? "rgba(217,119,6,0.08)" : "linear-gradient(135deg,#fffbeb,#fff7ed)",
                          borderRadius: 14,
                          padding: "1rem",
                          border: `2px solid ${isDark ? "rgba(217,119,6,0.18)" : "rgba(217,119,6,0.15)"}`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                          <div>
                            <div style={{ fontWeight: 800, color: t.heading, fontSize: "0.92rem", marginBottom: "0.2rem" }}>{record.event_name}</div>
                            <div style={{ fontSize: "0.75rem", color: t.label }}>{record.venue} • {formatDate(record.event_date)}</div>
                          </div>
                          <span style={{ background: "linear-gradient(135deg,#d97706,#f59e0b)", color: "white", fontSize: "0.68rem", fontWeight: 800, padding: "0.25rem 0.65rem", borderRadius: 7, flexShrink: 0, boxShadow: "0 2px 8px rgba(217,119,6,0.3)", marginLeft: "0.75rem" }}>
                            {record.achievement}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                          <span
                            style={{
                              background: record.category === "Team" ? (isDark ? "rgba(37,99,235,0.15)" : "#dbeafe") : (isDark ? "rgba(5,150,105,0.15)" : "#dcfce7"),
                              color: record.category === "Team" ? (isDark ? "#93c5fd" : "#1d4ed8") : (isDark ? "#4ade80" : "#15803d"),
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              padding: "0.2rem 0.6rem",
                              borderRadius: 6,
                            }}
                          >
                            {record.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {goldBarEl}
            </div>

            {/* Medical Documents full list */}
            <div style={{ ...cardStyle }}>
              {goldBarEl}
              <div style={{ padding: "1.75rem 2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1.4rem" }}>
                  <div style={{ width: 42, height: 42, background: "linear-gradient(135deg,#be123c,#dc2626)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(220,38,38,0.3)" }}>
                    <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: t.heading, margin: 0 }}>Medical Documents</h2>
                </div>

                {medicalDocuments.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 0", background: t.subBg, borderRadius: 16, border: `2px dashed ${t.subBorder}` }}>
                    <div style={{ width: 60, height: 60, background: t.tabBg, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                      <svg width="28" height="28" fill="none" stroke={t.label} strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p style={{ color: t.subtext, fontWeight: 700 }}>No medical documents</p>
                    <p style={{ color: t.label, fontSize: "0.82rem", marginTop: 4 }}>Upload via Documents page</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", maxHeight: 460, overflowY: "auto" }}>
                    {medicalDocuments.slice(0, 5).map((doc) => (
                      <div
                        key={doc.document_id}
                        className="rec-card"
                        style={{
                          background: isDark ? "rgba(220,38,38,0.07)" : "linear-gradient(135deg,#fff1f2,#ffe4e6)",
                          borderRadius: 14,
                          padding: "1rem",
                          border: `2px solid ${isDark ? "rgba(220,38,38,0.18)" : "rgba(220,38,38,0.15)"}`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, color: t.heading, fontSize: "0.9rem", marginBottom: "0.2rem" }}>{doc.document_type}</div>
                            <div style={{ fontSize: "0.75rem", color: t.subtext, marginBottom: "0.2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.file_name}</div>
                            {doc.valid_until && (
                              <div style={{ fontSize: "0.72rem", color: t.label }}>
                                Valid until: {new Date(doc.valid_until).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                              </div>
                            )}
                          </div>
                          <span style={{ fontSize: "0.68rem", fontWeight: 800, padding: "0.25rem 0.65rem", borderRadius: 7, flexShrink: 0, marginLeft: "0.75rem", ...getStatusColor(doc.status) }}>
                            {doc.status}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.72rem", color: t.label }}>
                          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(doc.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </div>
                      </div>
                    ))}
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

export default AthleteDashboardPage;