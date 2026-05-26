import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import AthleteService from "../../../services/AthleteService";
import AttendanceService from "../../../services/AttendanceService";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";
import ViewAthleteMedicalRecordsModal from "./ViewAthleteMedicalRecordsModal";
import ViewAttendanceModal from "../../Coach/Components/ViewAttendanceModal";
import ViewAthleteRecordsModal from "./ViewAthleteRecordsModal";
import DocumentUploadSection from "./DocumentUploadSection";
import AcademicRecordsSection from "./AcademicRecordsSection";

const AthleteProfilePage = () => {
  const { athleteId } = useParams<{ athleteId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [athlete, setAthlete] = useState<AthleteColumns | null>(null);
  const [showMedicalRecordsModal, setShowMedicalRecordsModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [imgError, setImgError] = useState(false);

  const loadAthleteProfile = async () => {
    try {
      setLoading(true);
      const res = await AthleteService.getAthleteById(Number(athleteId));
      if (res.status === 200) {
        setAthlete(res.data.athlete);
        setImgError(false);
      }
    } catch (error) {
      console.error("Error loading athlete profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const recalculateAttendance = async () => {
    if (!athleteId) return;
    try {
      await AttendanceService.getAthleteAttendance(Number(athleteId));
      await loadAthleteProfile();
    } catch (error) {
      console.error("Error recalculating attendance:", error);
    }
  };

  useEffect(() => {
    if (athleteId) {
      loadAthleteProfile();
      recalculateAttendance();
    }
  }, [athleteId]);

  const formatFullName = (a: AthleteColumns) => {
    let name = a.middle_name
      ? `${a.first_name} ${a.middle_name.charAt(0)}. ${a.last_name}`
      : `${a.first_name} ${a.last_name}`;
    if (a.suffix_name) name += ` ${a.suffix_name}`;
    return name;
  };

  const formatCoachName = (a: AthleteColumns) => {
    if (!a.coach) return "Not Assigned";
    const c = a.coach;
    let name = c.middle_name
      ? `${c.first_name} ${c.middle_name.charAt(0)}. ${c.last_name}`
      : `${c.first_name} ${c.last_name}`;
    if (c.suffix_name) name += ` ${c.suffix_name}`;
    return name;
  };

  const handleOpenAttendanceModal = async () => {
    setShowAttendanceModal(true);
    await recalculateAttendance();
  };

  const shouldShowMedicalRecordsButton = user?.role === "Athlete";
  const shouldShowAttendanceButton =
    user?.role === "Coach" || user?.role === "Athlete";
  const shouldShowRecordsButton =
    user?.role === "Admin" || user?.role === "Coach";
  const canOpenAttendanceModal =
    user?.role === "Coach" || user?.role === "Athlete";

  const getAcademicStatusColor = (status: string) => {
    switch (status) {
      case "Eligible":
        return "bg-green-400 text-green-900";
      case "Under Review":
        return "bg-yellow-400 text-yellow-900";
      case "Ineligible":
        return "bg-red-400 text-red-900";
      default:
        return "bg-gray-400 text-gray-900";
    }
  };

  const getStatusBadge = (value: string) => {
    if (value === "Approved")
      return "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300";
    if (value === "Pending Review")
      return "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300";
    return "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300";
  };

  const quickActionButtonsCount = [
    shouldShowMedicalRecordsButton,
    shouldShowAttendanceButton,
    shouldShowRecordsButton,
  ].filter(Boolean).length;

  const getGridCols = () => {
    if (quickActionButtonsCount === 1) return "";
    if (quickActionButtonsCount === 2) return "md:grid-cols-2";
    return "md:grid-cols-3";
  };

  // ── Renders the profile picture or initials fallback ──────────────────────
  const renderProfileAvatar = (a: AthleteColumns) => {
    const profilePictureUrl = a.user?.profile_picture_url;

    if (profilePictureUrl && !imgError) {
      return (
        <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl flex-shrink-0 border-4 border-white/30">
          <img
            src={profilePictureUrl}
            alt={formatFullName(a)}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      );
    }

    return (
      <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl flex-shrink-0">
        <span className="text-4xl font-bold text-[#396B99]">
          {a.first_name.charAt(0)}
          {a.last_name.charAt(0)}
        </span>
      </div>
    );
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-white/10"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-semibold mt-6 text-lg">
            Loading athlete profile...
          </p>
        </div>
      </div>
    );
  }

  // ── Not found state ────────────────────────────────────────────────────────
  if (!athlete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4">
            Athlete not found
          </p>
          <button
            onClick={() => navigate("/athletes")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            Back to Athletes
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate("/athletes")}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1f2e] text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1e2433] font-semibold shadow-md dark:shadow-black/20 border border-transparent dark:border-white/5 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Athletes
          </button>

          {/* Profile Header */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-transparent dark:border-white/5 overflow-hidden mb-6 transition-colors duration-300">
            <div className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] px-8 py-12">
              <div className="flex items-center gap-6">
                {/* Profile picture or initials fallback */}
                {renderProfileAvatar(athlete)}

                <div className="flex-1">
                  <h1 className="text-4xl font-extrabold text-white mb-2">
                    {formatFullName(athlete)}
                  </h1>
                  <div className="flex items-center gap-4 text-blue-100">
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                        />
                      </svg>
                      {athlete.school_id}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {athlete.sport}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-6 py-3 rounded-xl text-sm font-bold shadow-lg ${getAcademicStatusColor(athlete.academic_status)}`}
                  >
                    {athlete.academic_status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          {quickActionButtonsCount > 0 && (
            <div className={`grid grid-cols-1 ${getGridCols()} gap-4 mb-6`}>
              {shouldShowMedicalRecordsButton && (
                <button
                  onClick={() => setShowMedicalRecordsModal(true)}
                  className="flex items-center justify-center gap-3 bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border-2 border-blue-100 dark:border-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500/40 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                      Medical Records
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      View health information
                    </p>
                  </div>
                </button>
              )}

              {shouldShowAttendanceButton && (
                <button
                  onClick={
                    canOpenAttendanceModal
                      ? handleOpenAttendanceModal
                      : undefined
                  }
                  className={`flex items-center justify-center gap-3 bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border-2 border-purple-100 dark:border-purple-500/20 p-6 transition-all duration-300 ${
                    canOpenAttendanceModal
                      ? "hover:shadow-2xl transform hover:-translate-y-1 hover:border-purple-300 dark:hover:border-purple-500/40 cursor-pointer"
                      : "cursor-default opacity-90"
                  }`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                      Attendance Records
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {Number(athlete.attendance_percentage || 0).toFixed(1)}%
                      attendance rate
                    </p>
                  </div>
                </button>
              )}

              {shouldShowRecordsButton && (
                <button
                  onClick={() => setShowRecordsModal(true)}
                  className="flex items-center justify-center gap-3 bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border-2 border-emerald-100 dark:border-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-500/40 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-gray-800 dark:text-white">
                      Records
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      View wins and achievements
                    </p>
                  </div>
                </button>
              )}
            </div>
          )}

          {/* Document & Academic sections (dark mode handled in their own files) */}
          <DocumentUploadSection
            athlete={athlete}
            onDocumentUpdated={loadAthleteProfile}
          />
          <AcademicRecordsSection
            athlete={athlete}
            onRecordUpdate={loadAthleteProfile}
          />

          {/* Profile Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Personal Information */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-transparent dark:border-white/5 p-8 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                <svg
                  className="w-7 h-7 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: "Full Name", value: formatFullName(athlete) },
                  { label: "School ID", value: athlete.school_id },
                  { label: "Gender", value: athlete.gender.gender },
                  {
                    label: "Birth Date",
                    value: new Date(athlete.birth_date).toLocaleDateString(),
                  },
                  { label: "Age", value: `${athlete.age} years old` },
                  { label: "Department", value: athlete.department },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {label}
                    </label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                      {value}
                    </p>
                  </div>
                ))}
                <div>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Email
                  </label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {athlete.email ? (
                      athlete.email
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 font-medium italic">
                        Not provided
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-transparent dark:border-white/5 p-6 transition-colors duration-300">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                  Attendance
                </h3>
                <div className="text-center">
                  <div className="text-5xl font-extrabold text-blue-600 dark:text-blue-400 mb-2">
                    {Number(athlete.attendance_percentage || 0).toFixed(1)}%
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                    Overall Attendance
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-transparent dark:border-white/5 p-6 transition-colors duration-300">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                  Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      Valid ID
                    </span>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusBadge(athlete.valid_id)}`}
                    >
                      {athlete.valid_id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      Parent Consent
                    </span>
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusBadge(athlete.parent_consent)}`}
                    >
                      {athlete.parent_consent}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Athletic Information */}
          <div className="mt-6 bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-transparent dark:border-white/5 p-8 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
              <svg
                className="w-7 h-7 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Athletic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Sport", value: athlete.sport },
                { label: "Position", value: athlete.position },
                { label: "Coach", value: formatCoachName(athlete) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {label}
                  </label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Information */}
          <div className="mt-6 bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-transparent dark:border-white/5 p-8 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
              <svg
                className="w-7 h-7 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Academic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: "Academic Status", value: athlete.academic_status },
                { label: "Department", value: athlete.department },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {label}
                  </label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Record Information */}
          <div className="mt-6 bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-transparent dark:border-white/5 p-8 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-3">
              <svg
                className="w-7 h-7 text-indigo-600 dark:text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Record Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  label: "Created At",
                  value: new Date(athlete.created_at).toLocaleString(),
                },
                {
                  label: "Last Updated",
                  value: new Date(athlete.updated_at).toLocaleString(),
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {label}
                  </label>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {athlete && showMedicalRecordsModal && (
        <ViewAthleteMedicalRecordsModal
          athlete={athlete}
          isOpen={showMedicalRecordsModal}
          onClose={() => setShowMedicalRecordsModal(false)}
          onRecordUpdated={() => loadAthleteProfile()}
        />
      )}
      {athlete && showAttendanceModal && canOpenAttendanceModal && (
        <ViewAttendanceModal
          athlete={athlete}
          isOpen={showAttendanceModal}
          onClose={() => setShowAttendanceModal(false)}
        />
      )}
      {athlete && showRecordsModal && shouldShowRecordsButton && (
        <ViewAthleteRecordsModal
          athlete={athlete}
          isOpen={showRecordsModal}
          onClose={() => setShowRecordsModal(false)}
        />
      )}
    </>
  );
};

export default AthleteProfilePage;
