import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import EquipmentService from "../../../services/EquipmentService";
import type { EquipmentColumns } from "../../../interfaces/EquipmentInterface";

interface EquipmentListProps {
  onAddEquipment: () => void;
  onEditEquipment: (equipment: EquipmentColumns) => void;
  onDeleteEquipment: (equipment: EquipmentColumns) => void;
  onRequestEquipment: () => void;
  onViewRequests: () => void;
  onPrintApproved: () => void;
  onViewMyRequests: () => void;
  refreshKey: boolean;
}

const EquipmentList = ({
  onAddEquipment,
  onEditEquipment,
  onDeleteEquipment,
  onRequestEquipment,
  onViewRequests,
  onPrintApproved,
  onViewMyRequests,
  refreshKey,
}: EquipmentListProps) => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<EquipmentColumns[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<
    EquipmentColumns[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("All");

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const res = await EquipmentService.loadEquipment();
      if (res.status === 200) {
        setEquipment(res.data.equipment);
        setFilteredEquipment(res.data.equipment);
      }
    } catch (error) {
      console.error("Error loading equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, [refreshKey]);

  useEffect(() => {
    let filtered = equipment;
    if (selectedSport !== "All")
      filtered = filtered.filter((item) => item.sport === selectedSport);
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        const coachName = handleCoachFullNameFormat(item).toLowerCase();
        return (
          item.equipment_name.toLowerCase().includes(searchLower) ||
          item.sport.toLowerCase().includes(searchLower) ||
          item.condition.toLowerCase().includes(searchLower) ||
          coachName.includes(searchLower)
        );
      });
    }
    setFilteredEquipment(filtered);
  }, [searchTerm, selectedSport, equipment]);

  const uniqueSports = ["All", ...new Set(equipment.map((item) => item.sport))];

  const handleCoachFullNameFormat = (eq: EquipmentColumns) => {
    if (!eq.coach) return "Not Assigned";
    const coach = eq.coach;
    let fullName = coach.middle_name
      ? `${coach.first_name} ${coach.middle_name.charAt(0)}. ${coach.last_name}`
      : `${coach.first_name} ${coach.last_name}`;
    if (coach.suffix_name) fullName += ` ${coach.suffix_name}`;
    return fullName;
  };

  const getCoachSport = (eq: EquipmentColumns) =>
    eq.coach?.sports_coached || eq.sport || "N/A";

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "New":
        return "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300";
      case "Good":
        return "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300";
      case "Fair":
        return "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300";
      case "Poor":
        return "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-300";
    }
  };

  const getStockStatusColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage === 0) return "text-red-600 dark:text-red-400";
    if (percentage < 25) return "text-orange-600 dark:text-orange-400";
    if (percentage < 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className="-m-5 lg:-m-7">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] shadow-xl border-b-4 border-[#396B99] mt-7 mb-6">
        <div className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                Equipment Inventory
              </h1>
              <p className="text-blue-100 text-base font-medium">
                Manage sports equipment and track availability
              </p>
            </div>

            {/* Admin desktop buttons */}
            {user?.role === "Admin" && (
              <div className="hidden lg:flex items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                  onClick={onPrintApproved}
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
                  Print Approved
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                  onClick={onViewRequests}
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  View Requests
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-[#396B99] rounded-xl hover:bg-blue-50 font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                  onClick={onAddEquipment}
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
                  Add Equipment
                </button>
              </div>
            )}

            {/* Coach desktop buttons */}
            {user?.role === "Coach" && (
              <div className="hidden lg:flex items-center gap-3">
                <button
                  type="button"
                  className="flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                  onClick={onViewMyRequests}
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  My Requests
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-[#396B99] rounded-xl hover:bg-blue-50 font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                  onClick={onRequestEquipment}
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
                      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Request Equipment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] transition-colors duration-300">
        <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-gray-200 dark:border-white/5 overflow-hidden mb-8 transition-colors duration-300">
          {/* Search and Filter */}
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
                      placeholder="Search by Name / Coach / Sport / Condition"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="relative w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 dark:hover:border-white/20 transition-all font-medium shadow-sm hover:shadow-md bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-48">
                  <select
                    value={selectedSport}
                    onChange={(e) => setSelectedSport(e.target.value)}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-pointer font-medium shadow-sm hover:shadow-md bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200"
                  >
                    {uniqueSports.map((sport) => (
                      <option
                        key={sport}
                        value={sport}
                        className="dark:bg-[#1a1f2e]"
                      >
                        {sport === "All" ? "All Sports" : sport}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mobile buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                {user?.role === "Coach" && (
                  <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <button
                      onClick={onViewMyRequests}
                      className="lg:hidden flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      My Requests
                    </button>
                    <button
                      onClick={onRequestEquipment}
                      className="lg:hidden flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
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
                          d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Request Equipment
                    </button>
                  </div>
                )}

                {user?.role === "Admin" && (
                  <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <button
                      onClick={onPrintApproved}
                      className="lg:hidden flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
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
                      Print Approved
                    </button>
                    <button
                      onClick={onViewRequests}
                      className="lg:hidden flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      View Requests
                    </button>
                    <button
                      onClick={onAddEquipment}
                      className="lg:hidden flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
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
                      Add Equipment
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
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
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      Equipment Name
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
                      Coach
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    Total
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    Available
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    Damaged
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    Lost
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    Condition
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-[#1a1f2e] transition-colors duration-300">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="relative">
                          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-white/10"></div>
                          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 font-semibold mt-6 text-lg">
                          Loading equipment...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredEquipment.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-20 text-center">
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
                          No equipment found
                        </p>
                        <p className="text-gray-400 dark:text-gray-500">
                          Try adjusting your search or filter
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEquipment.map((item) => {
                    const stockColor = getStockStatusColor(
                      item.available_quantity,
                      item.total_quantity,
                    );
                    return (
                      <tr
                        key={item.equipment_id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-blue-500/5 dark:hover:via-indigo-500/5 dark:hover:to-purple-500/5 transition-all duration-300 group"
                      >
                        {/* Equipment Name */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110 duration-300">
                              <span className="text-white font-bold text-sm">
                                {item.equipment_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-gray-900 dark:text-white text-sm">
                                  {item.equipment_name}
                                </div>
                                {item.is_request_printed && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-500/20 dark:to-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-300 dark:border-emerald-500/30 shadow-sm">
                                    <svg
                                      className="w-3 h-3"
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
                                    Printed
                                  </span>
                                )}
                              </div>
                              {item.notes && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-xs truncate">
                                  {item.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Coach */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">
                              {handleCoachFullNameFormat(item)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {getCoachSport(item)}
                            </div>
                          </div>
                        </td>

                        {/* Total */}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {item.total_quantity}
                          </span>
                        </td>

                        {/* Available */}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className={`font-bold ${stockColor}`}>
                            {item.available_quantity}
                          </span>
                        </td>

                        {/* Damaged */}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span
                            className={`font-semibold ${item.damaged_quantity > 0 ? "text-orange-600 dark:text-orange-400" : "text-gray-400 dark:text-gray-500"}`}
                          >
                            {item.damaged_quantity}
                          </span>
                        </td>

                        {/* Lost */}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span
                            className={`font-semibold ${item.lost_quantity > 0 ? "text-red-600 dark:text-red-400" : "text-gray-400 dark:text-gray-500"}`}
                          >
                            {item.lost_quantity}
                          </span>
                        </td>

                        {/* Condition */}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm group-hover:shadow-md transition-all ${getConditionColor(item.condition)}`}
                          >
                            {item.condition}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onEditEquipment(item)}
                              title={user?.role === "Admin" ? "Edit" : "Update"}
                              className="p-2 bg-gradient-to-r from-emerald-100 via-emerald-200 to-teal-100 hover:from-emerald-200 hover:via-emerald-300 hover:to-teal-200 dark:from-emerald-500/20 dark:via-emerald-500/30 dark:to-teal-500/20 dark:hover:from-emerald-500/30 dark:hover:to-teal-500/30 text-emerald-700 dark:text-emerald-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
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
                            {user?.role === "Admin" && (
                              <button
                                onClick={() => onDeleteEquipment(item)}
                                title="Delete"
                                className="p-2 bg-gradient-to-r from-rose-100 via-red-200 to-pink-100 hover:from-rose-200 hover:via-red-300 hover:to-pink-200 dark:from-rose-500/20 dark:via-red-500/30 dark:to-pink-500/20 dark:hover:from-rose-500/30 dark:hover:to-pink-500/30 text-rose-700 dark:text-rose-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
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
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && filteredEquipment.length > 0 && (
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-[#1a1f2e] dark:via-[#1e2433] dark:to-[#1a1f2e] border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Showing{" "}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {filteredEquipment.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {equipment.length}
                  </span>{" "}
                  equipment items
                  {selectedSport !== "All" && (
                    <span className="ml-2">
                      • Filtered by:{" "}
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {selectedSport}
                      </span>
                    </span>
                  )}
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
  );
};

export default EquipmentList;
