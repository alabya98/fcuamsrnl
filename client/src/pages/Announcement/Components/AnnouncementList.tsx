import { useEffect, useState, type FC } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import AnnouncementService from "../../../services/AnnouncementService";
import type { AnnouncementColumns } from "../../../interfaces/AnnouncementInterface";

interface AnnouncementListProps {
  onAddAnnouncement?: () => void;
  onEditAnnouncement?: (announcement: AnnouncementColumns) => void;
  onDeleteAnnouncement?: (announcement: AnnouncementColumns) => void;
  onViewAnnouncement: (announcement: AnnouncementColumns) => void;
  refreshKey: boolean;
  isReadOnly?: boolean;
}

const AnnouncementList: FC<AnnouncementListProps> = ({
  onAddAnnouncement,
  onEditAnnouncement,
  onDeleteAnnouncement,
  onViewAnnouncement,
  refreshKey,
  isReadOnly = false,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementColumns[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLoadAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await AnnouncementService.loadAnnouncements();
      if (res.status === 200) {
        setAnnouncements(res.data.announcements);
      } else {
        console.error("Unexpected status error:", res.status);
      }
    } catch (error) {
      console.error("Unexpected server error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleLoadAnnouncements();
  }, [refreshKey]);

  const filteredAnnouncements = announcements.filter((announcement) => {
    const query = searchQuery.toLowerCase();
    return (
      announcement.title.toLowerCase().includes(query) ||
      announcement.announcement_type.toLowerCase().includes(query) ||
      announcement.target_audience.toLowerCase().includes(query) ||
      announcement.priority.toLowerCase().includes(query)
    );
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-gradient-to-r from-red-100 via-red-200 to-rose-100 dark:from-red-500/20 dark:via-red-500/30 dark:to-rose-500/20 text-red-800 dark:text-red-300";
      case "Medium":
        return "bg-gradient-to-r from-yellow-100 via-yellow-200 to-amber-100 dark:from-yellow-500/20 dark:via-yellow-500/30 dark:to-amber-500/20 text-yellow-800 dark:text-yellow-300";
      case "Low":
        return "bg-gradient-to-r from-green-100 via-green-200 to-emerald-100 dark:from-green-500/20 dark:via-green-500/30 dark:to-emerald-500/20 text-green-800 dark:text-green-300";
      default:
        return "bg-gradient-to-r from-gray-100 via-gray-200 to-slate-100 dark:from-white/10 dark:via-white/15 dark:to-white/10 text-gray-800 dark:text-gray-300";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Urgent":
        return "bg-gradient-to-r from-red-100 via-red-200 to-rose-100 dark:from-red-500/20 dark:via-red-500/30 dark:to-rose-500/20 text-red-800 dark:text-red-300";
      case "Event":
        return "bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 dark:from-blue-500/20 dark:via-blue-500/30 dark:to-indigo-500/20 text-blue-800 dark:text-blue-300";
      case "Reminder":
        return "bg-gradient-to-r from-orange-100 via-orange-200 to-amber-100 dark:from-orange-500/20 dark:via-orange-500/30 dark:to-amber-500/20 text-orange-800 dark:text-orange-300";
      default:
        return "bg-gradient-to-r from-gray-100 via-gray-200 to-slate-100 dark:from-white/10 dark:via-white/15 dark:to-white/10 text-gray-800 dark:text-gray-300";
    }
  };

  const canModifyAnnouncement = (announcement: AnnouncementColumns) => {
    if (user?.role === "Admin") return true;
    if (user?.role === "Coach" && announcement.created_by === user.user_id)
      return true;
    return false;
  };

  const colSpan = user?.role === "Coach" ? 8 : 7;

  return (
    <>
      <div className="-m-5 lg:-m-7">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] shadow-xl border-b-4 border-[#396B99] mt-7 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                  {isReadOnly ? "View Announcements" : "Announcements"}
                </h1>
                <p className="text-blue-100 text-base font-medium">
                  {isReadOnly
                    ? "Stay updated with the latest announcements"
                    : "Manage and publish announcements"}
                </p>
              </div>
              {!isReadOnly && onAddAnnouncement && (
                <button
                  type="button"
                  className="hidden lg:flex items-center gap-2 px-6 py-3 bg-white text-[#396B99] rounded-xl hover:bg-blue-50 font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                  onClick={onAddAnnouncement}
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
                  Add Announcement
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] transition-colors duration-300">
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-gray-200 dark:border-white/5 overflow-hidden mb-8 transition-colors duration-300">
            {/* Search Section */}
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
                        placeholder="Search announcements..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="relative w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 dark:hover:border-white/20 transition-all font-medium shadow-sm hover:shadow-md bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {!isReadOnly && onAddAnnouncement && (
                  <button
                    onClick={onAddAnnouncement}
                    className="lg:hidden w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
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
                    Add Announcement
                  </button>
                )}
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
                            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                          />
                        </svg>
                        Title
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
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        Type
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
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        Priority
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
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Audience
                      </div>
                    </th>
                    {user?.role === "Coach" && (
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
                          Creator
                        </div>
                      </th>
                    )}
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
                        Publish Date
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-[#1a1f2e] transition-colors duration-300">
                  {loading ? (
                    <tr>
                      <td colSpan={colSpan} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-white/10"></div>
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 font-semibold mt-6 text-lg">
                            Loading announcements...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredAnnouncements.length === 0 ? (
                    <tr>
                      <td colSpan={colSpan} className="px-4 py-20 text-center">
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
                            No announcements found
                          </p>
                          <p className="text-gray-400 dark:text-gray-500">
                            Try adjusting your search
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAnnouncements.map((announcement) => (
                      <tr
                        key={announcement.announcement_id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-blue-500/5 dark:hover:via-indigo-500/5 dark:hover:to-purple-500/5 transition-all duration-300 group"
                      >
                        <td className="px-6 py-4 text-left whitespace-nowrap">
                          <span className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                            {announcement.title}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm group-hover:shadow-md transition-all ${getTypeColor(announcement.announcement_type)}`}
                          >
                            {announcement.announcement_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm group-hover:shadow-md transition-all ${getPriorityColor(announcement.priority)}`}
                          >
                            {announcement.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left text-gray-700 dark:text-gray-300 font-semibold text-sm whitespace-nowrap">
                          {announcement.target_audience}
                          {announcement.target_sport && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                              ({announcement.target_sport})
                            </span>
                          )}
                        </td>
                        {user?.role === "Coach" && (
                          <td className="px-6 py-4 text-left whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm group-hover:shadow-md transition-all ${
                                announcement.creator_role === "Admin"
                                  ? "bg-gradient-to-r from-purple-100 via-purple-200 to-pink-100 dark:from-purple-500/20 dark:via-purple-500/30 dark:to-pink-500/20 text-purple-800 dark:text-purple-300"
                                  : "bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 dark:from-blue-500/20 dark:via-blue-500/30 dark:to-indigo-500/20 text-blue-800 dark:text-blue-300"
                              }`}
                            >
                              {announcement.creator_role}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4 text-left text-gray-700 dark:text-gray-300 font-medium text-sm whitespace-nowrap">
                          {new Date(
                            announcement.publish_date,
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm group-hover:shadow-md transition-all ${
                              announcement.is_published
                                ? "bg-gradient-to-r from-green-100 via-green-200 to-emerald-100 dark:from-green-500/20 dark:via-green-500/30 dark:to-emerald-500/20 text-green-800 dark:text-green-300"
                                : "bg-gradient-to-r from-gray-100 via-gray-200 to-slate-100 dark:from-white/10 dark:via-white/15 dark:to-white/10 text-gray-800 dark:text-gray-300"
                            }`}
                          >
                            {announcement.is_published ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onViewAnnouncement(announcement)}
                              title="View"
                              className="p-2 bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 hover:from-blue-200 hover:via-blue-300 hover:to-indigo-200 dark:from-blue-500/20 dark:via-blue-500/30 dark:to-indigo-500/20 dark:hover:from-blue-500/30 dark:hover:to-indigo-500/30 text-blue-700 dark:text-blue-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
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
                            </button>

                            {!isReadOnly &&
                              canModifyAnnouncement(announcement) && (
                                <>
                                  {onEditAnnouncement && (
                                    <button
                                      onClick={() =>
                                        onEditAnnouncement(announcement)
                                      }
                                      title="Edit"
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
                                  )}
                                  {onDeleteAnnouncement && (
                                    <button
                                      onClick={() =>
                                        onDeleteAnnouncement(announcement)
                                      }
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
                                </>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Results Summary */}
            {!loading && filteredAnnouncements.length > 0 && (
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-[#1a1f2e] dark:via-[#1e2433] dark:to-[#1a1f2e] border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Showing{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {filteredAnnouncements.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {announcements.length}
                    </span>{" "}
                    announcements
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
    </>
  );
};

export default AnnouncementList;
