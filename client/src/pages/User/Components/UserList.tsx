import { useEffect, useState, type FC } from "react";
import UserService from "../../../services/UserService";
import type { UserColumns } from "../../../interfaces/UserInterface";

interface UserListProps {
  onAddUser: () => void;
  onEditUser: (user: UserColumns | null) => void;
  onDeleteUser: (user: UserColumns | null) => void;
  refreshKey: boolean;
}

const UserList: FC<UserListProps> = ({
  onAddUser,
  onEditUser,
  onDeleteUser,
  refreshKey,
}) => {
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState<UserColumns[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const handleLoadUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await UserService.loadUsers();
      if (res.status === 200) {
        setUsers(res.data.users);
      } else {
        console.error(
          "Unexpected status error occurred during loading users: ",
          res.status,
        );
      }
    } catch (error) {
      console.error(
        "Unexpected server error occurred during loading users: ",
        error,
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserFullNameFormat = (user: UserColumns) => {
    let fullName = "";
    if (user.middle_name) {
      fullName = `${user.last_name}, ${user.first_name} ${user.middle_name.charAt(0)}.`;
    } else {
      fullName = `${user.last_name}, ${user.first_name}`;
    }
    if (user.suffix_name) {
      fullName += ` ${user.suffix_name}`;
    }
    return fullName;
  };

  // Builds all searchable name variations for a user
  const getUserSearchableText = (user: UserColumns): string => {
    const parts = [
      user.first_name,
      user.middle_name ?? "",
      user.last_name,
      user.suffix_name ?? "",
    ];

    // "First Middle Last"
    const fullNameNatural = parts.filter(Boolean).join(" ");

    // "Last, First M." (displayed format)
    const fullNameFormatted = handleUserFullNameFormat(user);

    // "First Last" (no middle name)
    const fullNameShort = `${user.first_name} ${user.last_name}`;

    // "Last First" (reversed without comma)
    const fullNameReversed = `${user.last_name} ${user.first_name}`;

    return [
      fullNameNatural,
      fullNameFormatted,
      fullNameShort,
      fullNameReversed,
      user.gender?.gender ?? "",
      user.birth_date,
    ]
      .join(" ")
      .toLowerCase();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-gradient-to-r from-red-100 via-red-200 to-rose-100 text-red-800 dark:from-red-500/20 dark:via-red-500/30 dark:to-rose-500/20 dark:text-red-300";
      case "Coach":
        return "bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 text-blue-800 dark:from-blue-500/20 dark:via-blue-500/30 dark:to-indigo-500/20 dark:text-blue-300";
      case "Athlete":
        return "bg-gradient-to-r from-green-100 via-green-200 to-emerald-100 text-green-800 dark:from-green-500/20 dark:via-green-500/30 dark:to-emerald-500/20 dark:text-green-300";
      default:
        return "bg-gradient-to-r from-gray-100 via-gray-200 to-slate-100 text-gray-800 dark:from-white/10 dark:via-white/15 dark:to-white/10 dark:text-gray-300";
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchableText = getUserSearchableText(user);

    // Split search term into individual words so "Christian Esico" matches
    // even when the name is stored as "Esico, Christian M."
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
    const matchesSearch =
      searchTerm.trim() === "" ||
      searchWords.every((word) => searchableText.includes(word));

    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    handleLoadUsers();
  }, [refreshKey]);

  return (
    <>
      <div className="-m-5 lg:-m-7">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] shadow-xl border-b-4 border-[#396B99] mt-7 mb-6">
          <div className="px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex items-center justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">
                  User Management
                </h1>
                <p className="text-blue-100 text-base font-medium">
                  Manage system users and their roles
                </p>
              </div>
              <button
                type="button"
                className="hidden lg:flex items-center gap-2 px-6 py-3 bg-white text-[#396B99] rounded-xl hover:bg-blue-50 font-bold shadow-lg transition-all duration-200 transform hover:scale-105"
                onClick={onAddUser}
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
                Add Admin
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
                  {/* Search Input */}
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
                        placeholder="Search by name, gender, or birth date..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="relative w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 dark:hover:border-white/20 transition-all font-medium shadow-sm hover:shadow-md bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Role Filter Dropdown */}
                  <div className="w-full lg:w-48">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full px-4 py-3.5 border-2 border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 dark:hover:border-white/20 transition-all cursor-pointer font-medium shadow-sm hover:shadow-md bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200"
                    >
                      <option value="All" className="dark:bg-[#1a1f2e]">
                        All Roles
                      </option>
                      <option value="Admin" className="dark:bg-[#1a1f2e]">
                        Admin
                      </option>
                      <option value="Coach" className="dark:bg-[#1a1f2e]">
                        Coach
                      </option>
                      <option value="Athlete" className="dark:bg-[#1a1f2e]">
                        Athlete
                      </option>
                    </select>
                  </div>
                </div>

                {/* Add User Button (Mobile) */}
                <button
                  type="button"
                  className="lg:hidden w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={onAddUser}
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
                  Add User
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
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                        Gender
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
                        Birth Date
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
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Age
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
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                        Role
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-[#1a1f2e] transition-colors duration-300">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-white/10"></div>
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 font-semibold mt-6 text-lg">
                            Loading users...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
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
                            No users found
                          </p>
                          <p className="text-gray-400 dark:text-gray-500">
                            Try adjusting your search or filter
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-blue-500/5 dark:hover:via-indigo-500/5 dark:hover:to-purple-500/5 transition-all duration-300 group"
                      >
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 dark:from-blue-500/20 dark:via-blue-500/30 dark:to-indigo-500/20 text-blue-800 dark:text-blue-300 text-xs font-bold shadow-sm group-hover:shadow-md transition-all">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3.5">
                            {user.profile_picture_url ? (
                              <img
                                src={user.profile_picture_url}
                                alt={`${user.first_name} ${user.last_name}`}
                                className="w-11 h-11 rounded-2xl object-cover shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110 duration-300"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = "none";
                                  const sibling =
                                    target.nextElementSibling as HTMLElement | null;
                                  if (sibling) sibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="w-11 h-11 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110 duration-300"
                              style={{
                                display: user.profile_picture_url
                                  ? "none"
                                  : "flex",
                              }}
                            >
                              <span className="text-white font-bold text-sm">
                                {user.first_name.charAt(0)}
                                {user.last_name.charAt(0)}
                              </span>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                              {handleUserFullNameFormat(user)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-left text-gray-700 dark:text-gray-300 font-semibold text-sm whitespace-nowrap">
                          {user.gender.gender}
                        </td>
                        <td className="px-6 py-4 text-left text-gray-700 dark:text-gray-300 font-medium text-sm whitespace-nowrap">
                          {user.birth_date}
                        </td>
                        <td className="px-6 py-4 text-left whitespace-nowrap">
                          <span className="inline-flex items-center px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-100 via-purple-200 to-pink-100 dark:from-purple-500/20 dark:via-purple-500/30 dark:to-pink-500/20 text-purple-800 dark:text-purple-300 text-xs font-bold shadow-sm group-hover:shadow-md transition-all">
                            {user.age}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-left whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm group-hover:shadow-md transition-all ${getRoleBadgeColor(user.role)}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              title="Edit"
                              className="p-2 bg-gradient-to-r from-blue-100 via-blue-200 to-indigo-100 hover:from-blue-200 hover:via-blue-300 hover:to-indigo-200 dark:from-blue-500/20 dark:via-blue-500/30 dark:to-indigo-500/20 dark:hover:from-blue-500/30 dark:hover:via-blue-500/40 dark:hover:to-indigo-500/30 text-blue-700 dark:text-blue-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                              onClick={() => onEditUser(user)}
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
                              type="button"
                              title="Delete"
                              className="p-2 bg-gradient-to-r from-rose-100 via-red-200 to-pink-100 hover:from-rose-200 hover:via-red-300 hover:to-pink-200 dark:from-rose-500/20 dark:via-red-500/30 dark:to-pink-500/20 dark:hover:from-rose-500/30 dark:hover:via-red-500/40 dark:hover:to-pink-500/30 text-rose-700 dark:text-rose-400 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                              onClick={() => onDeleteUser(user)}
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
            {!loadingUsers && filteredUsers.length > 0 && (
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-[#1a1f2e] dark:via-[#1e2433] dark:to-[#1a1f2e] border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Showing{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {filteredUsers.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {users.length}
                    </span>{" "}
                    users
                    {roleFilter !== "All" && (
                      <span className="ml-2">
                        • Filtered by:{" "}
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {roleFilter}
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
    </>
  );
};

export default UserList;
