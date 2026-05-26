import { useEffect, useState, type FC, type FormEvent } from "react";
import CloseButton from "../../../components/button/CloseButton";
import SubmitButton from "../../../components/button/SubmitButton";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelSelect";
import SportService from "../../../services/SportService";
import RecordService from "../../../services/RecordService";
import type {
  RecordColumns,
  RecordFieldErrors,
} from "../../../interfaces/RecordInterface";
import type { SportColumns } from "../../../interfaces/SportInterface";

interface EditRecordFormModalProps {
  record: RecordColumns | null;
  onRecordUpdated: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const EditRecordFormModal: FC<EditRecordFormModalProps> = ({
  record,
  onRecordUpdated,
  refreshKey,
  isOpen,
  onClose,
}) => {
  const [loadingSports, setLoadingSports] = useState(false);
  const [sports, setSports] = useState<SportColumns[]>([]);

  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [eventName, setEventName] = useState("");
  const [competitionLevel, setCompetitionLevel] = useState("");
  const [sport, setSport] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [achievement, setAchievement] = useState("");
  const [athleteName, setAthleteName] = useState("");
  const [coachName, setCoachName] = useState("");
  const [category, setCategory] = useState("");
  const [recordType, setRecordType] = useState("");
  const [pointsScore, setPointsScore] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState<RecordFieldErrors>({});

  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const handleUpdateRecord = async (e: FormEvent) => {
    try {
      e.preventDefault();

      if (!record || !record.record_id) {
        console.error("❌ No record or record_id available");
        return;
      }

      setLoadingUpdate(true);

      const payload = {
        event_name: eventName,
        competition_level: competitionLevel,
        sport: sport,
        event_date: eventDate,
        venue: venue,
        achievement: achievement,
        athlete_name: athleteName,
        coach_name: coachName || null,
        category: category,
        record_type: recordType,
        points_score: pointsScore || null,
        remarks: remarks || null,
      };

      const res = await RecordService.updateRecord(record.record_id, payload);

      if (res.status === 200) {
        setErrors({});
        onRecordUpdated(res.data.message);
        refreshKey();
        onClose();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors || {};
        setErrors(validationErrors);
      } else {
        console.error(
          "❌ Unexpected server error occurred during updating record: ",
          error
        );
      }
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleLoadSports = async () => {
    try {
      setLoadingSports(true);

      const res = await SportService.loadSports();

      if (res.status === 200) {
        setSports(res.data.sports);
      } else {
        console.error(
          "Unexpected status error occurred during loading sports: ",
          res.status
        );
      }
    } catch (error) {
      console.error(
        "Unexpected server error occurred during loading sports: ",
        error
      );
    } finally {
      setLoadingSports(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleLoadSports();
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && record) {
      setEventName(record.event_name || "");
      setCompetitionLevel(record.competition_level || "");
      setSport(record.sport || "");
      setEventDate(formatDateForInput(record.event_date || ""));
      setVenue(record.venue || "");
      setAchievement(record.achievement || "");
      setAthleteName(record.athlete_name || "");
      setCoachName(record.coach_name ?? "");
      setCategory(record.category || "");
      setRecordType(record.record_type || "");
      setPointsScore(record.points_score ?? "");
      setRemarks(record.remarks ?? "");
    }
  }, [isOpen, record]);

  if (!record) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="large">
      <form onSubmit={handleUpdateRecord} className="flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 border-b border-gray-200">
          <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
            Edit Record Form
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
            <div className="col-span-1">
              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Event Name"
                  type="text"
                  name="event_name"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                  autoFocus
                  errors={errors.event_name}
                />
              </div>

              <div className="mb-2 sm:mb-3">
                <FloatingLabelSelect
                  label="Competition Level"
                  name="competition_level"
                  value={competitionLevel}
                  onChange={(e) => setCompetitionLevel(e.target.value)}
                  required
                  errors={errors.competition_level}
                >
                  <option value="">Select Competition Level</option>
                  <option value="Founders">Founders</option>
                  <option value="CAPRISAA">CAPRISAA</option>
                  <option value="Nationals">Nationals</option>
                  <option value="Regionals">Regionals</option>
                  <option value="Inter-School">Inter-School</option>
                  <option value="Provincial">Provincial</option>
                  <option value="City Meet">City Meet</option>
                  <option value="Invitational">Invitational</option>
                  <option value="Other">Other</option>
                </FloatingLabelSelect>
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

              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Event Date"
                  type="date"
                  name="event_date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  errors={errors.event_date}
                />
              </div>

              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Venue/Location"
                  type="text"
                  name="venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  required
                  errors={errors.venue}
                />
              </div>

              <div className="mb-2 sm:mb-3">
                <FloatingLabelSelect
                  label="Achievement/Result"
                  name="achievement"
                  value={achievement}
                  onChange={(e) => setAchievement(e.target.value)}
                  required
                  errors={errors.achievement}
                >
                  <option value="">Select Achievement</option>
                  <option value="Gold Medal">Gold Medal</option>
                  <option value="Silver Medal">Silver Medal</option>
                  <option value="Bronze Medal">Bronze Medal</option>
                  <option value="Champion">Champion</option>
                  <option value="1st Place">1st Place</option>
                  <option value="2nd Place">2nd Place</option>
                  <option value="3rd Place">3rd Place</option>
                  <option value="Winner">Winner</option>
                  <option value="Runner-up">Runner-up</option>
                  <option value="Finalist">Finalist</option>
                  <option value="Semi-Finalist">Semi-Finalist</option>
                  <option value="Participant">Participant</option>
                  <option value="MVP">MVP</option>
                  <option value="Best Player">Best Player</option>
                  <option value="Other">Other</option>
                </FloatingLabelSelect>
              </div>
            </div>

            <div className="col-span-1">
              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Athlete Name"
                  type="text"
                  name="athlete_name"
                  value={athleteName}
                  onChange={(e) => setAthleteName(e.target.value)}
                  required
                  errors={errors.athlete_name}
                />
              </div>

              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Coach Name"
                  type="text"
                  name="coach_name"
                  value={coachName}
                  onChange={(e) => setCoachName(e.target.value)}
                  errors={errors.coach_name}
                />
              </div>

              <div className="mb-2 sm:mb-3">
                <FloatingLabelSelect
                  label="Category"
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  errors={errors.category}
                >
                  <option value="">Select Category</option>
                  <option value="Individual">Individual</option>
                  <option value="Team">Team</option>
                </FloatingLabelSelect>
              </div>

              <div className="mb-2 sm:mb-3">
                <FloatingLabelSelect
                  label="Record Type"
                  name="record_type"
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  required
                  errors={errors.record_type}
                >
                  <option value="">Select Record Type</option>
                  <option value="Championship">Championship</option>
                  <option value="Medal">Medal</option>
                  <option value="Trophy">Trophy</option>
                  <option value="Certificate">Certificate</option>
                  <option value="Award">Award</option>
                  <option value="Recognition">Recognition</option>
                  <option value="Achievement">Achievement</option>
                </FloatingLabelSelect>
              </div>

              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Points/Score"
                  type="text"
                  name="points_score"
                  value={pointsScore}
                  onChange={(e) => setPointsScore(e.target.value)}
                  errors={errors.points_score}
                />
              </div>

              <div className="mb-2 sm:mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks/Notes
                </label>
                <textarea
                  name="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.remarks ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Additional remarks or notes..."
                />
                {errors.remarks && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.remarks[0]}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col-reverse sm:flex-row justify-end gap-2">
          {!loadingUpdate && <CloseButton label="Close" onClose={onClose} />}
          <SubmitButton
            label="Update Record"
            loading={loadingUpdate}
            loadingLabel="Updating..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditRecordFormModal;