import { useEffect, useState } from "react";
import type { FC } from "react";
import Modal from "../../../components/Modal";
import RecordService from "../../../services/RecordService";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";
import type { RecordColumns } from "../../../interfaces/RecordInterface";

interface ViewAthleteRecordsModalProps {
  athlete: AthleteColumns;
  isOpen: boolean;
  onClose: () => void;
}

const ViewAthleteRecordsModal: FC<ViewAthleteRecordsModalProps> = ({
  athlete,
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<RecordColumns[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [competitionFilter, setCompetitionFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");

  const loadAthleteRecords = async () => {
    try {
      setLoading(true);
      const res = await RecordService.loadRecords();

      if (res.status === 200) {
        const athleteRecords = res.data.records.filter(
          (record: RecordColumns) => record.athlete_id === athlete.athlete_id,
        );
        setRecords(athleteRecords);
      }
    } catch (error) {
      console.error("Error loading athlete records:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatFullName = (athlete: AthleteColumns) => {
    let fullName = "";
    if (athlete.middle_name) {
      fullName = `${athlete.first_name} ${athlete.middle_name.charAt(0)}. ${athlete.last_name}`;
    } else {
      fullName = `${athlete.first_name} ${athlete.last_name}`;
    }
    if (athlete.suffix_name) {
      fullName += ` ${athlete.suffix_name}`;
    }
    return fullName;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.achievement.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompetition =
      competitionFilter === "All" ||
      record.competition_level === competitionFilter;

    const matchesYear =
      yearFilter === "All" || record.year.toString() === yearFilter;

    return matchesSearch && matchesCompetition && matchesYear;
  });

  const uniqueYears = Array.from(
    new Set(records.map((record) => record.year)),
  ).sort((a, b) => b - a);

  const getAchievementBadgeClass = (achievement: string) => {
    if (
      achievement.includes("Gold") ||
      achievement.includes("1st") ||
      achievement.includes("Champion")
    ) {
      return "bg-gradient-to-r from-yellow-100 via-yellow-200 to-amber-100 text-yellow-800";
    } else if (
      achievement.includes("Silver") ||
      achievement.includes("2nd") ||
      achievement.includes("Runner-up")
    ) {
      return "bg-gradient-to-r from-gray-100 via-gray-200 to-slate-100 text-gray-800";
    } else if (achievement.includes("Bronze") || achievement.includes("3rd")) {
      return "bg-gradient-to-r from-orange-100 via-orange-200 to-amber-100 text-orange-800";
    } else if (achievement.includes("MVP") || achievement.includes("Best")) {
      return "bg-gradient-to-r from-purple-100 via-purple-200 to-pink-100 text-purple-800";
    } else {
      return "bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 text-blue-800";
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAthleteRecords();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-extrabold text-gray-800">
              Athlete Records
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-500"
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
          <p className="text-gray-600 font-medium">
            Viewing records for{" "}
            <span className="font-bold text-blue-600">
              {formatFullName(athlete)}
            </span>
          </p>
        </div>

        {/* Stats Cards */}
        {!loading && records.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 border-2 border-yellow-200">
              <p className="text-xs text-yellow-700 font-bold uppercase tracking-wide">
                Total Records
              </p>
              <p className="text-3xl font-extrabold text-yellow-900 mt-2">
                {filteredRecords.length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border-2 border-green-200">
              <p className="text-xs text-green-700 font-bold uppercase tracking-wide">
                Gold Medals
              </p>
              <p className="text-3xl font-extrabold text-green-900 mt-2">
                {
                  filteredRecords.filter((r) => r.achievement.includes("Gold"))
                    .length
                }
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border-2 border-blue-200">
              <p className="text-xs text-blue-700 font-bold uppercase tracking-wide">
                Championships
              </p>
              <p className="text-3xl font-extrabold text-blue-900 mt-2">
                {
                  filteredRecords.filter((r) =>
                    r.achievement.includes("Champion"),
                  ).length
                }
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border-2 border-purple-200">
              <p className="text-xs text-purple-700 font-bold uppercase tracking-wide">
                MVP Awards
              </p>
              <p className="text-3xl font-extrabold text-purple-900 mt-2">
                {
                  filteredRecords.filter((r) => r.achievement.includes("MVP"))
                    .length
                }
              </p>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative group">
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200"
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
                  placeholder="Search by Event / Venue / Achievement"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all font-medium shadow-sm hover:shadow-md"
                />
              </div>
            </div>

            <div className="w-full lg:w-52">
              <select
                value={competitionFilter}
                onChange={(e) => setCompetitionFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all cursor-pointer font-medium shadow-sm hover:shadow-md"
              >
                <option value="All">All Competitions</option>
                <option value="Training">Training</option>
                <option value="Tournament">Tournament</option>
                <option value="Competition">Competition</option>
                <option value="Tryout">Tryout</option>
                <option value="Meeting">Meeting</option>
                <option value="Founders">Founders</option>
                <option value="CAPRISAA">CAPRISAA</option>
                <option value="Nationals">Nationals</option>
                <option value="Regionals">Regionals</option>
                <option value="Inter-School">Inter-School</option>
                <option value="Provincial">Provincial</option>
                <option value="City Meet">City Meet</option>
                <option value="Invitational">Invitational</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="w-full lg:w-52">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-all cursor-pointer font-medium shadow-sm hover:shadow-md"
              >
                <option value="All">All Years</option>
                {uniqueYears.map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div
            className="overflow-x-auto"
            style={{ maxHeight: "650px", overflowY: "auto" }}
          >
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] sticky top-0 text-white z-10">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Event Name
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
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                      Competition
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Venue
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
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Achievement
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
                      Date
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    Year
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                        </div>
                        <p className="text-gray-600 font-semibold mt-6 text-lg">
                          Loading records...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                          <svg
                            className="w-12 h-12 text-gray-400"
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
                        <p className="text-xl font-bold text-gray-700 mb-2">
                          No records found
                        </p>
                        <p className="text-gray-400">
                          {records.length === 0
                            ? "This athlete has no recorded achievements yet"
                            : "Try adjusting your search or filters"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr
                      key={record.record_id}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 transition-all duration-300 group"
                    >
                      <td className="px-6 py-4 text-left whitespace-nowrap">
                        <span className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">
                          {record.event_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left text-gray-700 font-semibold text-sm whitespace-nowrap">
                        {record.competition_level}
                      </td>
                      <td className="px-6 py-4 text-left text-gray-700 font-medium text-sm whitespace-nowrap">
                        {record.venue}
                      </td>
                      <td className="px-6 py-4 text-left whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm group-hover:shadow-md transition-all ${getAchievementBadgeClass(
                            record.achievement,
                          )}`}
                        >
                          {record.achievement}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-left text-gray-700 font-medium text-sm whitespace-nowrap">
                        {formatDate(record.event_date)}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 text-blue-800 text-xs font-bold shadow-sm group-hover:shadow-md transition-all">
                          {record.year}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && filteredRecords.length > 0 && (
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 font-medium">
                  Showing{" "}
                  <span className="font-bold text-gray-900">
                    {filteredRecords.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-gray-900">
                    {records.length}
                  </span>{" "}
                  records
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Live Data</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewAthleteRecordsModal;
