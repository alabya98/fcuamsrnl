import { useEffect, useState, type FC, type FormEvent } from "react";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelSelect";
import SubmitButton from "../../../components/button/SubmitButton";
import CloseButton from "../../../components/button/CloseButton";
import CoachService from "../../../services/CoachService";
import PracticeScheduleService from "../../../services/PracticeScheduleService";
import { useAuth } from "../../../contexts/AuthContext";
import type { PracticeScheduleFieldErrors } from "../../../interfaces/PracticeScheduleInterface";
import type { CoachColumns } from "../../../interfaces/CoachInterface";

interface AddPracticeScheduleFormModalProps {
  onPracticeScheduleAdded: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const AddPracticeScheduleFormModal: FC<AddPracticeScheduleFormModalProps> = ({
  onPracticeScheduleAdded,
  refreshKey,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [coaches, setCoaches] = useState<CoachColumns[]>([]);
  const [currentCoach, setCurrentCoach] = useState<CoachColumns | null>(null);

  const [loadingStore, setLoadingStore] = useState(false);
  const [coachId, setCoachId] = useState("");
  const [venue, setVenue] = useState("");
  const [practiceDate, setPracticeDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [totalPlayers, setTotalPlayers] = useState("");
  const [sport, setSport] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<PracticeScheduleFieldErrors>({});

  const isAdmin = user?.role === "Admin";
  const isCoach = user?.role === "Coach";

  const handleStorePracticeSchedule = async (e: FormEvent) => {
    try {
      e.preventDefault();
      setLoadingStore(true);

      const payload: any = {
        coach_id: coachId,
        venue: venue,
        practice_date: practiceDate,
        start_time: startTime,
        end_time: endTime,
        total_players: parseInt(totalPlayers),
        sport: sport,
        notes: notes || null,
      };

      // Admin creates schedules that are automatically approved
      if (isAdmin) {
        payload.status = "Approved";
      }

      const res = await PracticeScheduleService.storePracticeSchedule(payload);

      if (res.status === 200) {
        onPracticeScheduleAdded(res.data.message);

        setCoachId("");
        setVenue("");
        setPracticeDate("");
        setStartTime("");
        setEndTime("");
        setTotalPlayers("");
        setSport("");
        setNotes("");
        setErrors({});

        refreshKey();
        onClose();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.log(
          "Unexpected server error during adding practice schedule:",
          error
        );
      }
    } finally {
      setLoadingStore(false);
    }
  };

  const handleLoadCoaches = async () => {
    try {
      setLoadingCoaches(true);
      const res = await CoachService.loadCoaches();
      if (res.status === 200) {
        setCoaches(res.data.coaches);

        // If coach, auto-select their own profile
        if (isCoach && user) {
          const myCoach = res.data.coaches.find(
            (c: CoachColumns) => c.user_id === user.user_id
          );
          if (myCoach) {
            setCurrentCoach(myCoach);
            setCoachId(myCoach.coach_id.toString());
            setSport(myCoach.sports_coached); // Auto-fill sport
          }
        }
      }
    } catch (error) {
      console.error("Error loading coaches:", error);
    } finally {
      setLoadingCoaches(false);
    }
  };

  const handleCoachFullNameFormat = (coach: CoachColumns) => {
    let fullName = "";
    if (coach.middle_name) {
      fullName = `${coach.first_name} ${coach.middle_name.charAt(0)}. ${
        coach.last_name
      }`;
    } else {
      fullName = `${coach.first_name} ${coach.last_name}`;
    }
    if (coach.suffix_name) {
      fullName += ` ${coach.suffix_name}`;
    }
    return fullName;
  };

  // Handle coach selection change for admin
  const handleCoachChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCoachId = e.target.value;
    setCoachId(selectedCoachId);

    // Auto-fill sport based on selected coach
    const selectedCoach = coaches.find(
      (coach) => coach.coach_id.toString() === selectedCoachId
    );
    if (selectedCoach) {
      setSport(selectedCoach.sports_coached || "");
    } else {
      setSport("");
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleLoadCoaches();
    }
  }, [isOpen]);

  return (
    <>
      <style>
        {`
          /* Custom styled select for coach dropdown */
          .coach-select-wrapper select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234B5563'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            background-size: 1.25rem;
            padding-right: 2.5rem;
          }

          .coach-select-wrapper select option {
            padding: 12px 16px;
            font-size: 14px;
          }

          .coach-select-wrapper select option:first-child {
            color: #9CA3AF;
            font-weight: 500;
          }

          .coach-select-wrapper select option:not(:first-child) {
            padding: 10px 12px;
            border-bottom: 1px solid #F3F4F6;
          }

          .coach-select-wrapper select option:hover {
            background-color: #EFF6FF;
          }
        `}
      </style>

      <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="large">
        <form onSubmit={handleStorePracticeSchedule} className="flex flex-col h-full overflow-hidden">
          <div className="flex-shrink-0 border-b border-gray-200">
            <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
              {isAdmin ? "Add Practice Schedule" : "Request Practice Venue"}
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
            {!isAdmin && (
              <div className="mb-3 bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                <p className="text-sm text-blue-800">
                  Your booking request will be submitted for admin approval.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
              <div className="col-span-1">
                {/* COACH FIELD - Different for Admin vs Coach */}
                <div className="mb-2 sm:mb-3 coach-select-wrapper">
                  {isCoach ? (
                    // Coach sees their name (read-only)
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Coach <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={
                          currentCoach
                            ? handleCoachFullNameFormat(currentCoach)
                            : "Loading..."
                        }
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </>
                  ) : (
                    // Admin sees dropdown with coach's sport displayed
                    <>
                      <FloatingLabelSelect
                        label="Coach"
                        name="coach_id"
                        value={coachId}
                        onChange={handleCoachChange}
                        required
                        autoFocus
                        errors={errors.coach_id}
                      >
                        {loadingCoaches ? (
                          <option value="">Loading...</option>
                        ) : (
                          <>
                            <option value="">Select Coach</option>
                            {coaches.map((coach) => (
                              <option
                                value={coach.coach_id}
                                key={coach.coach_id}
                                style={{
                                  padding: "10px",
                                  lineHeight: "1.6",
                                }}
                              >
                                {handleCoachFullNameFormat(coach)} -{" "}
                                {coach.sports_coached}
                              </option>
                            ))}
                          </>
                        )}
                      </FloatingLabelSelect>
                      {coachId && !loadingCoaches && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-gray-600">
                            Coach selected:{" "}
                            <span className="font-semibold text-gray-900">
                              {
                                coaches.find(
                                  (c) => c.coach_id.toString() === coachId
                                )?.sports_coached
                              }
                            </span>
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="mb-2 sm:mb-3">
                  <FloatingLabelInput
                    label="Venue"
                    type="text"
                    name="venue"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    required
                    autoFocus={isCoach}
                    errors={errors.venue}
                  />
                </div>

                <div className="mb-2 sm:mb-3">
                  <FloatingLabelInput
                    label="Practice Date"
                    type="date"
                    name="practice_date"
                    value={practiceDate}
                    onChange={(e) => setPracticeDate(e.target.value)}
                    required
                    errors={errors.practice_date}
                  />
                </div>

                <div className="mb-2 sm:mb-3">
                  <FloatingLabelInput
                    label="Start Time"
                    type="time"
                    name="start_time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    errors={errors.start_time}
                  />
                </div>
              </div>

              <div className="col-span-1">
                <div className="mb-2 sm:mb-3">
                  <FloatingLabelInput
                    label="End Time"
                    type="time"
                    name="end_time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    errors={errors.end_time}
                  />
                </div>

                <div className="mb-2 sm:mb-3">
                  <FloatingLabelInput
                    label="Total Players"
                    type="number"
                    name="total_players"
                    value={totalPlayers}
                    onChange={(e) => setTotalPlayers(e.target.value)}
                    required
                    min="1"
                    errors={errors.total_players}
                  />
                </div>

                {/* SPORT FIELD - Auto-filled or read-only */}
                <div className="mb-2 sm:mb-3">
                  {isCoach ? (
                    // Coach sees their sport (read-only)
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sport <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={currentCoach?.sports_coached || "Loading..."}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Your assigned sport</p>
                    </>
                  ) : (
                    // Admin sees auto-filled sport (read-only)
                    <FloatingLabelInput
                      label="Sport (Auto-filled)"
                      type="text"
                      name="sport"
                      value={sport}
                      readOnly
                      disabled
                      errors={errors.sport}
                    />
                  )}
                </div>
              </div>

              <div className="col-span-1 lg:col-span-2">
                <div className="mb-2 sm:mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.notes ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Add any additional notes here..."
                  />
                  {errors.notes && (
                    <p className="text-red-500 text-sm mt-1">{errors.notes[0]}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col-reverse sm:flex-row justify-end gap-2">
            {!loadingStore && <CloseButton label="Close" onClose={onClose} />}
            <SubmitButton
              label={isAdmin ? "Save Practice Schedule" : "Submit Request"}
              loading={loadingStore}
              loadingLabel={isAdmin ? "Saving..." : "Submitting..."}
            />
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AddPracticeScheduleFormModal;