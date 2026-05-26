import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ToastMessage from "../../components/ToastMessage/ToastMessage";
import { useToastMessage } from "../../hooks/useToastMessage";
import { useRefresh } from "../../hooks/useRefresh";
import AddSportModal from "./Components/AddSportModal";
import EditSportModal from "./Components/EditSportModal";
import DeleteSportModal from "./Components/DeleteSportModal";
import SportService from "../../services/SportService";
import AthleteService from "../../services/AthleteService";
import type { SportColumns } from "../../interfaces/SportInterface";

const SportMainPage = () => {
  const location = useLocation();
  const [sports, setSports] = useState<SportColumns[]>([]);
  const [sportStats, setSportStats] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSport, setSelectedSport] = useState<SportColumns | null>(null);

  const {
    message: toastMessage,
    isVisible: toastMessageIsVisible,
    showToastMessage,
    closeToastMessage,
  } = useToastMessage("", false);
  const { refresh, handleRefresh } = useRefresh(false);

  const loadSports = async () => {
    try {
      setLoading(true);
      const res = await SportService.loadSports();
      if (res.status === 200) setSports(res.data.sports);
    } catch (error) {
      console.error("Error loading sports:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSportStats = async () => {
    try {
      const res = await AthleteService.loadAthletes();
      if (res.status === 200) {
        const athletes = res.data.athletes;
        const stats: { [key: string]: number } = {};
        sports.forEach((sport) => {
          stats[sport.sport] = athletes.filter(
            (a: any) => a.sport === sport.sport,
          ).length;
        });
        setSportStats(stats);
      }
    } catch (error) {
      console.error("Error loading sport statistics:", error);
    }
  };

  useEffect(() => {
    document.title = "Sports Management - FAMS";
    loadSports();
  }, [refresh]);

  useEffect(() => {
    if (sports.length > 0) loadSportStats();
  }, [sports]);

  useEffect(() => {
    if (location.state?.message) {
      showToastMessage(location.state.message);
      handleRefresh();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleEditSport = (sport: SportColumns) => {
    setSelectedSport(sport);
    setIsEditModalOpen(true);
  };
  const handleDeleteSport = (sport: SportColumns) => {
    setSelectedSport(sport);
    setIsDeleteModalOpen(true);
  };

  const totalSports = sports.length;
  const totalAthletes = Object.values(sportStats).reduce(
    (sum, count) => sum + count,
    0,
  );
  const topSports = Object.entries(sportStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);

  return (
    <>
      <ToastMessage
        message={toastMessage}
        isVisible={toastMessageIsVisible}
        onClose={closeToastMessage}
      />

      <div className="-m-5 lg:-m-7">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] shadow-xl border-b-4 border-[#396B99] mt-7 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                  Sports List
                </h1>
                <p className="text-blue-100 text-base font-medium">
                  Manage and organize all sports programs
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="hidden lg:flex items-center gap-2 px-6 py-3 bg-white text-[#396B99] rounded-xl hover:bg-blue-50 font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
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
                Add New Sport
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] transition-colors duration-300">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-200 border-2 border-blue-400">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
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
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-wide mb-1">
                Total Sports
              </p>
              <p className="text-4xl font-extrabold mb-1">{totalSports}</p>
              <p className="text-blue-100 text-sm font-medium">
                Active programs
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-200 border-2 border-green-400">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-green-100 text-xs font-bold uppercase tracking-wide mb-1">
                Total Athletes
              </p>
              <p className="text-4xl font-extrabold mb-1">{totalAthletes}</p>
              <p className="text-green-100 text-sm font-medium">
                Across all sports
              </p>
            </div>

            {topSports.map(([sportName, count], index) => {
              const colors = [
                "from-purple-500 to-purple-600 border-purple-400",
                "from-orange-500 to-orange-600 border-orange-400",
              ];
              return (
                <div
                  key={sportName}
                  className={`bg-gradient-to-br ${colors[index]} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-200 border-2`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
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
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    </div>
                  </div>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-wide mb-1 truncate">
                    {sportName}
                  </p>
                  <p className="text-4xl font-extrabold mb-1">{count}</p>
                  <p className="text-white/80 text-sm font-medium">
                    {count === 1 ? "Athlete" : "Athletes"}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-gray-200 dark:border-white/5 overflow-hidden mb-8 transition-colors duration-300">
            {/* Section Header */}
            <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-gradient-to-r from-white via-gray-50 to-white dark:from-[#1a1f2e] dark:via-[#1e2433] dark:to-[#1a1f2e] transition-colors duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                    Sports Programs
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage and organize all sports programs
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(true)}
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
                  Add New Sport
                </button>
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
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
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
                            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                          />
                        </svg>
                        No.
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
                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Sport Name
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Athletes
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Date Created
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
                      <td colSpan={5} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-white/10"></div>
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 font-semibold mt-6 text-lg">
                            Loading sports...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : sports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-20 text-center">
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
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                              />
                            </svg>
                          </div>
                          <p className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                            No Sports Found
                          </p>
                          <p className="text-gray-400 dark:text-gray-500">
                            Get started by adding your first sport program
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sports.map((sport, index) => {
                      const athleteCount = sportStats[sport.sport] || 0;
                      return (
                        <tr
                          key={sport.sport_id}
                          className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-blue-500/5 dark:hover:via-indigo-500/5 dark:hover:to-purple-500/5 transition-all duration-300 group"
                        >
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 dark:from-blue-500/20 dark:via-blue-500/30 dark:to-indigo-500/20 text-blue-800 dark:text-blue-300 text-xs font-bold shadow-sm group-hover:shadow-md transition-all">
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3.5">
                              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110 duration-300">
                                <svg
                                  className="w-5 h-5 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <span className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                                {sport.sport}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-green-100 via-green-200 to-emerald-100 dark:from-green-500/20 dark:via-green-500/30 dark:to-emerald-500/20 text-green-800 dark:text-green-300 text-xs font-bold shadow-sm group-hover:shadow-md transition-all">
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
                                  d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                                />
                              </svg>
                              {athleteCount}{" "}
                              {athleteCount === 1 ? "Athlete" : "Athletes"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-left text-gray-700 dark:text-gray-300 font-medium text-sm whitespace-nowrap">
                            {new Date(sport.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2.5">
                              <button
                                onClick={() => handleEditSport(sport)}
                                className="px-4 py-2.5 bg-gradient-to-r from-emerald-100 via-emerald-200 to-teal-100 hover:from-emerald-200 hover:via-emerald-300 hover:to-teal-200 dark:from-emerald-500/20 dark:via-emerald-500/30 dark:to-teal-500/20 dark:hover:from-emerald-500/30 dark:hover:to-teal-500/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-1.5"
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
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteSport(sport)}
                                className="px-4 py-2.5 bg-gradient-to-r from-rose-100 via-red-200 to-pink-100 hover:from-rose-200 hover:via-red-300 hover:to-pink-200 dark:from-rose-500/20 dark:via-red-500/30 dark:to-pink-500/20 dark:hover:from-rose-500/30 dark:hover:to-pink-500/30 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-1.5"
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
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Results Summary */}
            {!loading && sports.length > 0 && (
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-[#1a1f2e] dark:via-[#1e2433] dark:to-[#1a1f2e] border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Total:{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {sports.length}
                    </span>{" "}
                    sport{sports.length !== 1 ? " programs" : " program"} •{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {totalAthletes}
                    </span>{" "}
                    total {totalAthletes === 1 ? "athlete" : "athletes"}
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

      {/* Modals */}
      <AddSportModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSportAdded={(message) => {
          showToastMessage(message);
          handleRefresh();
        }}
      />
      <EditSportModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSport(null);
        }}
        sport={selectedSport}
        onSportUpdated={(message) => {
          showToastMessage(message);
          handleRefresh();
        }}
      />
      <DeleteSportModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedSport(null);
        }}
        sport={selectedSport}
        onSportDeleted={(message) => {
          showToastMessage(message);
          handleRefresh();
        }}
      />
    </>
  );
};

export default SportMainPage;
