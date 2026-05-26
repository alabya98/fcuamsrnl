import { useEffect, useState, useRef, type FC } from "react";
import CoachService from "../../../services/CoachService";
import type { CoachColumns } from "../../../interfaces/CoachInterface";
import CoachPrintButton from "../../../components/button/CoachPrintButton";
import PrintableCoachList from "./PrintableCoachList";
import Modal from "../../../components/Modal";
import ViewCoachAthletesModal from "./ViewCoachAthletesModal";

interface CoachListProps {
  onAddCoach: () => void;
  onEditCoach: (coach: CoachColumns) => void;
  onDeleteCoach: (coach: CoachColumns) => void;
  refreshKey: boolean;
}

const CoachList: FC<CoachListProps> = ({
  onAddCoach,
  onEditCoach,
  onDeleteCoach,
  refreshKey,
}) => {
  const [loading, setLoading] = useState(false);
  const [coaches, setCoaches] = useState<CoachColumns[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedCoach, setSelectedCoach] = useState<CoachColumns | null>(null);
  const [showAthletesModal, setShowAthletesModal] = useState(false);

  const handleLoadCoaches = async () => {
    try {
      setLoading(true);
      const res = await CoachService.loadCoaches();
      if (res.status === 200) {
        setCoaches(res.data.coaches);
      } else {
        console.error("Unexpected response status:", res.status);
      }
    } catch (error) {
      console.error("Error loading coaches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFullNameFormat = (coach: CoachColumns) => {
    let fullName = `${coach.first_name}`;
    if (coach.middle_name) fullName += ` ${coach.middle_name.charAt(0)}.`;
    fullName += ` ${coach.last_name}`;
    if (coach.suffix_name) fullName += ` ${coach.suffix_name}`;
    return `Coach ${fullName}`;
  };

  const handleViewCoachAthletes = (coach: CoachColumns) => {
    setSelectedCoach(coach);
    setShowAthletesModal(true);
  };

  const filteredCoaches = coaches.filter((coach) => {
    const fullName = handleFullNameFormat(coach).toLowerCase();
    const term = searchTerm.toLowerCase();
    return (
      fullName.includes(term) ||
      coach.sports_coached.toLowerCase().includes(term) ||
      coach.position.toLowerCase().includes(term) ||
      coach.staff_id.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    handleLoadCoaches();
  }, [refreshKey]);

  const renderCoachAvatar = (coach: CoachColumns) => {
    const profilePictureUrl = coach.user?.profile_picture_url;
    if (profilePictureUrl) {
      return (
        <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110 duration-300 flex-shrink-0">
          <img
            src={profilePictureUrl}
            alt={handleFullNameFormat(coach)}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `<div class="w-11 h-11 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span class="text-white font-bold text-sm">${coach.first_name.charAt(0)}${coach.last_name.charAt(0)}</span>
                </div>`;
              }
            }}
          />
        </div>
      );
    }
    return (
      <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110 duration-300 flex-shrink-0">
        <span className="text-white font-bold text-sm">
          {coach.first_name.charAt(0)}
          {coach.last_name.charAt(0)}
        </span>
      </div>
    );
  };

  return (
    <>
      <div className="-m-5 lg:-m-7">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] shadow-xl border-b-4 border-[#396B99] mt-7 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                  Coach Management
                </h1>
                <p className="text-blue-100 text-base font-medium">
                  Manage coaches, their sports, and contact information
                </p>
              </div>
              <button
                type="button"
                className="hidden lg:flex items-center gap-2 px-6 py-3 bg-white text-[#396B99] rounded-xl hover:bg-blue-50 font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                onClick={onAddCoach}
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Coach
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] transition-colors duration-300">
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-gray-200 dark:border-white/5 overflow-hidden mb-8 transition-colors duration-300">
            {/* Search and Filter Section */}
            <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-gradient-to-r from-white via-gray-50 to-white dark:from-[#1a1f2e] dark:via-[#1e2433] dark:to-[#1a1f2e] transition-colors duration-300">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-5 blur transition-opacity duration-300"></div>
                      <svg
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search by Name / Staff ID / Sports / Position"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="relative w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 dark:hover:border-white/20 transition-all font-medium shadow-sm hover:shadow-md bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <button
                    onClick={onAddCoach}
                    className="lg:hidden w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Coach
                  </button>

                  <div className="flex flex-wrap gap-3 sm:ml-auto">
                    <button
                      onClick={() => setShowPrintPreview(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
                          d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                        />
                      </svg>
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Table */}
            <div
              className="overflow-x-auto"
              style={{ maxHeight: "calc(90vh - 500px)", overflowY: "auto" }}
            >
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] sticky top-0 text-white z-10 shadow-lg">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 opacity-75"
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
                        Staff ID
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 opacity-75"
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
                        Full Name
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 opacity-75"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Position
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 opacity-75"
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
                        Sports
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 opacity-75"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Email
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-[#1a1f2e] transition-colors duration-300">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-white/10"></div>
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 font-semibold mt-6 text-lg">
                            Loading coaches...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredCoaches.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-20 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/5 dark:to-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                            <svg
                              className="w-12 h-12 text-gray-400 dark:text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                          </div>
                          <p className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                            No coaches found
                          </p>
                          <p className="text-gray-400 dark:text-gray-500">
                            Try adjusting your search criteria
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCoaches.map((coach) => (
                      <tr
                        key={coach.coach_id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-blue-500/5 dark:hover:via-indigo-500/5 dark:hover:to-purple-500/5 transition-all duration-300 group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 dark:from-blue-500/20 dark:via-blue-500/30 dark:to-indigo-500/20 text-blue-800 dark:text-blue-300 text-xs font-bold shadow-sm group-hover:shadow-md transition-all">
                            {coach.staff_id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewCoachAthletes(coach)}
                            className="flex items-center gap-3.5 hover:opacity-80 transition-opacity text-left w-full"
                          >
                            {renderCoachAvatar(coach)}
                            <span className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors underline decoration-dotted decoration-blue-400 underline-offset-4">
                              {handleFullNameFormat(coach)}
                            </span>
                          </button>
                        </td>
                        <td className="px-6 py-4 text-left text-gray-700 dark:text-gray-300 font-semibold text-sm whitespace-nowrap">
                          {coach.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-100 via-purple-200 to-pink-100 dark:from-purple-500/20 dark:via-purple-500/30 dark:to-pink-500/20 text-purple-800 dark:text-purple-300 text-xs font-bold shadow-sm group-hover:shadow-md transition-all">
                            {coach.sports_coached}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-300 text-sm">
                            <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-white/10 dark:to-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                            <span className="font-medium">
                              {coach.contact_email}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onEditCoach(coach)}
                              title="Edit"
                              className="p-2 bg-gradient-to-r from-emerald-100 via-emerald-200 to-teal-100 hover:from-emerald-200 hover:via-emerald-300 hover:to-teal-200 dark:from-emerald-500/20 dark:via-emerald-500/30 dark:to-teal-500/20 dark:hover:from-emerald-500/30 dark:hover:via-emerald-500/40 dark:hover:to-teal-500/30 text-emerald-700 dark:text-emerald-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => onDeleteCoach(coach)}
                              title="Delete"
                              className="p-2 bg-gradient-to-r from-rose-100 via-red-200 to-pink-100 hover:from-rose-200 hover:via-red-300 hover:to-pink-200 dark:from-rose-500/20 dark:via-red-500/30 dark:to-pink-500/20 dark:hover:from-rose-500/30 dark:hover:via-red-500/40 dark:hover:to-pink-500/30 text-rose-700 dark:text-rose-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Results Summary */}
            {!loading && filteredCoaches.length > 0 && (
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-[#1a1f2e] dark:via-[#1e2433] dark:to-[#1a1f2e] border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Showing{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {filteredCoaches.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {coaches.length}
                    </span>{" "}
                    coaches
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Live Data</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Preview Modal */}
      <Modal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        size="large"
      >
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-[#1a1f2e] dark:to-[#141720] p-8 rounded-2xl">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200 dark:border-white/10">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-1">
                Coaches Report
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Preview and download your report
              </p>
            </div>
            <CoachPrintButton
              coaches={filteredCoaches}
              documentTitle={`Coaches_Report_${new Date().toISOString().split("T")[0]}`}
            />
          </div>
          <div className="border-2 border-gray-300 dark:border-white/10 rounded-2xl overflow-hidden max-h-[65vh] overflow-y-auto bg-white dark:bg-[#1a1f2e] shadow-2xl">
            <PrintableCoachList ref={printRef} coaches={filteredCoaches} />
          </div>
        </div>
      </Modal>

      {/* View Coach Athletes Modal */}
      <ViewCoachAthletesModal
        coach={selectedCoach}
        isOpen={showAthletesModal}
        onClose={() => {
          setShowAthletesModal(false);
          setSelectedCoach(null);
        }}
      />
    </>
  );
};

export default CoachList;
