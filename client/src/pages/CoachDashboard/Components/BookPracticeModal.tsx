import { useState, type FC, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelSelect";
import SubmitButton from "../../../components/button/SubmitButton";
import CloseButton from "../../../components/button/CloseButton";
import PracticeScheduleService from "../../../services/PracticeScheduleService";
import type { CoachColumns } from "../../../interfaces/CoachInterface";
import type { PracticeScheduleFieldErrors } from "../../../interfaces/PracticeScheduleInterface";

interface BookPracticeModalProps {
  coachProfile: CoachColumns;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BookPracticeModal: FC<BookPracticeModalProps> = ({
  coachProfile,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [venue, setVenue] = useState("");
  const [practiceDate, setPracticeDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [totalPlayers, setTotalPlayers] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<PracticeScheduleFieldErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  const venues = [
    "Main Gymnasium",
    "Outdoor Court A",
    "Outdoor Court B",
    "Training Field",
    "Swimming Pool",
    "Fitness Center",
    "Indoor Arena",
    "Practice Track",
  ];

  const handleBookPractice = async (e: FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);
      setErrors({});
      setSuccessMessage("");

      const payload = {
        coach_id: coachProfile.coach_id,
        venue: venue,
        practice_date: practiceDate,
        start_time: startTime,
        end_time: endTime,
        total_players: parseInt(totalPlayers),
        sport: coachProfile.sports_coached,
        notes: notes || null,
        status: "Scheduled",
      };

      const res = await PracticeScheduleService.storePracticeSchedule(payload);

      if (res.status === 200) {
        setSuccessMessage(
          "Practice venue booked successfully! Your athletes can now see this session."
        );

        setVenue("");
        setPracticeDate("");
        setStartTime("");
        setEndTime("");
        setTotalPlayers("");
        setNotes("");

        setTimeout(() => {
          onSuccess();
          setSuccessMessage("");
        }, 2000);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error booking practice:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="large">
      <form
        onSubmit={handleBookPractice}
        className="flex flex-col h-full overflow-hidden"
      >
        {/* HEADER */}
        <div className="flex-shrink-0 border-b border-gray-200">
          <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
            Book Practice Venue
          </h1>
          <p className="px-3 sm:px-4 pb-2 text-sm text-gray-600">
            Schedule a practice session for {coachProfile.sports_coached}
          </p>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
          {/* Success message */}
          {successMessage && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
            {/* LEFT COLUMN */}
            <div>
              <div className="mb-2 sm:mb-3">
                <FloatingLabelSelect
                  label="Venue"
                  name="venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
                  errors={errors.venue}
                >
                  <option value="">Select Venue</option>
                  {venues.map((v, i) => (
                    <option value={v} key={i}>
                      {v}
                    </option>
                  ))}
                </FloatingLabelSelect>
              </div>

              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Practice Date"
                  type="date"
                  name="practice_date"
                  min={today}
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

            {/* RIGHT COLUMN */}
            <div>
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
                  errors={errors.total_players}
                />
              </div>

              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Notes (Optional)"
                  type="text"
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  errors={errors.notes}
                />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col-reverse sm:flex-row justify-end gap-2">
          {!loading && <CloseButton label="Close" onClose={onClose} />}
          <SubmitButton
            label="Book Practice"
            loading={loading}
            loadingLabel="Booking..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default BookPracticeModal;
