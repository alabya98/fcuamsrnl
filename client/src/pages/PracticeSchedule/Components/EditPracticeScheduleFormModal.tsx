import { useEffect, useState, type FC, type FormEvent } from "react";
import CloseButton from "../../../components/button/CloseButton";
import SubmitButton from "../../../components/button/SubmitButton";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelSelect";
import CoachService from "../../../services/CoachService";
import SportService from "../../../services/SportService";
import PracticeScheduleService from "../../../services/PracticeScheduleService";
import { useAuth } from "../../../contexts/AuthContext";
import type {
  PracticeScheduleColumns,
  PracticeScheduleFieldErrors,
} from "../../../interfaces/PracticeScheduleInterface";
import type { CoachColumns } from "../../../interfaces/CoachInterface";
import type { SportColumns } from "../../../interfaces/SportInterface";

interface EditPracticeScheduleFormModalProps {
  practiceSchedule: PracticeScheduleColumns | null;
  onPracticeScheduleUpdated: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const EditPracticeScheduleFormModal: FC<EditPracticeScheduleFormModalProps> = ({
  practiceSchedule,
  onPracticeScheduleUpdated,
  refreshKey,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [coaches, setCoaches] = useState<CoachColumns[]>([]);

  const [loadingSports, setLoadingSports] = useState(false);
  const [sports, setSports] = useState<SportColumns[]>([]);

  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [coachId, setCoachId] = useState("");
  const [venue, setVenue] = useState("");
  const [practiceDate, setPracticeDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [totalPlayers, setTotalPlayers] = useState("");
  const [sport, setSport] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Pending");
  const [errors, setErrors] = useState<PracticeScheduleFieldErrors>({});

  const isAdmin = user?.role === "Admin";
  const isCoach = user?.role === "Coach";

  const handleUpdatePracticeSchedule = async (e: FormEvent) => {
    try {
      e.preventDefault();

      if (!practiceSchedule || !practiceSchedule.practice_schedule_id) {
        console.error("No practice schedule available");
        return;
      }

      setLoadingUpdate(true);

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

      if (isAdmin) {
        payload.status = status;
      }

      const res = await PracticeScheduleService.updatePracticeSchedule(
        practiceSchedule.practice_schedule_id,
        payload
      );

      if (res.status === 200) {
        setErrors({});
        onPracticeScheduleUpdated(res.data.message);
        refreshKey();
        onClose();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || {});
      } else if (error.response && error.response.status === 403) {
        alert(error.response.data.message);
      } else {
        console.error("Error updating practice schedule:", error);
      }
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleLoadCoaches = async () => {
    try {
      setLoadingCoaches(true);
      const res = await CoachService.loadCoaches();
      if (res.status === 200) {
        setCoaches(res.data.coaches);
      }
    } catch (error) {
      console.error("Error loading coaches:", error);
    } finally {
      setLoadingCoaches(false);
    }
  };

  const handleLoadSports = async () => {
    try {
      setLoadingSports(true);
      const res = await SportService.loadSports();
      if (res.status === 200) {
        setSports(res.data.sports);
      }
    } catch (error) {
      console.error("Error loading sports:", error);
    } finally {
      setLoadingSports(false);
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

  useEffect(() => {
    if (isOpen) {
      handleLoadCoaches();
      handleLoadSports();
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
  if (isOpen && practiceSchedule) {
    setCoachId(practiceSchedule.coach_id?.toString() || "");
    setVenue(practiceSchedule.venue || "");
    
    // ✅ FIX: Format practice_date properly
    if (practiceSchedule.practice_date) {
      const dateObj = new Date(practiceSchedule.practice_date);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      setPracticeDate(`${year}-${month}-${day}`);
    } else {
      setPracticeDate("");
    }

    const formatTime = (time: string) => {
      if (!time) return "";
      return time.substring(0, 5);
    };

    setStartTime(formatTime(practiceSchedule.start_time));
    setEndTime(formatTime(practiceSchedule.end_time));
    setTotalPlayers(practiceSchedule.total_players?.toString() || "");
    setSport(practiceSchedule.sport || "");
    setNotes(practiceSchedule.notes || "");
    setStatus(practiceSchedule.status || "Pending");
  }
}, [isOpen, practiceSchedule]);

  if (!practiceSchedule) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="large">
      <form onSubmit={handleUpdatePracticeSchedule} className="flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 border-b border-gray-200">
          <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
            Edit Practice Schedule
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
          {isCoach && practiceSchedule.status === "Declined" && practiceSchedule.admin_notes && (
            <div className="mb-3 bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <p className="text-sm font-semibold text-red-800 mb-1">Admin Feedback:</p>
              <p className="text-sm text-red-700">{practiceSchedule.admin_notes}</p>
              <p className="text-xs text-red-600 mt-2">Editing will resubmit for approval.</p>
            </div>
          )}

          {isCoach && practiceSchedule.status === "Pending" && (
            <div className="mb-3 bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
              <p className="text-sm text-yellow-800">
                This schedule is pending admin approval. Editing will keep it in pending status.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
            <div className="col-span-1">
              <div className="mb-2 sm:mb-3">
                <FloatingLabelSelect
                  label="Coach"
                  name="coach_id"
                  value={coachId}
                  onChange={(e) => setCoachId(e.target.value)}
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
                        <option value={coach.coach_id} key={coach.coach_id}>
                          {handleCoachFullNameFormat(coach)}
                        </option>
                      ))}
                    </>
                  )}
                </FloatingLabelSelect>
              </div>

              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Venue"
                  type="text"
                  name="venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
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

              <div className="mb-2 sm:mb-3">
                <FloatingLabelSelect
                  label="Sport"
                  name="sport"
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  required
                  errors={errors.sport}
                >
                  {loadingSports ? (
                    <option value="">Loading...</option>
                  ) : (
                    <>
                      <option value="">Select Sport</option>
                      {sports.map((sport, index) => (
                        <option value={sport.sport} key={index}>
                          {sport.sport}
                        </option>
                      ))}
                    </>
                  )}
                </FloatingLabelSelect>
              </div>

              {isAdmin && (
                <div className="mb-2 sm:mb-3">
                  <FloatingLabelSelect
                    label="Status"
                    name="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                    errors={errors.status}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Declined">Declined</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </FloatingLabelSelect>
                </div>
              )}
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
          {!loadingUpdate && <CloseButton label="Close" onClose={onClose} />}
          <SubmitButton
            label="Update Schedule"
            loading={loadingUpdate}
            loadingLabel="Updating..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditPracticeScheduleFormModal;