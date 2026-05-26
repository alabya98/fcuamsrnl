import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import AthleteProfileService from "../../../services/AthleteProfileService";
import AcademicRecordService from "../../../services/AcademicRecordService";
import GradeUploadModal from "./GradeUploadModal";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";
import type { AcademicRecordColumns } from "../../../interfaces/AcademicRecordInterface";

const AthleteAcademicRecordsPage = () => {
  const { } = useAuth();
  const [loading, setLoading] = useState(true);
  const [athleteProfile, setAthleteProfile] = useState<AthleteColumns | null>(null);
  const [academicRecords, setAcademicRecords] = useState<AcademicRecordColumns[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const profileRes = await AthleteProfileService.getMyProfile();
      if (profileRes.status === 200) {
        setAthleteProfile(profileRes.data.athlete);
        const recordsRes = await AcademicRecordService.getAthleteAcademicRecords(profileRes.data.athlete.athlete_id);
        if (recordsRes.status === 200) setAcademicRecords(recordsRes.data.academic_records || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleViewImage = async (recordId: number) => {
    try {
      const res = await AcademicRecordService.downloadGradeImage(recordId);
      setViewingImage(window.URL.createObjectURL(new Blob([res.data])));
    } catch (error) {
      console.error("Error viewing image:", error);
      alert("Failed to load image");
    }
  };

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
    } catch (error) {
      console.error("Error downloading image:", error);
      alert("Failed to download image");
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300";
      case "pending": return "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300";
      case "rejected": return "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300";
      default: return "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-300";
    }
  };

  const formatNumber = (value: number | string | undefined | null, decimals: number = 2): string => {
    if (value === undefined || value === null) return "N/A";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? "N/A" : num.toFixed(decimals);
  };

  const hasFailedCourses = (courses: any[]) =>
    courses.some((course) => {
      if (course.grade === "INC" || course.grade === "DRP") return true;
      const grade = typeof course.grade === "number" ? course.grade : parseFloat(course.grade);
      return grade >= 5.0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0f1117] dark:to-[#141720] transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#396B99] mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300 font-medium text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!athleteProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0f1117] dark:to-[#141720] p-6 transition-colors duration-300">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-500/10 dark:to-orange-500/10 border-2 border-yellow-300 dark:border-yellow-500/30 rounded-2xl p-8 text-center shadow-lg">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">Profile Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Your athlete profile hasn't been created yet. Please contact your coach or administrator.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isUploadModalOpen && (
        <GradeUploadModal
          athlete={athleteProfile}
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => { loadData(); setIsUploadModalOpen(false); }}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] transition-colors duration-300">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] shadow-xl border-b-4 border-[#396B99]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Academic Records</h1>
                <p className="text-blue-100 text-base font-medium">Upload and manage your grades</p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="hidden lg:flex items-center gap-2 px-6 py-3 bg-white text-[#396B99] rounded-xl hover:bg-blue-50 font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Grades
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Academic Status Card */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-6 mb-8 border-2 border-gray-100 dark:border-white/5 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Academic Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-2">Current Status</p>
                <span className={`inline-block px-4 py-2 rounded-xl text-sm font-bold shadow-md ${
                  athleteProfile.academic_status === "Eligible"
                    ? "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300"
                    : athleteProfile.academic_status === "Under Review"
                    ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300"
                    : "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300"
                }`}>
                  {athleteProfile.academic_status}
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-2">Total Records</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{academicRecords.length}</p>
              </div>
              <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-2">Latest GWA</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">
                  {academicRecords.length > 0 ? formatNumber(academicRecords[0].gwa_grade) : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Upload Button Mobile */}
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="lg:hidden w-full mb-6 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Grades
          </button>

          {/* Grade History */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-6 border-2 border-gray-100 dark:border-white/5 transition-colors duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Grade History</h2>

            {academicRecords.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 dark:bg-white/5 rounded-xl border-2 border-dashed border-gray-300 dark:border-white/10">
                <div className="w-20 h-20 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-bold text-lg mb-2">No academic records yet</p>
                <p className="text-gray-400 dark:text-gray-500">Upload your first grade report to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {academicRecords.map((record) => {
                  const hasFailed = hasFailedCourses(record.courses);
                  const needsReview = hasFailed && record.status === "pending";

                  return (
                    <div
                      key={record.academic_record_id}
                      className="bg-gradient-to-r from-blue-50 via-white to-blue-50 dark:from-blue-500/10 dark:via-[#1e2433] dark:to-blue-500/10 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-500/20 hover:shadow-xl dark:hover:shadow-black/20 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{record.semester_term}</h3>
                            {needsReview && (
                              <span className="px-3 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 rounded-lg text-xs font-bold">⚠️ NEEDS REVIEW</span>
                            )}
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusBadge(record.status)}`}>
                              {record.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded on {formatDate(record.upload_date)}</p>
                        </div>
                      </div>

                      {hasFailed && (
                        <div className="mb-4 bg-red-50 dark:bg-red-500/10 border-2 border-red-300 dark:border-red-500/30 rounded-lg p-3">
                          <p className="text-sm font-bold text-red-800 dark:text-red-300">
                            ⚠️ This record contains failed courses (INC/DRP). Coach review required.
                          </p>
                        </div>
                      )}

                      {/* Grade Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {[
                          { label: "GWA", value: formatNumber(record.gwa_grade), color: "text-blue-600 dark:text-blue-400" },
                          { label: "Percentage", value: `${formatNumber(record.calculated_percentage)}%`, color: "text-blue-600 dark:text-blue-400" },
                          { label: "Total Units", value: record.total_units, color: "text-gray-800 dark:text-white" },
                          { label: "Courses", value: record.courses.length, color: "text-gray-800 dark:text-white" },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="bg-white dark:bg-[#1a1f2e] p-3 rounded-lg border border-gray-200 dark:border-white/10">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">{label}</p>
                            <p className={`text-2xl font-bold ${color}`}>{value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Verification Info */}
                      {record.verified_by && record.verifier && (
                        <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg p-3 mb-4">
                          <p className="text-sm text-green-800 dark:text-green-300">
                            <span className="font-bold">Verified by:</span> {record.verifier.first_name} {record.verifier.last_name}
                            {record.verification_date && ` on ${formatDate(record.verification_date)}`}
                          </p>
                          {record.verification_notes && (
                            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                              <span className="font-bold">Notes:</span> {record.verification_notes}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Course Details */}
                      <details className="mt-4 bg-white dark:bg-[#1a1f2e] rounded-lg p-4 border border-gray-200 dark:border-white/10 mb-4">
                        <summary className="cursor-pointer font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          View Course Details ({record.courses.length} courses)
                        </summary>
                        <div className="mt-3 space-y-2">
                          {record.courses.map((course, idx) => {
                            const isIncDrp = course.grade === "INC" || course.grade === "DRP";
                            const gradeNum = isIncDrp ? 5.0 : typeof course.grade === "number" ? course.grade : parseFloat(course.grade as string);
                            const isFailed = isIncDrp || gradeNum >= 5.0;

                            return (
                              <div
                                key={idx}
                                className={`flex items-center justify-between p-4 rounded-lg ${
                                  isFailed
                                    ? "bg-red-50 dark:bg-red-500/10 border-2 border-red-300 dark:border-red-500/30"
                                    : "bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10"
                                }`}
                              >
                                <div className="flex-1">
                                  <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">{course.course_code}</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{course.course_name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{course.credits} units</p>
                                </div>
                                <div className="text-right">
                                  {isIncDrp ? (
                                    <>
                                      <p className="text-3xl font-bold text-red-600 dark:text-red-400">{course.grade as string}</p>
                                      <span className="text-sm font-bold text-red-500 dark:text-red-400 block">FAILED</span>
                                    </>
                                  ) : (
                                    <>
                                      <p className={`text-3xl font-bold ${isFailed ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`}>
                                        {formatNumber(course.grade)}
                                      </p>
                                      {isFailed && <span className="text-sm font-bold text-red-500 dark:text-red-400 block">FAILED</span>}
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </details>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() => handleViewImage(record.academic_record_id)}
                          className="flex-1 min-w-[150px] px-4 py-2 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-500/30 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Image
                        </button>
                        <button
                          onClick={() => handleDownloadImage(record.academic_record_id)}
                          className="flex-1 min-w-[150px] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                        {record.verification_notes && (
                          <details className="flex-1 min-w-[200px]">
                            <summary className="px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-white/15 font-semibold text-sm cursor-pointer text-center">
                              View Verification Notes
                            </summary>
                            <div className="mt-2 p-3 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
                              <p className="text-sm text-gray-700 dark:text-gray-300">{record.verification_notes}</p>
                              {record.verification_date && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Verified on {formatDate(record.verification_date)}</p>
                              )}
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4" onClick={() => setViewingImage(null)}>
          <div className="relative max-w-6xl max-h-[90vh] bg-white dark:bg-[#1a1f2e] rounded-2xl p-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setViewingImage(null)} className="absolute -top-4 -right-4 bg-red-600 text-white rounded-full p-3 hover:bg-red-700 shadow-lg z-10">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img src={viewingImage} alt="Grade" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
          </div>
        </div>
      )}
    </>
  );
};

export default AthleteAcademicRecordsPage;