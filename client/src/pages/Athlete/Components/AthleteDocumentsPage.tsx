import { useEffect, useState } from "react";
import AthleteProfileService from "../../../services/AthleteProfileService";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";
import DocumentUploadSection from "../Components/DocumentUploadSection";

const AthleteDocumentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [athlete, setAthlete] = useState<AthleteColumns | null>(null);

  const loadAthleteProfile = async () => {
    try {
      setLoading(true);
      const res = await AthleteProfileService.getMyProfile();
      if (res.status === 200) setAthlete(res.data.athlete);
    } catch (error) {
      console.error("Error loading athlete profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAthleteProfile();
  }, []);

  const getDocStatusColor = (status: string) => {
    if (status === "Approved") return "text-green-600 dark:text-green-400";
    if (status === "Pending Review")
      return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-white/10"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-semibold mt-6 text-lg">
            Loading your documents...
          </p>
        </div>
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-red-600 dark:text-red-400"
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
          </div>
          <p className="text-xl font-bold text-gray-700 dark:text-white mb-4">
            Profile not found
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Please contact your administrator
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <svg
                className="w-8 h-8 text-white"
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
            <div>
              <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">
                My Documents
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 font-medium">
                Upload and manage your athletic documents
              </p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border-2 border-blue-200 dark:border-blue-500/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                  Document Requirements
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {[
                    {
                      icon: "check",
                      color: "text-green-600 dark:text-green-400",
                      text: (
                        <>
                          <strong>Parent Consent Letter:</strong> Required for
                          all athletes under 18
                        </>
                      ),
                    },
                    {
                      icon: "check",
                      color: "text-green-600 dark:text-green-400",
                      text: (
                        <>
                          <strong>School ID:</strong> Front and back sides of
                          your school identification
                        </>
                      ),
                    },
                    {
                      icon: "check",
                      color: "text-green-600 dark:text-green-400",
                      text: (
                        <>
                          <strong>Medical Records:</strong> Physical exams,
                          injury reports, and medical clearances
                        </>
                      ),
                    },
                    {
                      icon: "info",
                      color: "text-blue-600 dark:text-blue-400",
                      text: (
                        <>
                          <strong>File Format:</strong> PDF, JPG, PNG, DOC, or
                          DOCX (Max 10MB)
                        </>
                      ),
                    },
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <svg
                        className={`w-5 h-5 ${item.color} flex-shrink-0`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        {item.icon === "check" ? (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        ) : (
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        )}
                      </svg>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* School ID */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-6 border-2 border-gray-100 dark:border-white/5 transition-colors duration-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                School ID
              </h3>
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
            </div>
            <p
              className={`text-2xl font-extrabold ${getDocStatusColor(athlete.valid_id)}`}
            >
              {athlete.valid_id}
            </p>
          </div>

          {/* Parent Consent */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-6 border-2 border-gray-100 dark:border-white/5 transition-colors duration-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Parent Consent
              </h3>
              <svg
                className="w-5 h-5 text-purple-600 dark:text-purple-400"
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
            <p
              className={`text-2xl font-extrabold ${getDocStatusColor(athlete.parent_consent)}`}
            >
              {athlete.parent_consent}
            </p>
          </div>

          {/* Medical Docs */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-6 border-2 border-gray-100 dark:border-white/5 transition-colors duration-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Medical Docs
              </h3>
              <svg
                className="w-5 h-5 text-pink-600 dark:text-pink-400"
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
            <p className="text-2xl font-extrabold text-gray-800 dark:text-white">
              {(athlete as any).medical_documents_count || 0}{" "}
              <span className="text-base font-medium text-gray-500 dark:text-gray-400">
                uploaded
              </span>
            </p>
          </div>
        </div>

        {/* Document Upload Section */}
        <DocumentUploadSection
          athlete={athlete}
          onDocumentUpdated={loadAthleteProfile}
        />

        {/* Help Section */}
        <div className="mt-8 bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-6 border-2 border-gray-100 dark:border-white/5 transition-colors duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-amber-600 dark:text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                Need Help?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                If you have questions about which documents to upload or need
                assistance, please contact your coach or the athletic department
                administrator.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                  📧 Contact Coach
                </span>
                <span className="px-3 py-1.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">
                  📞 Athletic Office
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteDocumentsPage;
