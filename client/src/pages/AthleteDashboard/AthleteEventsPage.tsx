import AthleteEventsView from "./Components/AthleteEventsView";

const AthleteEventsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-[#0f1117] dark:via-[#141720] dark:to-[#0f1117] transition-colors duration-300">
      {/* Header Banner */}
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                Events
              </h1>
              <p className="text-blue-100 text-base font-medium">
                Your scheduled competitions and events
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Events View Component */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <AthleteEventsView />
      </div>
    </div>
  );
};

export default AthleteEventsPage;
