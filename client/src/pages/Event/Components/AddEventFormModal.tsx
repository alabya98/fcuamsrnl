import { useEffect, useState, type FC, type FormEvent } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelSelect";
import SubmitButton from "../../../components/button/SubmitButton";
import CloseButton from "../../../components/button/CloseButton";
import DateRangeInput from "../../../components/input/DateRangeInput";
import MultiSelect from "../../../components/input/MultiSelect";
import SportService from "../../../services/SportService";
import CoachService from "../../../services/CoachService";
import EventService from "../../../services/EventService";
import type { EventFieldErrors } from "../../../interfaces/EventInterface";
import type { SportColumns } from "../../../interfaces/SportInterface";

interface AddEventFormModalProps {
  onEventAdded: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface AthleteOption {
  athlete_id: number;
  full_name: string;
  school_id: string;
}

interface CoachOption {
  coach_id: number;
  full_name: string;
  staff_id: string;
  position: string;
}

const availableEventTypes = [
  "Training",
  "Tournament",
  "Competition",
  "Tryout",
  "Meeting",
  "Founders",
  "CAPRISAA",
  "Nationals",
  "Regionals",
  "Inter-School",
  "Provincial",
  "City Meet",
  "Invitational",
  "Other",
];

const AddEventFormModal: FC<AddEventFormModalProps> = ({
  onEventAdded,
  refreshKey,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [loadingSports, setLoadingSports] = useState(false);
  const [sports, setSports] = useState<SportColumns[]>([]);
  const [coachSport, setCoachSport] = useState<string>("");

  const [loadingAthletes, setLoadingAthletes] = useState(false);
  const [athletes, setAthletes] = useState<AthleteOption[]>([]);
  const [selectedAthletes, setSelectedAthletes] = useState<number[]>([]);

  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [selectedCoaches, setSelectedCoaches] = useState<number[]>([]);

  const [loadingStore, setLoadingStore] = useState(false);
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("");
  const [sport, setSport] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [registrationDeadline, setRegistrationDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<EventFieldErrors>({});

  const handleLoadAthletes = async (selectedSport: string) => {
    if (!selectedSport) {
      setAthletes([]);
      return;
    }
    try {
      setLoadingAthletes(true);
      const res = await EventService.getAthletesForEvent(selectedSport);
      if (res.status === 200) setAthletes(res.data.athletes);
    } catch (error) {
      console.error("Error loading athletes:", error);
    } finally {
      setLoadingAthletes(false);
    }
  };

  const handleLoadCoaches = async (selectedSport: string) => {
    if (!selectedSport) {
      setCoaches([]);
      return;
    }
    try {
      setLoadingCoaches(true);
      const res = await EventService.getCoachesForEvent(selectedSport);
      if (res.status === 200) setCoaches(res.data.coaches);
    } catch (error) {
      console.error("Error loading coaches:", error);
    } finally {
      setLoadingCoaches(false);
    }
  };

  const handleSportChange = (newSport: string) => {
    setSport(newSport);
    setSelectedAthletes([]);
    setSelectedCoaches([]);
    handleLoadAthletes(newSport);
    handleLoadCoaches(newSport);
  };

  const handleToggleAthlete = (athleteId: number) => {
    setSelectedAthletes((prev) => {
      if (prev.includes(athleteId))
        return prev.filter((id) => id !== athleteId);
      if (maxParticipants && prev.length >= parseInt(maxParticipants)) {
        alert(`Maximum participants limit (${maxParticipants}) reached!`);
        return prev;
      }
      return [...prev, athleteId];
    });
  };

  const handleToggleCoach = (coachId: number) => {
    setSelectedCoaches((prev) =>
      prev.includes(coachId)
        ? prev.filter((id) => id !== coachId)
        : [...prev, coachId],
    );
  };

  const handleSelectAllAthletes = () => {
    if (maxParticipants) {
      const limit = parseInt(maxParticipants);
      setSelectedAthletes(athletes.slice(0, limit).map((a) => a.athlete_id));
    } else {
      setSelectedAthletes(athletes.map((a) => a.athlete_id));
    }
  };

  const handleClearAllAthletes = () => setSelectedAthletes([]);
  const handleSelectAllCoaches = () =>
    setSelectedCoaches(coaches.map((c) => c.coach_id));
  const handleClearAllCoaches = () => setSelectedCoaches([]);

  const handleStoreEvent = async (e: FormEvent) => {
    try {
      e.preventDefault();
      setLoadingStore(true);

      const payload = {
        event_name: eventName,
        description: description || null,
        event_type: eventType,
        sport: sport,
        event_date: eventDate,
        end_date: endDate || null,
        start_time: startTime,
        end_time: endTime,
        venue: venue,
        organizer: organizer || null,
        max_participants: maxParticipants ? parseInt(maxParticipants) : null,
        registration_deadline: registrationDeadline || null,
        notes: notes || null,
        participant_ids: selectedAthletes,
        coach_ids: selectedCoaches,
      };

      const res = await EventService.storeEventWithParticipants(payload);

      if (res.status === 200) {
        onEventAdded(res.data.message);
        setEventName("");
        setDescription("");
        setEventType("");
        setSport("");
        setEventDate("");
        setEndDate("");
        setStartTime("");
        setEndTime("");
        setVenue("");
        setOrganizer("");
        setMaxParticipants("");
        setRegistrationDeadline("");
        setNotes("");
        setSelectedAthletes([]);
        setSelectedCoaches([]);
        setAthletes([]);
        setCoaches([]);
        setErrors({});
        refreshKey();
        onClose();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else if (error.response && error.response.status === 403) {
        alert(error.response.data.message);
      } else {
        console.log("Unexpected server error during adding event:", error);
      }
    } finally {
      setLoadingStore(false);
    }
  };

  const handleLoadSports = async () => {
    try {
      setLoadingSports(true);
      const res = await SportService.loadSports();
      if (res.status === 200) setSports(res.data.sports);
    } catch (error) {
      console.error("Error loading sports:", error);
    } finally {
      setLoadingSports(false);
    }
  };

  const handleLoadCoachProfile = async () => {
    if (user?.role === "Coach") {
      try {
        const res = await CoachService.loadCoaches();
        if (res.status === 200) {
          const currentCoach = res.data.coaches.find(
            (c: any) => c.user_id === user.user_id,
          );
          if (currentCoach) {
            setCoachSport(currentCoach.sports_coached);
            setSport(currentCoach.sports_coached);
            handleLoadAthletes(currentCoach.sports_coached);
            handleLoadCoaches(currentCoach.sports_coached);
          }
        }
      } catch (error) {
        console.error("Error loading coach profile:", error);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleLoadSports();
      handleLoadCoachProfile();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="large">
      <form
        onSubmit={handleStoreEvent}
        className="flex flex-col h-full max-h-[90vh]"
      >
        <div className="border-b border-gray-100 p-4 flex-shrink-0">
          <h1 className="text-2xl font-semibold">Add Event Form</h1>
          {user?.role === "Coach" && (
            <p className="text-sm text-gray-500 font-normal mt-1">
              Creating team event for {coachSport}
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description{" "}
                  <span className="text-gray-400 font-normal text-xs">
                    (optional)
                  </span>
                </label>
                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter event description... (optional)"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description[0]}
                  </p>
                )}
              </div>

              <FloatingLabelSelect
                label="Event Type"
                name="event_type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                required
                errors={errors.event_type}
              >
                <option value="">Select Event Type</option>
                {availableEventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </FloatingLabelSelect>

              <div>
                <FloatingLabelSelect
                  label="Sport"
                  name="sport"
                  value={sport}
                  onChange={(e) => handleSportChange(e.target.value)}
                  required
                  disabled={user?.role === "Coach"}
                  errors={errors.sport}
                >
                  {loadingSports ? (
                    <option value="">Loading...</option>
                  ) : user?.role === "Coach" ? (
                    <option value={coachSport}>{coachSport}</option>
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
                {user?.role === "Coach" && (
                  <p className="text-xs text-gray-500 mt-1">
                    You can only create events for your sport
                  </p>
                )}
              </div>

              <DateRangeInput
                startLabel="Start Date"
                endLabel="End Date"
                startName="event_date"
                endName="end_date"
                startValue={eventDate}
                endValue={endDate}
                onStartChange={(e) => setEventDate(e.target.value)}
                onEndChange={(e) => setEndDate(e.target.value)}
                startRequired={true}
                endRequired={false}
                startErrors={errors.event_date}
                endErrors={errors.end_date}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.start_time ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.start_time && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.start_time[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.end_time ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.end_time && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.end_time[0]}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <FloatingLabelInput
                label="Venue/Location"
                type="text"
                name="venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                required
                errors={errors.venue}
              />

              <FloatingLabelInput
                label="Organizer"
                type="text"
                name="organizer"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                errors={errors.organizer}
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Automatic Status
                    </p>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Event status will be automatically calculated based on the
                      event date. Admins can manually mark events as cancelled
                      in edit mode if needed.
                    </p>
                  </div>
                </div>
              </div>

              <FloatingLabelInput
                label="Max Participants"
                type="number"
                name="max_participants"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                errors={errors.max_participants}
                placeholder="Leave empty for unlimited"
              />

              <FloatingLabelInput
                label="Registration Deadline"
                type="date"
                name="registration_deadline"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                errors={errors.registration_deadline}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes/Remarks
                </label>
                <textarea
                  name="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                  placeholder="Additional notes or remarks..."
                />
              </div>

              {sport && (
                <MultiSelect
                  label="Select Coaches"
                  options={coaches.map((coach) => ({
                    id: coach.coach_id,
                    label: coach.full_name,
                    sublabel: `${coach.staff_id} • ${coach.position}`,
                  }))}
                  selectedIds={selectedCoaches}
                  onToggle={handleToggleCoach}
                  onSelectAll={handleSelectAllCoaches}
                  onClearAll={handleClearAllCoaches}
                  loading={loadingCoaches}
                  emptyMessage={`No coaches available for ${sport}`}
                />
              )}

              {sport && (
                <MultiSelect
                  label="Select Athletes"
                  options={athletes.map((athlete) => ({
                    id: athlete.athlete_id,
                    label: athlete.full_name,
                    sublabel: athlete.school_id,
                  }))}
                  selectedIds={selectedAthletes}
                  onToggle={handleToggleAthlete}
                  onSelectAll={handleSelectAllAthletes}
                  onClearAll={handleClearAllAthletes}
                  loading={loadingAthletes}
                  maxSelection={
                    maxParticipants ? parseInt(maxParticipants) : undefined
                  }
                  emptyMessage={`No athletes available for ${sport}`}
                />
              )}

              {(selectedAthletes.length > 0 || selectedCoaches.length > 0) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700">
                    💡 Selected coaches and athletes will be linked to this
                    event. Athletes will automatically have participation
                    records created.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 px-4 py-4 flex justify-end gap-2 flex-shrink-0 bg-white">
          {!loadingStore && <CloseButton label="Close" onClose={onClose} />}
          <SubmitButton
            label="Save Event"
            loading={loadingStore}
            loadingLabel="Saving Event..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddEventFormModal;
