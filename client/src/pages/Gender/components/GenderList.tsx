import type { FC } from "react";
import type { GenderColumns } from "../../../interfaces/GenderInterface";

interface GenderListProps {
  genders: GenderColumns[];
  loading: boolean;
  onEdit: (gender: GenderColumns) => void;
  onDelete: (gender: GenderColumns) => void;
}

const GenderList: FC<GenderListProps> = ({
  genders,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl border border-gray-200 dark:border-white/5 p-16 transition-colors duration-300">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-white/10"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-semibold mt-6 text-lg">
            Loading genders...
          </p>
        </div>
      </div>
    );
  }

  if (genders.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl border border-gray-200 dark:border-white/5 p-20 transition-colors duration-300">
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <p className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            No Gender Categories Found
          </p>
          <p className="text-gray-400 dark:text-gray-500">
            Get started by adding your first gender category
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-xl dark:shadow-black/30 border border-gray-200 dark:border-white/5 overflow-hidden transition-colors duration-300">
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  Gender Category
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
            {genders.map((gender, index) => (
              <tr
                key={gender.gender_id}
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-blue-500/5 dark:hover:via-indigo-500/5 dark:hover:to-purple-500/5 transition-all duration-300 group"
              >
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <span className="inline-flex items-center px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 dark:from-blue-500/20 dark:via-blue-500/30 dark:to-indigo-500/20 text-blue-800 dark:text-blue-300 text-xs font-bold shadow-sm group-hover:shadow-md transition-all">
                    {index + 1}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110 duration-300 ${
                        gender.gender.toLowerCase() === "male"
                          ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500"
                          : "bg-gradient-to-br from-pink-500 via-rose-500 to-red-500"
                      }`}
                    >
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                      {gender.gender}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 text-left text-gray-700 dark:text-gray-300 font-medium text-sm whitespace-nowrap">
                  {new Date(gender.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>

                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      onClick={() => onEdit(gender)}
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
                      onClick={() => onDelete(gender)}
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Results Summary */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-[#1a1f2e] dark:via-[#1e2433] dark:to-[#1a1f2e] border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Showing{" "}
            <span className="font-bold text-gray-900 dark:text-white">
              {genders.length}
            </span>{" "}
            gender {genders.length === 1 ? "category" : "categories"}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live Data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenderList;
