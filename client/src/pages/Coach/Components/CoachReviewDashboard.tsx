import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AcademicRecordService from "../../../services/AcademicRecordService";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";
import type { AcademicRecordColumns } from "../../../interfaces/AcademicRecordInterface";
import CloseButton from "../../../components/button/CloseButton";
import SubmitButton from "../../../components/button/SubmitButton";
import Modal from "../../../components/Modal";

interface AthleteWithPendingRecords extends AthleteColumns {
  academic_records: AcademicRecordColumns[];
}

const CoachReviewDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [athletes, setAthletes] = useState<AthleteWithPendingRecords[]>([]);
  const [expandedAthletes, setExpandedAthletes] = useState<Set<number>>(
    new Set(),
  );
  const [processingRecord, setProcessingRecord] = useState<number | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Approve modal
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approvingRecordId, setApprovingRecordId] = useState<number | null>(
    null,
  );
  const [submittingApprove, setSubmittingApprove] = useState(false);

  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingRecordId, setRejectingRecordId] = useState<number | null>(
    null,
  );
  const [rejectNotes, setRejectNotes] = useState("");
  const [rejectNotesError, setRejectNotesError] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);

  // Eligibility override modal
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [selectedAthlete, setSelectedAthlete] =
    useState<AthleteWithPendingRecords | null>(null);
  const [reviewDecision, setReviewDecision] = useState<"approved" | "denied">(
    "approved",
  );
  const [reviewNotes, setReviewNotes] = useState("");
  const [submittingEligibility, setSubmittingEligibility] = useState(false);

  const loadAthletesNeedingReview = async () => {
    try {
      setLoading(true);
      const res = await AcademicRecordService.getAthletesNeedingReview();
      if (res.status === 200) {
        const athleteList: AthleteWithPendingRecords[] = res.data.athletes;
        setAthletes(athleteList);
        const toExpand = new Set<number>();
        athleteList.forEach((a) => {
          if (a.academic_records && a.academic_records.length > 0)
            toExpand.add(a.athlete_id);
        });
        setExpandedAthletes(toExpand);
      }
    } catch (error) {
      console.error("Error loading athletes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAthletesNeedingReview();
  }, []);

  const toggleExpand = (athleteId: number) => {
    setExpandedAthletes((prev) => {
      const next = new Set(prev);
      next.has(athleteId) ? next.delete(athleteId) : next.add(athleteId);
      return next;
    });
  };

  // Approve handlers
  const openApproveModal = (recordId: number) => {
    setApprovingRecordId(recordId);
    setShowApproveModal(true);
  };

  const handleConfirmApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!approvingRecordId) return;
    try {
      setSubmittingApprove(true);
      setProcessingRecord(approvingRecordId);
      const res = await AcademicRecordService.approveRecord(approvingRecordId);
      if (res.status === 200) {
        setShowApproveModal(false);
        setApprovingRecordId(null);
        await loadAthletesNeedingReview();
      }
    } catch (error: any) {
      console.error("Approve error:", error);
    } finally {
      setSubmittingApprove(false);
      setProcessingRecord(null);
    }
  };

  // Reject handlers
  const openRejectModal = (recordId: number) => {
    setRejectingRecordId(recordId);
    setRejectNotes("");
    setRejectNotesError("");
    setShowRejectModal(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRecordId) return;
    if (!rejectNotes.trim()) {
      setRejectNotesError("Please provide a reason for rejection.");
      return;
    }
    try {
      setSubmittingReject(true);
      const res = await AcademicRecordService.rejectRecord(
        rejectingRecordId,
        rejectNotes.trim(),
      );
      if (res.status === 200) {
        setShowRejectModal(false);
        setRejectingRecordId(null);
        setRejectNotes("");
        setRejectNotesError("");
        await loadAthletesNeedingReview();
      }
    } catch (error: any) {
      console.error("Reject error:", error);
    } finally {
      setSubmittingReject(false);
    }
  };

  // Eligibility handlers
  const openEligibilityModal = (athlete: AthleteWithPendingRecords) => {
    setSelectedAthlete(athlete);
    setReviewDecision("approved");
    setReviewNotes("");
    setShowEligibilityModal(true);
  };

  const handleSubmitEligibility = async () => {
    if (!selectedAthlete) return;
    try {
      setSubmittingEligibility(true);
      const res = await AcademicRecordService.reviewEligibility(
        selectedAthlete.athlete_id,
        { decision: reviewDecision, notes: reviewNotes },
      );
      if (res.status === 200) {
        setShowEligibilityModal(false);
        await loadAthletesNeedingReview();
      }
    } catch (error: any) {
      console.error("Eligibility review error:", error);
    } finally {
      setSubmittingEligibility(false);
    }
  };

  const handleViewImage = async (recordId: number) => {
    try {
      const res = await AcademicRecordService.downloadGradeImage(recordId);
      setViewingImage(window.URL.createObjectURL(new Blob([res.data])));
    } catch (error) {
      console.error("Image view error:", error);
    }
  };

  const formatFullName = (athlete: AthleteColumns) => {
    let name = athlete.middle_name
      ? `${athlete.first_name} ${athlete.middle_name.charAt(0)}. ${athlete.last_name}`
      : `${athlete.first_name} ${athlete.last_name}`;
    if (athlete.suffix_name) name += ` ${athlete.suffix_name}`;
    return name;
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getDaysRemaining = (endDate: string) =>
    Math.ceil(
      (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );

  const formatGrade = (grade: number | string) => {
    if (typeof grade === "string" && isNaN(Number(grade))) return grade;
    return Number(grade).toFixed(2);
  };

  const isCourseGradeFailed = (grade: number | string) => {
    if (typeof grade === "string" && isNaN(Number(grade)))
      return ["INC", "DRP"].includes(grade.toUpperCase());
    return Number(grade) >= 5.0;
  };

  const totalPendingRecords = athletes.reduce(
    (sum, a) => sum + (a.academic_records?.length ?? 0),
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium text-lg">
            Loading athletes needing review...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="mb-4 flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1f2e] text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1e2433] font-semibold shadow-md dark:shadow-black/20 border border-transparent dark:border-white/5 transition-all"
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
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-2">
              Academic Eligibility Reviews
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Review athletes who need academic approval
            </p>
          </div>

          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-2xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 font-semibold mb-2">
                  ATHLETES PENDING REVIEW
                </p>
                <p className="text-6xl font-extrabold">{athletes.length}</p>
                {totalPendingRecords > 0 && (
                  <p className="text-yellow-100 mt-2 font-medium">
                    {totalPendingRecords} pending grade submission
                    {totalPendingRecords !== 1 ? "s" : ""} awaiting action
                  </p>
                )}
              </div>
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12"
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
            </div>
          </div>

          {/* Empty state */}
          {athletes.length === 0 ? (
            <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-transparent dark:border-white/5 p-16 text-center transition-colors duration-300">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-green-600 dark:text-green-400"
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
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
                All Caught Up!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No athletes currently need academic review.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {athletes.map((athlete) => {
                const daysRemaining = athlete.grace_period_end_date
                  ? getDaysRemaining(athlete.grace_period_end_date)
                  : 0;
                const isUrgent = daysRemaining <= 3 && daysRemaining >= 0;
                const isExpired = daysRemaining < 0;
                const isExpanded = expandedAthletes.has(athlete.athlete_id);
                const pendingRecords = athlete.academic_records ?? [];

                return (
                  <div
                    key={athlete.athlete_id}
                    className={`bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 border-2 transition-all hover:shadow-2xl dark:hover:shadow-black/40 ${
                      isExpired
                        ? "border-red-500 dark:border-red-500/60"
                        : isUrgent
                          ? "border-orange-400 dark:border-orange-500/50"
                          : "border-gray-200 dark:border-white/5"
                    }`}
                  >
                    {/* Athlete Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                            <span className="text-2xl font-bold text-white">
                              {athlete.first_name.charAt(0)}
                              {athlete.last_name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                              {formatFullName(athlete)}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                              <span>{athlete.school_id}</span>
                              <span>•</span>
                              <span>{athlete.sport}</span>
                              <span>•</span>
                              <span>{athlete.position}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isExpired && (
                            <span className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold text-xs">
                              ⛔ EXPIRED
                            </span>
                          )}
                          {isUrgent && !isExpired && (
                            <span className="px-3 py-1 bg-orange-500 text-white rounded-lg font-bold text-xs animate-pulse">
                              ⚠️ URGENT
                            </span>
                          )}
                          {pendingRecords.length > 0 && (
                            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 rounded-lg font-bold text-xs border border-yellow-300 dark:border-yellow-500/30">
                              {pendingRecords.length} Pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="bg-red-50 dark:bg-red-500/10 rounded-xl p-3 border border-red-200 dark:border-red-500/20">
                          <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1">
                            CURRENT GRADE
                          </p>
                          <p className="text-2xl font-extrabold text-red-700 dark:text-red-300">
                            {Number(
                              athlete.current_grade_percentage ?? 0,
                            ).toFixed(2)}
                            %
                          </p>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-500/10 rounded-xl p-3 border border-yellow-200 dark:border-yellow-500/20">
                          <p className="text-xs font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                            GRACE PERIOD
                          </p>
                          <p className="text-2xl font-extrabold text-yellow-700 dark:text-yellow-300">
                            {athlete.grace_period_end_date
                              ? isExpired
                                ? "Expired"
                                : `${daysRemaining}d left`
                              : "N/A"}
                          </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-3 border border-blue-200 dark:border-blue-500/20">
                          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                            SUBMITTED
                          </p>
                          <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                            {athlete.last_grade_upload_date
                              ? formatDate(athlete.last_grade_upload_date)
                              : "N/A"}
                          </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-500/10 rounded-xl p-3 border border-purple-200 dark:border-purple-500/20">
                          <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                            STATUS
                          </p>
                          <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                            {athlete.academic_status}
                          </p>
                        </div>
                      </div>

                      {/* Coach notes banner */}
                      {athlete.coach_review_notes && (
                        <div className="mb-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-300 dark:border-orange-500/30 rounded-lg px-4 py-2">
                          <p className="text-sm text-orange-800 dark:text-orange-300">
                            <span className="font-bold">Note: </span>
                            {athlete.coach_review_notes}
                          </p>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() =>
                            navigate(`/athletes/${athlete.athlete_id}`)
                          }
                          className="px-5 py-2.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-white/15 font-bold text-sm transition-all flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View Profile
                        </button>

                        {pendingRecords.length > 0 && (
                          <button
                            onClick={() => toggleExpand(athlete.athlete_id)}
                            className="px-5 py-2.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-500/30 font-bold text-sm transition-all flex items-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
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
                            {isExpanded ? "Hide" : "View"} Grade Records (
                            {pendingRecords.length})
                          </button>
                        )}

                        <button
                          onClick={() => openEligibilityModal(athlete)}
                          className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg font-bold text-sm transition-all flex items-center gap-2"
                        >
                          <svg
                            className="w-4 h-4"
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
                          Override Eligibility
                        </button>
                      </div>
                    </div>

                    {/* Pending Records (expandable) */}
                    {isExpanded && pendingRecords.length > 0 && (
                      <div className="border-t-2 border-gray-100 dark:border-white/5 px-6 pb-6 pt-4 space-y-4">
                        <h4 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <svg
                            className="w-5 h-5 text-yellow-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          Pending Grade Submissions
                        </h4>

                        {pendingRecords.map((record) => {
                          const isProcessing =
                            processingRecord === record.academic_record_id;
                          return (
                            <div
                              key={record.academic_record_id}
                              className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-500/10 dark:to-orange-500/10 rounded-xl p-5 border-2 border-yellow-200 dark:border-yellow-500/20"
                            >
                              {/* Record header */}
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <p className="font-bold text-gray-800 dark:text-white text-lg">
                                    {record.semester_term}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                    Uploaded: {formatDate(record.upload_date)}{" "}
                                    &nbsp;•&nbsp; {record.total_units} units
                                  </p>
                                </div>
                                <span className="px-3 py-1 bg-yellow-200 dark:bg-yellow-500/30 text-yellow-800 dark:text-yellow-300 rounded-lg text-xs font-bold">
                                  PENDING
                                </span>
                              </div>

                              {/* Grade stats */}
                              <div className="grid grid-cols-3 gap-3 mb-4">
                                {[
                                  {
                                    label: "GWA",
                                    value: Number(record.gwa_grade).toFixed(2),
                                    color: "text-blue-600 dark:text-blue-400",
                                  },
                                  {
                                    label: "PERCENTAGE",
                                    value: `${Number(record.calculated_percentage).toFixed(2)}%`,
                                    color:
                                      "text-indigo-600 dark:text-indigo-400",
                                  },
                                  {
                                    label: "COURSES",
                                    value: record.courses.length,
                                    color:
                                      "text-purple-600 dark:text-purple-400",
                                  },
                                ].map(({ label, value, color }) => (
                                  <div
                                    key={label}
                                    className="bg-white dark:bg-[#1a1f2e] rounded-lg p-3 text-center border border-gray-200 dark:border-white/10"
                                  >
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                                      {label}
                                    </p>
                                    <p
                                      className={`text-xl font-extrabold ${color}`}
                                    >
                                      {value}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              {/* Course list */}
                              <details className="bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-white/10 mb-4">
                                <summary className="px-4 py-3 cursor-pointer font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                                  View Course Details ({record.courses.length}{" "}
                                  courses)
                                </summary>
                                <div className="px-4 pb-4 space-y-2 mt-2">
                                  {record.courses.map((course, idx) => {
                                    const failed = isCourseGradeFailed(
                                      course.grade,
                                    );
                                    return (
                                      <div
                                        key={idx}
                                        className={`flex items-center justify-between p-3 rounded-lg ${
                                          failed
                                            ? "bg-red-50 dark:bg-red-500/10 border-2 border-red-300 dark:border-red-500/30"
                                            : "bg-gray-50 dark:bg-white/5"
                                        }`}
                                      >
                                        <div className="flex-1">
                                          <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                                            {course.course_code}
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {course.course_name}
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <p
                                            className={`text-base font-bold ${failed ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}
                                          >
                                            {formatGrade(course.grade)}
                                            {failed && (
                                              <span className="ml-1 text-xs">
                                                (FAILED)
                                              </span>
                                            )}
                                          </p>
                                          <p className="text-xs text-gray-400 dark:text-gray-500">
                                            {course.credits} units
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </details>

                              {/* Record actions */}
                              <div className="flex flex-wrap gap-3">
                                <button
                                  onClick={() =>
                                    handleViewImage(record.academic_record_id)
                                  }
                                  className="flex-1 min-w-[120px] px-4 py-2.5 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-xl hover:bg-purple-200 dark:hover:bg-purple-500/30 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                  View Image
                                </button>
                                <button
                                  onClick={() =>
                                    openApproveModal(record.academic_record_id)
                                  }
                                  disabled={isProcessing}
                                  className="flex-1 min-w-[120px] px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                  {isProcessing ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                      Approve
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() =>
                                    openRejectModal(record.academic_record_id)
                                  }
                                  disabled={isProcessing}
                                  className="flex-1 min-w-[120px] px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                  Reject
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        showCloseButton
        size="medium"
      >
        <form
          onSubmit={handleConfirmApprove}
          className="flex flex-col h-full overflow-hidden"
        >
          <div className="flex-shrink-0 border-b border-gray-200">
            <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
              Approve Academic Record
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
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
                <div>
                  <h3 className="text-sm font-bold text-green-800 mb-1">
                    Confirm Approval
                  </h3>
                  <p className="text-sm text-green-700">
                    Approve this academic record? The athlete may be marked
                    Eligible if no other pending records remain.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col-reverse sm:flex-row justify-end gap-2">
            {!submittingApprove && (
              <CloseButton
                label="Cancel"
                onClose={() => setShowApproveModal(false)}
              />
            )}
            <SubmitButton
              className="bg-green-600 hover:bg-green-700"
              label="Approve Record"
              loading={submittingApprove}
              loadingLabel="Approving..."
            />
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectNotes("");
          setRejectNotesError("");
        }}
        showCloseButton
        size="medium"
      >
        <form
          onSubmit={handleConfirmReject}
          className="flex flex-col h-full overflow-hidden"
        >
          <div className="flex-shrink-0 border-b border-gray-200">
            <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
              Reject Academic Record
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-bold text-red-800 mb-1">
                    Confirm Rejection
                  </h3>
                  <p className="text-sm text-red-700">
                    This academic record will be rejected. The athlete will be
                    notified with the reason you provide below.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-500/10 border border-red-300 dark:border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm font-bold text-red-800 dark:text-red-300">
                ❌ The athlete will be marked as Ineligible after rejection.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectNotes}
                onChange={(e) => {
                  setRejectNotes(e.target.value);
                  if (e.target.value.trim()) setRejectNotesError("");
                }}
                placeholder="e.g. Grades appear incorrect, please re-upload a clearer image..."
                rows={4}
                className={`w-full px-3 py-2 border-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none ${
                  rejectNotesError
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 focus:border-red-500"
                }`}
              />
              {rejectNotesError && (
                <p className="text-xs text-red-600 font-semibold mt-1">
                  {rejectNotesError}
                </p>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col-reverse sm:flex-row justify-end gap-2">
            {!submittingReject && (
              <CloseButton
                label="Cancel"
                onClose={() => {
                  setShowRejectModal(false);
                  setRejectNotes("");
                  setRejectNotesError("");
                }}
              />
            )}
            <SubmitButton
              className="bg-red-600 hover:bg-red-700"
              label="Reject Record"
              loading={submittingReject}
              loadingLabel="Rejecting..."
            />
          </div>
        </form>
      </Modal>

      {/* Eligibility Override Modal */}
      {showEligibilityModal && selectedAthlete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-2xl dark:shadow-black/50 max-w-2xl w-full border border-transparent dark:border-white/5">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                Override Eligibility Status
              </h2>
              <button
                onClick={() => setShowEligibilityModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 border border-transparent dark:border-white/10">
                <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2">
                  {formatFullName(selectedAthlete)}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">
                      School ID:
                    </p>
                    <p className="text-gray-800 dark:text-gray-200">
                      {selectedAthlete.school_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">
                      Current Grade:
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {Number(
                        selectedAthlete.current_grade_percentage ?? 0,
                      ).toFixed(2)}
                      %
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Decision <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setReviewDecision("approved")}
                    className={`p-4 rounded-xl border-2 font-bold transition-all ${
                      reviewDecision === "approved"
                        ? "bg-green-100 dark:bg-green-500/20 border-green-500 dark:border-green-500/60 text-green-800 dark:text-green-300"
                        : "bg-gray-50 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-green-300 dark:hover:border-green-500/40"
                    }`}
                  >
                    <svg
                      className="w-8 h-8 mx-auto mb-2"
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
                    Approve (Eligible)
                  </button>
                  <button
                    onClick={() => setReviewDecision("denied")}
                    className={`p-4 rounded-xl border-2 font-bold transition-all ${
                      reviewDecision === "denied"
                        ? "bg-red-100 dark:bg-red-500/20 border-red-500 dark:border-red-500/60 text-red-800 dark:text-red-300"
                        : "bg-gray-50 dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-red-300 dark:hover:border-red-500/40"
                    }`}
                  >
                    <svg
                      className="w-8 h-8 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Deny (Ineligible)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 font-medium resize-none"
                  placeholder="Add any notes or conditions for this decision..."
                />
              </div>

              <div
                className={`rounded-xl p-4 border-2 ${
                  reviewDecision === "approved"
                    ? "bg-green-50 dark:bg-green-500/10 border-green-300 dark:border-green-500/30"
                    : "bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30"
                }`}
              >
                <p
                  className={`text-sm font-bold ${reviewDecision === "approved" ? "text-green-800 dark:text-green-300" : "text-red-800 dark:text-red-300"}`}
                >
                  {reviewDecision === "approved"
                    ? "✅ This athlete will be marked as Eligible and can compete in events."
                    : "❌ This athlete will be marked as Ineligible and cannot compete."}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-[#252b3b] px-6 py-4 rounded-b-2xl flex items-center justify-end gap-3">
              <button
                onClick={() => setShowEligibilityModal(false)}
                disabled={submittingEligibility}
                className="px-6 py-3 bg-gray-300 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-400 dark:hover:bg-white/15 font-bold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitEligibility}
                disabled={submittingEligibility}
                className={`px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 ${
                  reviewDecision === "approved"
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg"
                    : "bg-gradient-to-r from-red-600 to-rose-600 text-white hover:shadow-lg"
                }`}
              >
                {submittingEligibility ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer */}
      {viewingImage && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingImage(null)}
        >
          <div
            className="relative max-w-6xl max-h-[90vh] bg-white dark:bg-[#1a1f2e] rounded-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewingImage(null)}
              className="absolute -top-4 -right-4 bg-red-600 text-white rounded-full p-3 hover:bg-red-700 shadow-lg z-10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={viewingImage}
              alt="Grade"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CoachReviewDashboard;
