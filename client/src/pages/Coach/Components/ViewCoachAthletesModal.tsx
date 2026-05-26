import { useEffect, useState, type FC } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../../components/Modal";
import CoachService from "../../../services/CoachService";
import type { CoachColumns } from "../../../interfaces/CoachInterface";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";

interface ViewCoachAthletesModalProps {
  coach: CoachColumns | null;
  isOpen: boolean;
  onClose: () => void;
}

// ─── Avatar helper ────────────────────────────────────────────────────────────
// Mirrors the renderAthleteAvatar logic in AthleteList.tsx exactly.
// Reads athlete.user.profile_picture_url (now available because the backend
// eager-loads 'user' in getCoachAthletes). Falls back to colored initials.

const AVATAR_COLORS = [
  "from-rose-400 to-pink-600",
  "from-orange-400 to-amber-600",
  "from-yellow-400 to-lime-500",
  "from-emerald-400 to-teal-600",
  "from-cyan-400 to-sky-600",
  "from-blue-400 to-indigo-600",
  "from-violet-400 to-purple-600",
  "from-fuchsia-400 to-pink-600",
];

const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

interface AthleteAvatarProps {
  athlete: AthleteColumns;
  fullName: string;
}

const AthleteAvatar: FC<AthleteAvatarProps> = ({ athlete, fullName }) => {
  const [imgError, setImgError] = useState(false);

  const profilePictureUrl = athlete.user?.profile_picture_url;
  const initials =
    `${athlete.first_name.charAt(0)}${athlete.last_name.charAt(0)}`.toUpperCase();
  const colorGradient = getAvatarColor(
    `${athlete.first_name}${athlete.last_name}`,
  );

  if (profilePictureUrl && !imgError) {
    return (
      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
        <img
          src={profilePictureUrl}
          alt={fullName}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`w-14 h-14 bg-gradient-to-br ${colorGradient} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}
    >
      <span className="text-white font-bold text-lg">{initials}</span>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const ViewCoachAthletesModal: FC<ViewCoachAthletesModalProps> = ({
  coach,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [athletes, setAthletes] = useState<AthleteColumns[]>([]);

  const handleLoadCoachAthletes = async () => {
    if (!coach || !coach.coach_id) return;
    try {
      setLoading(true);
      const res = await CoachService.getCoachAthletes(coach.coach_id);
      if (res.status === 200) {
        setAthletes(res.data.athletes);
      }
    } catch (error) {
      console.error("Error loading coach athletes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && coach) {
      handleLoadCoachAthletes();
    }
  }, [isOpen, coach]);

  const handleCoachFullNameFormat = () => {
    if (!coach) return "";
    let fullName = `${coach.first_name}`;
    if (coach.middle_name) fullName += ` ${coach.middle_name.charAt(0)}.`;
    fullName += ` ${coach.last_name}`;
    if (coach.suffix_name) fullName += ` ${coach.suffix_name}`;
    return `Coach ${fullName}`;
  };

  const handleAthleteFullNameFormat = (athlete: AthleteColumns) => {
    let fullName = `${athlete.first_name}`;
    if (athlete.middle_name) fullName += ` ${athlete.middle_name.charAt(0)}.`;
    fullName += ` ${athlete.last_name}`;
    if (athlete.suffix_name) fullName += ` ${athlete.suffix_name}`;
    return fullName;
  };

  const handleViewAthleteProfile = (athleteId: number) => {
    navigate(`/athletes/${athleteId}`);
    onClose();
  };

  if (!coach) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="large">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
          <div className="px-6 py-5">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Athletes of {handleCoachFullNameFormat()}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-purple-600"
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
                <span className="font-semibold">Sport:</span>
                <span className="font-bold text-purple-700">
                  {coach.sports_coached}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-600"
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
                <span className="font-semibold">Position:</span>
                <span className="font-bold text-blue-700">
                  {coach.position}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Athletes List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 absolute top-0 left-0"></div>
                </div>
                <p className="mt-4 text-gray-600 font-semibold">
                  Loading athletes...
                </p>
              </div>
            </div>
          ) : athletes.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <svg
                  className="w-10 h-10 text-gray-400"
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
              </div>
              <p className="text-xl font-bold text-gray-700 mb-2">
                No athletes assigned
              </p>
              <p className="text-gray-500">
                This coach has no athletes assigned yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {athletes.map((athlete) => {
                const fullName = handleAthleteFullNameFormat(athlete);
                return (
                  <button
                    key={athlete.athlete_id}
                    onClick={() => handleViewAthleteProfile(athlete.athlete_id)}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
                  >
                    <div className="flex items-center gap-4">
                      {/* ✅ Profile photo if available, colored initials fallback */}
                      <AthleteAvatar athlete={athlete} fullName={fullName} />

                      {/* Athlete Info */}
                      <div className="flex-1 text-left">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                          {fullName}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1.5">
                            <svg
                              className="w-4 h-4 text-blue-600"
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
                            <span className="font-semibold">
                              {athlete.school_id}
                            </span>
                          </span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="flex items-center gap-1.5">
                            <svg
                              className="w-4 h-4 text-purple-600"
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
                            <span className="font-semibold">
                              {athlete.sport}
                            </span>
                          </span>
                          {athlete.position && (
                            <>
                              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                              <span className="font-medium">
                                {athlete.position}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${
                          athlete.academic_status === "Eligible"
                            ? "bg-green-100 text-green-800"
                            : athlete.academic_status === "Ineligible"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {athlete.academic_status}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        Click to view profile
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loading && athletes.length > 0 && (
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-600 font-medium">
                Total Athletes:{" "}
                <span className="font-bold text-gray-900">
                  {athletes.length}
                </span>
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ViewCoachAthletesModal;
