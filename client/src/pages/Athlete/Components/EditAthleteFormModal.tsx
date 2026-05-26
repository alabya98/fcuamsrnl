// client/src/pages/Athlete/Components/EditAthleteFormModal.tsx
import { useEffect, useState, type FC, type FormEvent } from "react";
import CloseButton from "../../../components/button/CloseButton";
import SubmitButton from "../../../components/button/SubmitButton";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelSelect";
import GenderService from "../../../services/GenderService";
import CoachService from "../../../services/CoachService";
import AthleteService from "../../../services/AthleteService";
import { useAuth } from "../../../contexts/AuthContext";
import type {
  AthleteColumns,
  AthleteFieldErrors,
} from "../../../interfaces/AthleteInterface";
import type { GenderColumns } from "../../../interfaces/GenderInterface";
import type { CoachColumns } from "../../../interfaces/CoachInterface";

interface EditAthleteFormModalProps {
  athlete: AthleteColumns | null;
  onAthleteUpdated: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const DEPARTMENTS = ["CAS", "CBA", "CCS", "CCJE", "COE", "CHTM", "CN", "CTE"];

const SPORT_POSITIONS: Record<string, string[]> = {
  Basketball: [
    "Point Guard",
    "Shooting Guard",
    "Small Forward",
    "Power Forward",
    "Center",
  ],
  Volleyball: [
    "Setter",
    "Outside Hitter",
    "Middle Blocker",
    "Opposite Hitter",
    "Libero",
  ],
  Athletics: [
    "Sprinter",
    "Distance Runner",
    "Jumper",
    "Thrower",
    "Hurdler",
    "Multi-Event Athlete",
  ],
  "Table Tennis": ["Player"],
  Badminton: ["Singles Player", "Doubles Player"],
  Swimming: [
    "Freestyle",
    "Backstroke",
    "Breaststroke",
    "Butterfly",
    "Individual Medley",
  ],
  Chess: ["Player"],
  "Basketball (Male)": [
    "Point Guard",
    "Shooting Guard",
    "Small Forward",
    "Power Forward",
    "Center",
  ],
  "Basketball (Female)": [
    "Point Guard",
    "Shooting Guard",
    "Small Forward",
    "Power Forward",
    "Center",
  ],
  "Volleyball (Male)": [
    "Setter",
    "Outside Hitter",
    "Middle Blocker",
    "Opposite Hitter",
    "Libero",
  ],
  "Volleyball (Female)": [
    "Setter",
    "Outside Hitter",
    "Middle Blocker",
    "Opposite Hitter",
    "Libero",
  ],
  "Athletics (Male)": [
    "Sprinter",
    "Distance Runner",
    "Jumper",
    "Thrower",
    "Hurdler",
    "Multi-Event Athlete",
  ],
  "Athletics (Female)": [
    "Sprinter",
    "Distance Runner",
    "Jumper",
    "Thrower",
    "Hurdler",
    "Multi-Event Athlete",
  ],
  "Table Tennis (Male)": ["Player"],
  "Table Tennis (Female)": ["Player"],
  "Badminton (Male)": ["Singles Player", "Doubles Player"],
  "Badminton (Female)": ["Singles Player", "Doubles Player"],
  "Swimming (Male)": [
    "Freestyle",
    "Backstroke",
    "Breaststroke",
    "Butterfly",
    "Individual Medley",
  ],
  "Swimming (Female)": [
    "Freestyle",
    "Backstroke",
    "Breaststroke",
    "Butterfly",
    "Individual Medley",
  ],
  "Chess (Male)": ["Player"],
  "Chess (Female)": ["Player"],
};

const getPositionsForSport = (sportName: string): string[] => {
  if (SPORT_POSITIONS[sportName]) {
    return SPORT_POSITIONS[sportName];
  }
  const baseSport = sportName.replace(/\s*\((Male|Female)\)\s*$/i, "").trim();
  return SPORT_POSITIONS[baseSport] || ["Player"];
};

const EditAthleteFormModal: FC<EditAthleteFormModalProps> = ({
  athlete,
  onAthleteUpdated,
  refreshKey,
  isOpen,
  onClose,
}) => {
  // ─── Auth ────────────────────────────────────────────────────────────────────
  const { user } = useAuth();
  const isCoach = user?.role === "Coach";

  const [loadingGenders, setLoadingGenders] = useState(false);
  const [genders, setGenders] = useState<GenderColumns[]>([]);

  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [coaches, setCoaches] = useState<CoachColumns[]>([]);
  const [coachId, setCoachId] = useState("");

  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [schoolId, setSchoolId] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffixName, setSuffixName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sport, setSport] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [errors, setErrors] = useState<AthleteFieldErrors>({});

  const [availablePositions, setAvailablePositions] = useState<string[]>([]);

  // ─── Auto-select coach when logged-in user is a Coach ───────────────────────
  const autoSelectCoachFromUser = (loadedCoaches: CoachColumns[]) => {
    if (!isCoach || !user) return;

    const myCoachRecord = loadedCoaches.find(
      (coach) => coach.user_id === user.user_id,
    );

    if (myCoachRecord) {
      const id = myCoachRecord.coach_id.toString();
      setCoachId(id);

      const selectedSport = myCoachRecord.sports_coached || "";
      setSport(selectedSport);

      const positions = getPositionsForSport(selectedSport);
      setAvailablePositions(positions);
    }
  };

  const handleUpdateAthlete = async (e: FormEvent) => {
    try {
      e.preventDefault();

      if (!athlete || !athlete.athlete_id) {
        console.error("No athlete or athlete_id available");
        return;
      }

      if (!gender) {
        setErrors({ gender: ["The gender field is required."] });
        return;
      }

      setLoadingUpdate(true);

      const payload = {
        school_id: schoolId,
        email: email || null,
        first_name: firstName,
        middle_name: middleName || null,
        last_name: lastName,
        suffix_name: suffixName || null,
        gender: gender,
        birth_date: birthDate,
        sport: sport,
        position: position,
        department: department,
        coach_id: coachId,
      };

      const res = await AthleteService.updateAthlete(
        athlete.athlete_id,
        payload,
      );

      if (res.status === 200) {
        setErrors({});
        onAthleteUpdated(res.data.message);
        refreshKey();
        onClose();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        console.error("Error updating athlete:", error);
      }
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleLoadGenders = async () => {
    try {
      setLoadingGenders(true);
      const res = await GenderService.loadGenders();
      if (res.status === 200) setGenders(res.data.genders);
    } catch (error) {
      console.error("Error loading genders:", error);
    } finally {
      setLoadingGenders(false);
    }
  };

  const handleLoadCoaches = async () => {
    try {
      setLoadingCoaches(true);
      const res = await CoachService.loadCoaches();
      if (res.status === 200) {
        setCoaches(res.data.coaches);
        // Auto-select the logged-in coach immediately after loading
        autoSelectCoachFromUser(res.data.coaches);
      }
    } catch (error) {
      console.error("Error loading coaches:", error);
    } finally {
      setLoadingCoaches(false);
    }
  };

  const handleCoachFullNameFormat = (coach: CoachColumns) => {
    let fullName = coach.middle_name
      ? `${coach.first_name} ${coach.middle_name.charAt(0)}. ${coach.last_name}`
      : `${coach.first_name} ${coach.last_name}`;
    if (coach.suffix_name) fullName += ` ${coach.suffix_name}`;
    return fullName;
  };

  const handleCoachChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCoachId = e.target.value;
    setCoachId(selectedCoachId);

    const selectedCoach = coaches.find(
      (coach) => coach.coach_id.toString() === selectedCoachId,
    );
    if (selectedCoach) {
      const selectedSport = selectedCoach.sports_coached || "";
      setSport(selectedSport);

      const positions = getPositionsForSport(selectedSport);
      setAvailablePositions(positions);

      if (!positions.includes(position)) {
        setPosition(positions.length === 1 ? positions[0] : "");
      }
    } else {
      setSport("");
      setAvailablePositions([]);
      setPosition("");
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleLoadGenders();
      handleLoadCoaches();
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && athlete) {
      setSchoolId(athlete.school_id || "");
      setEmail(athlete.email || "");
      setFirstName(athlete.first_name || "");
      setMiddleName(athlete.middle_name ?? "");
      setLastName(athlete.last_name || "");
      setSuffixName(athlete.suffix_name ?? "");

      if (athlete.gender?.gender_id) {
        setGender(athlete.gender.gender_id.toString());
      } else {
        setGender("");
      }

      if (athlete.birth_date) {
        const dateObj = new Date(athlete.birth_date);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        setBirthDate(`${year}-${month}-${day}`);
      } else {
        setBirthDate("");
      }

      const athleteSport = athlete.sport || "";
      setSport(athleteSport);
      setPosition(athlete.position || "");
      setDepartment(athlete.department || "");

      // For Admins: restore the athlete's assigned coach from the record.
      // For Coaches: their coach_id is already locked via autoSelectCoachFromUser
      // (called in handleLoadCoaches), so we don't overwrite it here.
      if (!isCoach) {
        setCoachId(athlete.coach_id?.toString() || "");
      }

      const positions = getPositionsForSport(athleteSport);
      setAvailablePositions(positions);
    }
  }, [isOpen, athlete]);

  // ─── Derived display value for the locked coach field ───────────────────────
  const selectedCoach = coaches.find(
    (c) => c.coach_id.toString() === coachId,
  );
  const lockedCoachLabel = selectedCoach
    ? `${handleCoachFullNameFormat(selectedCoach)} - ${selectedCoach.sports_coached}`
    : "Loading...";

  if (!athlete) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
        <div className="p-4">
          <p>No athlete data available.</p>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <style>
        {`
          .coach-select-wrapper select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234B5563'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            background-size: 1.25rem;
            padding-right: 2.5rem;
          }
          .coach-select-wrapper select option { padding: 12px 16px; font-size: 14px; }
          .coach-select-wrapper select option:first-child { color: #9CA3AF; font-weight: 500; }
          .coach-select-wrapper select option:not(:first-child) { padding: 10px 12px; border-bottom: 1px solid #F3F4F6; }
          .coach-select-wrapper select option:hover { background-color: #EFF6FF; }
        `}
      </style>

      <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="large">
        <form
          onSubmit={handleUpdateAthlete}
          className="flex flex-col h-full overflow-hidden"
        >
          <div className="flex-shrink-0 border-b border-gray-200">
            <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
              Edit Athlete Form
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
              {/* LEFT COLUMN */}
              <div className="col-span-1">
                <div className="mb-2 sm:mb-3">
                  <FloatingLabelInput
                    label="School ID"
                    type="text"
                    name="school_id"
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    required
                    autoFocus
                    errors={errors.school_id}
                  />
                </div>
                <div className="mb-2 sm:mb-3">
                  <FloatingLabelInput
                    label="Email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    errors={errors.email}
                  />
                </div>
                <div className="mb-2 sm:mb-3">
                  <FloatingLabelInput
                    label="First Name"
                    type="text"
                    name="first_name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    errors={errors.first_name}
                  />
                </div>
                <div className="mb-2 sm:mb-3">
                  <FloatingLabelInput
                    label="Middle Name"
                    type="text"
                    name="middle_name"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    errors={errors.middle_name}
                  />
                </div>
                <div className="mb-2 sm:mb-3">
                  <FloatingLabelInput
                    label="Last Name"
                    type="text"
                    name="last_name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    errors={errors.last_name}
                  />
                </div>
                <div className="mb-2 sm:mb-3">
                  <FloatingLabelInput
                    label="Suffix Name"
                    type="text"
                    name="suffix_name"
                    value={suffixName}
                    onChange={(e) => setSuffixName(e.target.value)}
                    errors={errors.suffix_name}
                  />
                </div>
                <div className="mb-2 sm:mb-3">
                  <FloatingLabelSelect
                    label="Gender"
                    name="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    required
                    errors={errors.gender}
                  >
                    {loadingGenders ? (
                      <option value="">Loading...</option>
                    ) : (
                      <>
                        <option value="">Select Gender</option>
                        {genders.map((g, index) => (
                          <option value={g.gender_id} key={index}>
                            {g.gender}
                          </option>
                        ))}
                      </>
                    )}
                  </FloatingLabelSelect>
                </div>
                <div className="mb-2 sm:mb-3">
                  <FloatingLabelInput
                    label="Birth Date"
                    type="date"
                    name="birth_date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    errors={errors.birth_date}
                  />
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="col-span-1">
                <div className="mb-2 sm:mb-3 coach-select-wrapper">

                  {/* ── Coach is locked to themselves; Admin keeps the dropdown ── */}
                  {isCoach ? (
                    <FloatingLabelInput
                      label="Assigned Coach"
                      type="text"
                      name="coach_display"
                      value={loadingCoaches ? "Loading..." : lockedCoachLabel}
                      readOnly
                      disabled
                      errors={errors.coach_id}
                    />
                  ) : (
                    <FloatingLabelSelect
                      label="Assign Coach"
                      name="coach_id"
                      value={coachId}
                      onChange={handleCoachChange}
                      required
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
                              style={{ padding: "10px", lineHeight: "1.6" }}
                            >
                              {handleCoachFullNameFormat(coach)} -{" "}
                              {coach.sports_coached}
                            </option>
                          ))}
                        </>
                      )}
                    </FloatingLabelSelect>
                  )}

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
                          {selectedCoach?.sports_coached}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-2 sm:mb-3">
                  <FloatingLabelInput
                    label="Sport (Auto-filled)"
                    type="text"
                    name="sport"
                    value={sport}
                    readOnly
                    disabled
                    errors={errors.sport}
                  />
                </div>

                <div className="mb-2 sm:mb-3">
                  <FloatingLabelSelect
                    label="Position*"
                    name="position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    required
                    disabled={availablePositions.length === 0}
                    errors={errors.position}
                  >
                    {availablePositions.length === 0 ? (
                      <option value="">Select a coach first</option>
                    ) : (
                      <>
                        <option value="">Select Position</option>
                        {availablePositions.map((pos, index) => (
                          <option value={pos} key={index}>
                            {pos}
                          </option>
                        ))}
                      </>
                    )}
                  </FloatingLabelSelect>
                </div>

                <div className="mb-2 sm:mb-3">
                  <FloatingLabelSelect
                    label="Department"
                    name="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                    errors={errors.department}
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </FloatingLabelSelect>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col-reverse sm:flex-row justify-end gap-2">
            {!loadingUpdate && <CloseButton label="Close" onClose={onClose} />}
            <SubmitButton
              label="Update Athlete"
              loading={loadingUpdate}
              loadingLabel="Updating..."
            />
          </div>
        </form>
      </Modal>
    </>
  );
};

export default EditAthleteFormModal;
