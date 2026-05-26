import { useState, useEffect, type FC } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import AcademicRecordService from "../../../services/AcademicRecordService";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";
import type { AcademicRecordColumns } from "../../../interfaces/AcademicRecordInterface";
import GradeUploadModal from "./GradeUploadModal";
import ApproveAcademicRecordModal from "./ApproveAcademicRecordModal";
import RejectAcademicRecordModal from "./RejectAcademicRecordModal";

interface AcademicRecordsSectionProps {
  athlete: AthleteColumns;
  onRecordUpdate: () => void;
}

// Per-record inline image fetcher
const useInlineGradeImage = (recordId: number) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;

    const fetch = async () => {
      try {
        setLoading(true);
        const res = await AcademicRecordService.downloadGradeImage(recordId);
        objectUrl = window.URL.createObjectURL(new Blob([res.data]));
        setUrl(objectUrl);
      } catch {
        setUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetch();
    return () => {
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [recordId]);

  return { url, loading };
};

// Individual record card with its own inline image fetch
const AcademicRecordCard: FC<{
  record: AcademicRecordColumns;
  canApprove: boolean;
  isOwner: boolean;
  onApprove: (record: AcademicRecordColumns) => void;
  onReject: (record: AcademicRecordColumns) => void;
  onFullscreen: (url: string) => void;
  onDownload: (recordId: number) => void;
  formatNumber: (v: any, d?: number) => string;
  formatGrade: (g: any) => string;
  isCourseGradeFailed: (g: any) => boolean;
  hasFailedCourses: (courses: any[]) => boolean;
  getStatusColor: (status: string) => string;
  formatDate: (d: string) => string;
}> = ({
  record,
  canApprove,
  onApprove,
  onReject,
  onFullscreen,
  onDownload,
  formatNumber,
  formatGrade,
  isCourseGradeFailed,
  hasFailedCourses,
  getStatusColor,
  formatDate,
}) => {
  const { url: inlineUrl, loading: inlineLoading } = useInlineGradeImage(
    record.academic_record_id,
  );

  const hasFailed = hasFailedCourses(record.courses);
  const needsReview = hasFailed && record.status === "pending";

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/[0.03] rounded-xl p-6 border-2 border-gray-200 dark:border-white/10 hover:shadow-lg dark:hover:shadow-black/20 transition-all">
      {/* Title row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
            {record.semester_term}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {formatDate(record.upload_date)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {record.total_units} units
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {needsReview && (
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 rounded-lg text-xs font-bold">
              ⚠️ NEEDS REVIEW
            </span>
          )}
          <span className={`px-4 py-2 rounded-lg text-sm font-bold ${getStatusColor(record.status)}`}>
            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
          </span>
        </div>
      </div>

      {hasFailed && (
        <div className="mb-4 bg-red-50 dark:bg-red-500/10 border-2 border-red-300 dark:border-red-500/30 rounded-lg p-3">
          <p className="text-sm font-bold text-red-800 dark:text-red-300">
            ⚠️ This record contains failed courses (INC/DRP). Coach review required.
          </p>
        </div>
      )}

      {/* Grade Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: "GWA", value: formatNumber(record.gwa_grade), color: "text-blue-600 dark:text-blue-400" },
          { label: "PERCENTAGE", value: `${formatNumber(record.calculated_percentage)}%`, color: "text-indigo-600 dark:text-indigo-400" },
          { label: "COURSES", value: String(record.courses.length), color: "text-purple-600 dark:text-purple-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-[#252b3b] rounded-lg p-4 text-center border border-gray-200 dark:border-white/10">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Course Details */}
      <details className="bg-white dark:bg-[#252b3b] rounded-lg p-4 border border-gray-200 dark:border-white/10 mb-4">
        <summary className="cursor-pointer font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
          View Course Details ({record.courses.length} courses)
        </summary>
        <div className="mt-4 space-y-2">
          {record.courses.map((course, idx) => {
            const isFailed = isCourseGradeFailed(course.grade);
            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isFailed
                    ? "bg-red-50 dark:bg-red-500/10 border-2 border-red-300 dark:border-red-500/30"
                    : "bg-gray-50 dark:bg-white/5"
                }`}
              >
                <div className="flex-1">
                  <p className="font-bold text-gray-800 dark:text-white">{course.course_code}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{course.course_name}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${isFailed ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>
                    {formatGrade(course.grade)}
                    {isFailed && <span className="ml-1 text-xs">(FAILED)</span>}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{course.credits} units</p>
                </div>
              </div>
            );
          })}
        </div>
      </details>

      {/* ── Inline grade image ── */}
      <div className="mb-4 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5">
        {inlineLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
          </div>
        ) : inlineUrl ? (
          <img
            src={inlineUrl}
            alt={`Grade - ${record.semester_term}`}
            className="w-full max-h-72 object-contain cursor-pointer"
            onClick={() => onFullscreen(inlineUrl)}
          />
        ) : (
          <div className="flex items-center justify-center h-24 text-gray-400 dark:text-gray-500 text-sm font-medium">
            No image available
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {inlineUrl && (
          <button
            onClick={() => onFullscreen(inlineUrl)}
            className="flex-1 min-w-[150px] px-4 py-2 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-500/30 font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Fullscreen
          </button>
        )}

        <button
          onClick={() => onDownload(record.academic_record_id)}
          className="flex-1 min-w-[150px] px-4 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500/30 font-semibold text-sm transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>

        {canApprove && record.status === "pending" && (
          <>
            <button
              onClick={() => onApprove(record)}
              className="flex-1 min-w-[150px] px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Approve
            </button>
            <button
              onClick={() => onReject(record)}
              className="flex-1 min-w-[150px] px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reject
            </button>
          </>
        )}

        {record.verification_notes && (
          <details className="flex-1 min-w-[200px]">
            <summary className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 font-semibold text-sm cursor-pointer text-center">
              ▶ View Verification Notes
            </summary>
            <div className="mt-2 p-3 bg-gray-50 dark:bg-[#252b3b] rounded-lg border border-gray-200 dark:border-white/10">
              <p className="text-sm text-gray-700 dark:text-gray-300">{record.verification_notes}</p>
              {record.verification_date && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Verified on {formatDate(record.verification_date)}
                </p>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

// ── Main Section ──────────────────────────────────────────────────────────────

const AcademicRecordsSection: FC<AcademicRecordsSectionProps> = ({
  athlete,
  onRecordUpdate,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AcademicRecordColumns[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);

  const [selectedRecordForApprove, setSelectedRecordForApprove] =
    useState<AcademicRecordColumns | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

  const [selectedRecordForReject, setSelectedRecordForReject] =
    useState<AcademicRecordColumns | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const formatNumber = (value: number | string | undefined | null, decimals = 2): string => {
    if (value === undefined || value === null) return "N/A";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? "N/A" : num.toFixed(decimals);
  };

  const formatGrade = (grade: number | string | undefined | null): string => {
    if (grade === undefined || grade === null) return "N/A";
    if (typeof grade === "string" && isNaN(Number(grade))) return grade.toUpperCase();
    return Number(grade).toFixed(2);
  };

  const isCourseGradeFailed = (grade: number | string | undefined | null): boolean => {
    if (grade === undefined || grade === null) return false;
    if (typeof grade === "string" && isNaN(Number(grade)))
      return ["INC", "DRP"].includes(grade.toUpperCase());
    return Number(grade) >= 5.0;
  };

  const hasFailedCourses = (courses: any[]) => courses.some((c) => isCourseGradeFailed(c.grade));

  const loadAcademicRecords = async () => {
    try {
      setLoading(true);
      const res = await AcademicRecordService.getAthleteAcademicRecords(athlete.athlete_id);
      if (res.status === 200) setRecords(res.data.academic_records);
    } catch (error) {
      console.error("Error loading academic records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAcademicRecords();
  }, [athlete.athlete_id]);

  const handleDownloadImage = async (recordId: number) => {
    try {
      const res = await AcademicRecordService.downloadGradeImage(recordId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `grade_${recordId}.jpg`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      console.error("Failed to download image");
    }
  };

  const openApproveModal = (record: AcademicRecordColumns) => {
    setSelectedRecordForApprove(record);
    setIsApproveModalOpen(true);
  };

  const openRejectModal = (record: AcademicRecordColumns) => {
    setSelectedRecordForReject(record);
    setIsRejectModalOpen(true);
  };

  const handleApproveSuccess = () => { loadAcademicRecords(); onRecordUpdate(); };
  const handleRejectSuccess = () => { loadAcademicRecords(); onRecordUpdate(); };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300";
      case "rejected": return "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300";
      default: return "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300";
    }
  };

  const getAcademicStatusStyle = (status: string) => {
    switch (status) {
      case "Eligible":
        return {
          card: "bg-green-50 dark:bg-green-500/10 border-green-300 dark:border-green-500/30",
          text: "text-green-800 dark:text-green-300",
          divider: "border-green-300 dark:border-green-500/30",
        };
      case "Under Review":
        return {
          card: "bg-yellow-50 dark:bg-yellow-500/10 border-yellow-300 dark:border-yellow-500/30",
          text: "text-yellow-800 dark:text-yellow-300",
          divider: "border-yellow-300 dark:border-yellow-500/30",
        };
      default:
        return {
          card: "bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30",
          text: "text-red-800 dark:text-red-300",
          divider: "border-red-300 dark:border-red-500/30",
        };
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const isOwner = user?.role === "Athlete" && athlete.user_id === user.user_id;
  const canApprove = user?.role === "Coach" || user?.role === "Admin";

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border-2 border-gray-100 dark:border-white/5 p-8 transition-colors duration-300">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading academic records...</p>
        </div>
      </div>
    );
  }

  const academicStyle = getAcademicStatusStyle(athlete.academic_status);

  return (
    <>
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border-2 border-gray-100 dark:border-white/5 p-8 transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Academic Records</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">View and manage grade submissions</p>
            </div>
          </div>
          {isOwner && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg font-bold transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Upload Grades
            </button>
          )}
        </div>

        {/* Current Status Card */}
        <div className={`rounded-xl p-6 mb-6 border-2 ${academicStyle.card}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">CURRENT ACADEMIC STATUS</p>
              <p className={`text-3xl font-extrabold ${academicStyle.text}`}>{athlete.academic_status}</p>
              {athlete.current_grade_percentage !== null && athlete.current_grade_percentage !== undefined && (
                <p className="text-lg font-bold text-gray-700 dark:text-gray-300 mt-2">
                  Current Grade: {formatNumber(athlete.current_grade_percentage)}%
                </p>
              )}
            </div>
            <div className="text-right">
              {athlete.academic_status === "Under Review" && athlete.grace_period_end_date && (
                <div>
                  <p className="text-sm font-bold text-yellow-700 dark:text-yellow-400 mb-1">Grace Period Ends:</p>
                  <p className="text-lg font-extrabold text-yellow-900 dark:text-yellow-300">
                    {formatDate(athlete.grace_period_end_date)}
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Awaiting coach review</p>
                </div>
              )}
              {athlete.reviewed_by && athlete.review_date && (
                <div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Reviewed:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(athlete.review_date)}</p>
                </div>
              )}
            </div>
          </div>
          {athlete.coach_review_notes && (
            <div className={`mt-4 pt-4 border-t-2 ${academicStyle.divider}`}>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Coach Notes:</p>
              <p className="text-gray-800 dark:text-gray-200">{athlete.coach_review_notes}</p>
            </div>
          )}
        </div>

        {/* Records List */}
        {records.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 dark:bg-white/5 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10">
            <div className="w-20 h-20 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-bold text-lg mb-2">No academic records yet</p>
            {isOwner && (
              <>
                <p className="text-gray-500 dark:text-gray-500 mb-4">Upload your grades to track eligibility</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg transition-all"
                >
                  Upload Your First Grades
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <AcademicRecordCard
                key={record.academic_record_id}
                record={record}
                canApprove={canApprove}
                isOwner={isOwner}
                onApprove={openApproveModal}
                onReject={openRejectModal}
                onFullscreen={setFullscreenUrl}
                onDownload={handleDownloadImage}
                formatNumber={formatNumber}
                formatGrade={formatGrade}
                isCourseGradeFailed={isCourseGradeFailed}
                hasFailedCourses={hasFailedCourses}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <GradeUploadModal
          athlete={athlete}
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => { loadAcademicRecords(); onRecordUpdate(); }}
        />
      )}

      {/* Approve Modal */}
      <ApproveAcademicRecordModal
        record={selectedRecordForApprove}
        isOpen={isApproveModalOpen}
        onClose={() => { setIsApproveModalOpen(false); setSelectedRecordForApprove(null); }}
        onSuccess={handleApproveSuccess}
      />

      {/* Reject Modal */}
      <RejectAcademicRecordModal
        record={selectedRecordForReject}
        isOpen={isRejectModalOpen}
        onClose={() => { setIsRejectModalOpen(false); setSelectedRecordForReject(null); }}
        onSuccess={handleRejectSuccess}
      />

      {/* Fullscreen Image Viewer */}
      {fullscreenUrl && (
        <div
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
          onClick={() => setFullscreenUrl(null)}
        >
          <div
            className="relative max-w-6xl max-h-[90vh] bg-white dark:bg-[#1a1f2e] rounded-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setFullscreenUrl(null)}
              className="absolute -top-4 -right-4 bg-red-600 text-white rounded-full p-3 hover:bg-red-700 shadow-lg z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={fullscreenUrl}
              alt="Grade"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AcademicRecordsSection;