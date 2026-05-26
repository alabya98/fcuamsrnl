// client/src/pages/Record/Components/AddRecordFormModal.tsx
import { useEffect, useState, useRef, type FC, type FormEvent } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelSelect";
import SubmitButton from "../../../components/button/SubmitButton";
import CloseButton from "../../../components/button/CloseButton";
import SportService from "../../../services/SportService";
import CoachService from "../../../services/CoachService";
import AthleteService from "../../../services/AthleteService";
import RecordService from "../../../services/RecordService";
import EventService from "../../../services/EventService";
import type { RecordFieldErrors } from "../../../interfaces/RecordInterface";
import type { SportColumns } from "../../../interfaces/SportInterface";
import type { CoachColumns } from "../../../interfaces/CoachInterface";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";
import type { EventColumns } from "../../../interfaces/EventInterface";

interface AddRecordFormModalProps {
  onRecordAdded: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const AddRecordFormModal: FC<AddRecordFormModalProps> = ({
  onRecordAdded,
  refreshKey,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [loadingSports, setLoadingSports] = useState(false);
  const [sports, setSports] = useState<SportColumns[]>([]);
  const [coachSport, setCoachSport] = useState<string>("");

  // Event autocomplete states
  const [events, setEvents] = useState<EventColumns[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventColumns[]>([]);
  const [showEventDropdown, setShowEventDropdown] = useState(false);
  const eventInputRef = useRef<HTMLInputElement>(null);
  const eventDropdownRef = useRef<HTMLDivElement>(null);

  // Athlete autocomplete states
  const [athletes, setAthletes] = useState<AthleteColumns[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<AthleteColumns[]>(
    [],
  );
  const [showAthleteDropdown, setShowAthleteDropdown] = useState(false);
  const athleteInputRef = useRef<HTMLInputElement>(null);
  const athleteDropdownRef = useRef<HTMLDivElement>(null);

  // Coach autocomplete states
  const [coaches, setCoaches] = useState<CoachColumns[]>([]);
  const [filteredCoaches, setFilteredCoaches] = useState<CoachColumns[]>([]);
  const [showCoachDropdown, setShowCoachDropdown] = useState(false);
  const coachInputRef = useRef<HTMLInputElement>(null);
  const coachDropdownRef = useRef<HTMLDivElement>(null);

  const [loadingStore, setLoadingStore] = useState(false);
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

  const handleStoreRecord = async (e: FormEvent) => {
    try {
      e.preventDefault();

      setLoadingStore(true);

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

      const res = await RecordService.storeRecord(payload);

      if (res.status === 200) {
        onRecordAdded(res.data.message);

        setEventName("");
        setCompetitionLevel("");
        setSport("");
        setEventDate("");
        setVenue("");
        setAchievement("");
        setAthleteName("");
        setCoachName("");
        setCategory("");
        setRecordType("");
        setPointsScore("");
        setRemarks("");
        setErrors({});

        refreshKey();
        onClose();
      } else {
        console.error(
          "Unexpected status error occurred during adding record: ",
          res.status,
        );
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else if (error.response && error.response.status === 403) {
        alert(error.response.data.message);
      } else {
        console.log(
          "Unexpected server error occurred during adding record: ",
          error,
        );
      }
    } finally {
      setLoadingStore(false);
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
          res.status,
        );
      }
    } catch (error) {
      console.error(
        "Unexpected server error occurred during loading sports: ",
        error,
      );
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
            // Auto-fill coach name for logged-in coach
            const coachFullName = formatCoachName(currentCoach);
            setCoachName(coachFullName);
          }
        }
      } catch (error) {
        console.error("Error loading coach profile:", error);
      }
    }
  };

  const handleLoadEvents = async () => {
    try {
      const res = await EventService.loadEvents();
      if (res.status === 200) {
        setEvents(res.data.events || []);
      }
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  // ✅ MODIFIED: Load athletes filtered by sport
  const handleLoadAthletes = async (selectedSport?: string) => {
    try {
      const sportToFilter =
        selectedSport ||
        sport ||
        (user?.role === "Coach" ? coachSport : undefined);
      const res = await AthleteService.loadAthletes(sportToFilter);
      if (res.status === 200) {
        setAthletes(res.data.athletes);
      }
    } catch (error) {
      console.error("Error loading athletes:", error);
    }
  };

  // ✅ MODIFIED: Load coaches filtered by sport
  const handleLoadCoaches = async (selectedSport?: string) => {
    try {
      const sportToFilter =
        selectedSport ||
        sport ||
        (user?.role === "Coach" ? coachSport : undefined);
      const res = await CoachService.loadCoaches(sportToFilter);
      if (res.status === 200) {
        setCoaches(res.data.coaches);
      }
    } catch (error) {
      console.error("Error loading coaches:", error);
    }
  };

  const formatAthleteName = (athlete: AthleteColumns) => {
    let fullName = `${athlete.first_name}`;
    if (athlete.middle_name) {
      fullName += ` ${athlete.middle_name}`;
    }
    fullName += ` ${athlete.last_name}`;
    if (athlete.suffix_name) {
      fullName += ` ${athlete.suffix_name}`;
    }
    return fullName;
  };

  const formatCoachName = (coach: CoachColumns) => {
    let fullName = `${coach.first_name}`;
    if (coach.middle_name) {
      fullName += ` ${coach.middle_name}`;
    }
    fullName += ` ${coach.last_name}`;
    if (coach.suffix_name) {
      fullName += ` ${coach.suffix_name}`;
    }
    return fullName;
  };

  // Event autocomplete functions
  const handleEventNameChange = (value: string) => {
    setEventName(value);
    setShowEventDropdown(true);

    if (value.trim() === "") {
      setFilteredEvents([]);
      return;
    }

    // Filter events based on input
    const filtered = events.filter((event) => {
      const matchesName = event.event_name
        .toLowerCase()
        .includes(value.toLowerCase());

      // If coach, only show events from their sport
      if (user?.role === "Coach" && coachSport) {
        return matchesName && event.sport === coachSport;
      }

      // If admin and sport is selected, filter by sport
      if (sport) {
        return matchesName && event.sport === sport;
      }

      return matchesName;
    });

    setFilteredEvents(filtered.slice(0, 10)); // Limit to 10 results
  };

  const handleSelectEvent = (event: EventColumns) => {
    setEventName(event.event_name);

    // Auto-fill related fields from the selected event
    if (event.sport) {
      setSport(event.sport);
    }
    if (event.event_date) {
      setEventDate(event.event_date);
    }
    if (event.venue) {
      setVenue(event.venue);
    }

    setShowEventDropdown(false);
    setFilteredEvents([]);
  };

  const handleAthleteNameChange = (value: string) => {
    setAthleteName(value);
    setShowAthleteDropdown(true);

    if (value.trim() === "") {
      setFilteredAthletes([]);
      return;
    }

    // ✅ Filter athletes based on input (already filtered by sport from backend)
    const filtered = athletes.filter((athlete) => {
      const fullName = formatAthleteName(athlete).toLowerCase();
      return fullName.includes(value.toLowerCase());
    });

    setFilteredAthletes(filtered.slice(0, 10)); // Limit to 10 results
  };

  const handleSelectAthlete = (athlete: AthleteColumns) => {
    const fullName = formatAthleteName(athlete);
    setAthleteName(fullName);

    // Auto-fill coach name if available
    if (athlete.coach && athlete.coach.first_name) {
      const coachFullName = `${athlete.coach.first_name} ${athlete.coach.last_name}`;
      setCoachName(coachFullName);
    }

    setShowAthleteDropdown(false);
    setFilteredAthletes([]);
  };

  // Coach autocomplete functions
  const handleCoachNameChange = (value: string) => {
    setCoachName(value);
    setShowCoachDropdown(true);

    if (value.trim() === "") {
      setFilteredCoaches([]);
      return;
    }

    // ✅ Filter coaches based on input (already filtered by sport from backend)
    const filtered = coaches.filter((coach) => {
      const fullName = formatCoachName(coach).toLowerCase();
      return fullName.includes(value.toLowerCase());
    });

    setFilteredCoaches(filtered.slice(0, 10)); // Limit to 10 results
  };

  const handleSelectCoach = (coach: CoachColumns) => {
    const fullName = formatCoachName(coach);
    setCoachName(fullName);
    setShowCoachDropdown(false);
    setFilteredCoaches([]);
  };

  // ✅ NEW: Handle sport change
  const handleSportChange = (selectedSport: string) => {
    setSport(selectedSport);

    // Reset athlete and coach selections when sport changes
    setAthleteName("");
    setCoachName("");
    setAthletes([]);
    setCoaches([]);

    // Reload athletes and coaches for the new sport
    if (selectedSport && user?.role !== "Coach") {
      handleLoadAthletes(selectedSport);
      handleLoadCoaches(selectedSport);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Event dropdown
      if (
        eventDropdownRef.current &&
        !eventDropdownRef.current.contains(event.target as Node) &&
        eventInputRef.current &&
        !eventInputRef.current.contains(event.target as Node)
      ) {
        setShowEventDropdown(false);
      }

      // Athlete dropdown
      if (
        athleteDropdownRef.current &&
        !athleteDropdownRef.current.contains(event.target as Node) &&
        athleteInputRef.current &&
        !athleteInputRef.current.contains(event.target as Node)
      ) {
        setShowAthleteDropdown(false);
      }

      // Coach dropdown
      if (
        coachDropdownRef.current &&
        !coachDropdownRef.current.contains(event.target as Node) &&
        coachInputRef.current &&
        !coachInputRef.current.contains(event.target as Node)
      ) {
        setShowCoachDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      handleLoadSports();
      handleLoadCoachProfile();
      handleLoadEvents();
      // ✅ Load athletes and coaches after coach profile is loaded
      if (user?.role === "Coach" && coachSport) {
        handleLoadAthletes(coachSport);
        handleLoadCoaches(coachSport);
      }
    }
  }, [isOpen, coachSport]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
        <form onSubmit={handleStoreRecord}>
          <h1 className="text-2xl border-b border-gray-100 p-4 font-semibold mb-4">
            Add Record Form
            {user?.role === "Coach" && (
              <p className="text-sm text-gray-500 font-normal mt-1">
                Creating record for {coachSport} athletes
              </p>
            )}
          </h1>
          <div className="grid grid-cols-2 gap-4 border-b border-gray-100 mb-4 max-h-[70vh] overflow-y-auto px-4">
            {/* LEFT COLUMN */}
            <div className="col-span-2 md:col-span-1">
              {/* EVENT NAME WITH AUTOCOMPLETE */}
              <div className="mb-4 relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={eventInputRef}
                  type="text"
                  name="event_name"
                  value={eventName}
                  onChange={(e) => handleEventNameChange(e.target.value)}
                  onFocus={() => {
                    if (eventName.trim()) {
                      handleEventNameChange(eventName);
                    }
                  }}
                  required
                  autoFocus
                  placeholder="Type event name or click to select..."
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.event_name ? "border-red-500" : "border-gray-300"
                  }`}
                  autoComplete="off"
                />
                {errors.event_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.event_name[0]}
                  </p>
                )}

                {/* EVENT DROPDOWN LIST */}
                {showEventDropdown && filteredEvents.length > 0 && (
                  <div
                    ref={eventDropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {filteredEvents.map((event) => (
                      <div
                        key={event.event_id}
                        onClick={() => handleSelectEvent(event)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {event.event_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {event.sport} •{" "}
                              {new Date(event.event_date).toLocaleDateString()}{" "}
                              • {event.venue}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded ml-2 ${
                              event.status === "Upcoming"
                                ? "bg-blue-100 text-blue-800"
                                : event.status === "Ongoing"
                                  ? "bg-green-100 text-green-800"
                                  : event.status === "Completed"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {event.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showEventDropdown &&
                  eventName.trim() &&
                  filteredEvents.length === 0 && (
                    <div
                      ref={eventDropdownRef}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4"
                    >
                      <p className="text-sm text-gray-500 text-center">
                        No events found
                      </p>
                    </div>
                  )}
              </div>

              <div className="mb-4">
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

              <div className="mb-4">
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
                    You can only add records for your sport
                  </p>
                )}
              </div>

              <div className="mb-4">
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

              <div className="mb-4">
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

              <div className="mb-4">
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

            {/* RIGHT COLUMN */}
            <div className="col-span-2 md:col-span-1">
              {/* ATHLETE NAME WITH AUTOCOMPLETE */}
              <div className="mb-4 relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Athlete Name <span className="text-red-500">*</span>
                </label>
                <input
                  ref={athleteInputRef}
                  type="text"
                  name="athlete_name"
                  value={athleteName}
                  onChange={(e) => handleAthleteNameChange(e.target.value)}
                  onFocus={() => {
                    // Show dropdown on focus if sport is selected and athletes are loaded
                    if (sport || (user?.role === "Coach" && coachSport)) {
                      setShowAthleteDropdown(true);
                      if (athleteName.trim()) {
                        handleAthleteNameChange(athleteName);
                      } else {
                        // Show all athletes for the selected sport
                        setFilteredAthletes(athletes.slice(0, 10));
                      }
                    }
                  }}
                  required
                  placeholder="Type athlete name or click to select..."
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.athlete_name ? "border-red-500" : "border-gray-300"
                  }`}
                  autoComplete="off"
                />
                {errors.athlete_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.athlete_name[0]}
                  </p>
                )}

                {/* ATHLETE DROPDOWN LIST */}
                {showAthleteDropdown && filteredAthletes.length > 0 && (
                  <div
                    ref={athleteDropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {filteredAthletes.map((athlete) => (
                      <div
                        key={athlete.athlete_id}
                        onClick={() => handleSelectAthlete(athlete)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {formatAthleteName(athlete)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {athlete.sport} • {athlete.school_id}
                            </p>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {athlete.department}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showAthleteDropdown &&
                  (sport || (user?.role === "Coach" && coachSport)) &&
                  filteredAthletes.length === 0 && (
                    <div
                      ref={athleteDropdownRef}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4"
                    >
                      <p className="text-sm text-gray-500 text-center">
                        No athletes found for {sport || coachSport}
                      </p>
                    </div>
                  )}

                {/* HELPER TEXT */}
                {!sport && user?.role !== "Coach" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Please select a sport first to see available athletes
                  </p>
                )}
              </div>

              {/* COACH NAME WITH AUTOCOMPLETE - ONLY ONE TIME */}
              <div className="mb-4 relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coach Name
                </label>
                <input
                  ref={coachInputRef}
                  type="text"
                  name="coach_name"
                  value={coachName}
                  onChange={(e) => handleCoachNameChange(e.target.value)}
                  onFocus={() => {
                    // Show dropdown on focus if sport is selected and coaches are loaded (only for admin)
                    if (user?.role !== "Coach" && (sport || coachSport)) {
                      setShowCoachDropdown(true);
                      if (coachName.trim()) {
                        handleCoachNameChange(coachName);
                      } else {
                        // Show all coaches for the selected sport
                        setFilteredCoaches(coaches.slice(0, 10));
                      }
                    }
                  }}
                  disabled={user?.role === "Coach"}
                  placeholder="Type coach name or click to select..."
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    user?.role === "Coach"
                      ? "bg-gray-50 cursor-not-allowed"
                      : ""
                  } ${
                    errors.coach_name ? "border-red-500" : "border-gray-300"
                  }`}
                  autoComplete="off"
                />
                {errors.coach_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.coach_name[0]}
                  </p>
                )}

                {/* COACH DROPDOWN LIST */}
                {showCoachDropdown &&
                  filteredCoaches.length > 0 &&
                  user?.role !== "Coach" && (
                    <div
                      ref={coachDropdownRef}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    >
                      {filteredCoaches.map((coach) => (
                        <div
                          key={coach.coach_id}
                          onClick={() => handleSelectCoach(coach)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {formatCoachName(coach)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {coach.sports_coached} • {coach.position}
                              </p>
                            </div>
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              {coach.position}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                {showCoachDropdown &&
                  user?.role !== "Coach" &&
                  (sport || coachSport) &&
                  filteredCoaches.length === 0 && (
                    <div
                      ref={coachDropdownRef}
                      className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4"
                    >
                      <p className="text-sm text-gray-500 text-center">
                        No coaches found for {sport || coachSport}
                      </p>
                    </div>
                  )}

                {/* HELPER TEXT */}
                {!sport && user?.role !== "Coach" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Please select a sport first to see available coaches
                  </p>
                )}
              </div>

              <div className="mb-4">
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

              <div className="mb-4">
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

              <div className="mb-4">
                <FloatingLabelInput
                  label="Points/Score"
                  type="text"
                  name="points_score"
                  value={pointsScore}
                  onChange={(e) => setPointsScore(e.target.value)}
                  errors={errors.points_score}
                />
              </div>

              <div className="mb-4">
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
          <div className="flex justify-end gap-2 px-4 pb-4">
            {!loadingStore && <CloseButton label="Close" onClose={onClose} />}
            <SubmitButton
              label="Save Record"
              loading={loadingStore}
              loadingLabel="Saving Record..."
            />
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AddRecordFormModal;
