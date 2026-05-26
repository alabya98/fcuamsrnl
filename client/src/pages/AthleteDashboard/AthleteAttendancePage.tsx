import AthleteAttendanceView from "./Components/AthleteAttendanceView";

const AthleteAttendancePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] transition-colors duration-300">
      <div className="bg-gradient-to-r from-[#396B99] via-[#2d5577] to-[#396B99] shadow-xl border-b-4 border-[#396B99]">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                Attendance Records
              </h1>
              <p className="text-blue-100 text-base font-medium">
                Track your attendance history and statistics
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <AthleteAttendanceView />
      </div>
    </div>
  );
};

export default AthleteAttendancePage;
