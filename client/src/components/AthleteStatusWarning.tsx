import { useEffect, useState } from "react";
import AthleteService from "../services/AthleteService";
import { useAuth } from "../contexts/AuthContext";

interface AthleteStatusData {
  needs_warning: boolean;
  warning_type: string;
  warning_message: string;
  consecutive_absences: number;
  athlete_status: string;
}

const AthleteStatusWarning = () => {
  const { user } = useAuth();
  const [statusData, setStatusData] = useState<AthleteStatusData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Only check for athletes
    if (user?.role !== "Athlete") {
      setIsLoading(false);
      return;
    }

    checkAthleteStatus();

    // Re-check status every 30 seconds to catch real-time updates
    const interval = setInterval(checkAthleteStatus, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const checkAthleteStatus = async () => {
    try {
      setIsChecking(true);
      const response = await AthleteService.getMyStatus();
      if (response.status === 200) {
        const data = response.data;
        setStatusData(data);
        
        // Show warning if needed
        if (data.needs_warning) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    } catch (error) {
      console.error("Error checking athlete status:", error);
    } finally {
      setIsLoading(false);
      setIsChecking(false);
    }
  };

  // Don't render anything if not an athlete or no warning needed
  if (!user || user.role !== "Athlete" || !isVisible || !statusData || isLoading) {
    return null;
  }

  const isInactive = statusData.warning_type === "inactive_status";
  const isApproachingInactive = statusData.warning_type === "approaching_inactive";
  
  // ✅ NEW: Determine if inactive is due to absences or manual override
  const isAbsenceRelated = statusData.consecutive_absences >= 3;

  return (
    <>
      {/* Inactive Status Alert */}
      {isInactive && (
        <div 
          className="fixed left-0 right-0 z-40 bg-red-50 border-b-2 border-red-300 shadow-lg"
          style={{ top: '64px' }}
        >
          <div className="px-4 py-3.5">
            <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
              {/* Left side - Icon and Message */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center ring-2 ring-red-200">
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* ✅ CONDITIONAL MESSAGES based on absence count */}
                  {isAbsenceRelated ? (
                    // Message for auto-inactive due to absences
                    <p className="text-sm font-bold text-red-900 leading-relaxed">
                      <span className="inline-flex items-center">
                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {statusData.consecutive_absences} consecutive absences
                      </span>
                      <span className="mx-2 text-red-400">•</span>
                      <span className="text-red-800">Contact your coach to resolve this issue or submit your medical certificate</span>
                    </p>
                  ) : (
                    // Message for manually set inactive (not absence-related)
                    <p className="text-sm font-bold text-red-900 leading-relaxed">
                      <span className="inline-flex items-center">
                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Account Suspended
                      </span>
                      <span className="mx-2 text-red-400">•</span>
                      <span className="text-red-800">Your account has been suspended by your coach. Please contact them for more information.</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Right side - Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={checkAthleteStatus}
                  disabled={isChecking}
                  className="inline-flex items-center px-3.5 py-2 border border-red-300 text-xs font-semibold rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  {isChecking ? (
                    <>
                      <svg className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking...
                    </>
                  ) : (
                    <>
                      <svg className="-ml-0.5 mr-1.5 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh Status
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Alert (Approaching Inactive) */}
      {isApproachingInactive && (
        <div 
          className="fixed left-0 right-0 z-40 bg-amber-50 border-b-2 border-amber-300 shadow-lg"
          style={{ top: '64px' }}
        >
          <div className="px-4 py-3.5">
            <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
              {/* Left side - Icon and Message */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center ring-2 ring-amber-200">
                    <svg
                      className="w-5 h-5 text-amber-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-amber-900 leading-relaxed">
                    <span className="inline-flex items-center">
                      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {statusData.consecutive_absences} consecutive absences
                    </span>
                    <span className="mx-2 text-amber-400">•</span>
                    <span className="text-amber-800">One more absence will suspend your account. Submit a medical certificate if you have one.</span>
                  </p>
                </div>
              </div>

              {/* Right side - Close Button */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => setIsVisible(false)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-amber-600 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AthleteStatusWarning;