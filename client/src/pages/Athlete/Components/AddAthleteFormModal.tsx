// client/src/pages/Athlete/Components/AddAthleteFormModal.tsx
import { useEffect, useState, type FC, type FormEvent } from "react";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import AutocompleteInput from "../../../components/input/AutocompleteInput";
import Modal from "../../../components/Modal";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelSelect";
import SubmitButton from "../../../components/button/SubmitButton";
import CloseButton from "../../../components/button/CloseButton";
import GenderService from "../../../services/GenderService";
import CoachService from "../../../services/CoachService";
import AthleteService from "../../../services/AthleteService";
import UserService from "../../../services/UserService";
import { useAuth } from "../../../contexts/AuthContext";
import type { AthleteFieldErrors } from "../../../interfaces/AthleteInterface";
import type { GenderColumns } from "../../../interfaces/GenderInterface";
import type { CoachColumns } from "../../../interfaces/CoachInterface";

interface AddAthleteFormModalProps {
  onAthleteAdded: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface CredentialsData {
  username: string;
  password: string;
  role: string;
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

const AddAthleteFormModal: FC<AddAthleteFormModalProps> = ({
  onAthleteAdded,
  refreshKey,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const isCoach = user?.role === "Coach";

  const [loadingGenders, setLoadingGenders] = useState(false);
  const [genders, setGenders] = useState<GenderColumns[]>([]);

  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [coaches, setCoaches] = useState<CoachColumns[]>([]);
  const [coachId, setCoachId] = useState("");

  const [loadingStore, setLoadingStore] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<any[]>([]);

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

  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<CredentialsData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

      if (positions.length === 1) {
        setPosition(positions[0]);
      } else {
        setPosition("");
      }
    }
  };

  const handleStoreAthlete = async (e: FormEvent) => {
    try {
      e.preventDefault();
      setLoadingStore(true);

      const payload = {
        school_id: schoolId,
        email: email || null,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        suffix_name: suffixName,
        gender: gender,
        birth_date: birthDate,
        sport: sport,
        position: position,
        department: department,
        coach_id: coachId,
      };

      const res = await AthleteService.storeAthlete(payload);

      if (res.status === 200) {
        if (res.data.credentials) {
          setCredentials(res.data.credentials);
          setShowCredentials(true);
        } else {
          onAthleteAdded(res.data.message);
          resetForm();
          refreshKey();
          onClose();
        }
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.log("Unexpected server error during adding athlete:", error);
      }
    } finally {
      setLoadingStore(false);
    }
  };

  const resetForm = () => {
    setSchoolId("");
    setEmail("");
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setSuffixName("");
    setGender("");
    setBirthDate("");
    setSport("");
    setPosition("");
    setDepartment("");
    setErrors({});

    // If the user is a Coach, re-apply their auto-selection instead of clearing
    if (isCoach && coaches.length > 0) {
      autoSelectCoachFromUser(coaches);
    } else {
      setCoachId("");
      setAvailablePositions([]);
    }
  };

  const handleCredentialsClose = () => {
    setShowCredentials(false);
    setCredentials(null);
    setCopiedField(null);
    onAthleteAdded("Athlete and user account created successfully!");
    resetForm();
    refreshKey();
    onClose();
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrint = () => {
    if (!credentials) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Account Credentials</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 40px;
                max-width: 600px;
                margin: 0 auto;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #396B99;
                padding-bottom: 20px;
              }
              .header h1 {
                color: #396B99;
                margin: 0;
                font-size: 24px;
              }
              .header p {
                color: #666;
                margin: 5px 0 0 0;
              }
              .credentials {
                background: #f8f9fa;
                border: 2px solid #396B99;
                border-radius: 8px;
                padding: 30px;
                margin: 20px 0;
              }
              .credential-row {
                margin: 15px 0;
                padding: 10px;
                background: white;
                border-radius: 4px;
              }
              .credential-label {
                font-weight: bold;
                color: #396B99;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .credential-value {
                font-size: 18px;
                color: #333;
                margin-top: 5px;
                font-family: 'Courier New', monospace;
              }
              .notice {
                background: #fff3cd;
                border: 1px solid #ffc107;
                border-radius: 4px;
                padding: 15px;
                margin-top: 30px;
              }
              .notice-title {
                font-weight: bold;
                color: #856404;
                margin-bottom: 10px;
              }
              .notice-text {
                color: #856404;
                font-size: 14px;
                line-height: 1.6;
              }
              .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                color: #666;
                font-size: 12px;
              }
              @media print {
                body { padding: 20px; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>FAMS Account Credentials</h1>
              <p>Filamer Athlete Management System</p>
            </div>
            <div class="credentials">
              <div class="credential-row">
                <div class="credential-label">Username</div>
                <div class="credential-value">${credentials.username}</div>
              </div>
              <div class="credential-row">
                <div class="credential-label">Password</div>
                <div class="credential-value">${credentials.password}</div>
              </div>
              <div class="credential-row">
                <div class="credential-label">Role</div>
                <div class="credential-value">${credentials.role}</div>
              </div>
            </div>
            <div class="notice">
              <div class="notice-title">⚠️ IMPORTANT SECURITY NOTICE</div>
              <div class="notice-text">
                • Keep these credentials secure and do not share them with others.<br>
                • If you forget your password, contact the system administrator for a reset.<br>
                • You can change your password anytime in Account Settings.
              </div>
            </div>
            <div class="footer">
              Generated on ${new Date().toLocaleString()}<br>
              © ${new Date().getFullYear()} Filamer Christian University
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleLoadGenders = async () => {
    try {
      setLoadingGenders(true);
      const res = await GenderService.loadGenders();
      if (res.status === 200) {
        setGenders(res.data.genders);
      }
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

  const handleLoadUsers = async () => {
    try {
      const res = await UserService.loadUsers();
      if (res.status === 200) {
        setUsers(res.data.users);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const handleCoachFullNameFormat = (coach: CoachColumns) => {
    let fullName = "";
    if (coach.middle_name) {
      fullName = `${coach.first_name} ${coach.middle_name.charAt(0)}. ${coach.last_name}`;
    } else {
      fullName = `${coach.first_name} ${coach.last_name}`;
    }
    if (coach.suffix_name) {
      fullName += ` ${coach.suffix_name}`;
    }
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

      if (positions.length === 1) {
        setPosition(positions[0]);
      } else {
        setPosition("");
      }
    } else {
      setSport("");
      setAvailablePositions([]);
      setPosition("");
    }
  };

  const handleUserSelect = (userData: any) => {
    setSchoolId(
      userData.school_id || userData.staff_id || userData.user_id || "",
    );
    setFirstName(userData.first_name || "");
    setMiddleName(userData.middle_name || "");
    setLastName(userData.last_name || "");
    setSuffixName(userData.suffix_name || "");
    setGender(userData.gender_id || "");
    setBirthDate(userData.birth_date || "");
  };

  useEffect(() => {
    const suggestions = users.map((user) => ({
      value: user.first_name,
      label:
        `${user.first_name} ${user.middle_name || ""} ${user.last_name}`.trim(),
      data: user,
    }));
    setUserSuggestions(suggestions);
  }, [users]);

  useEffect(() => {
    if (isOpen) {
      handleLoadGenders();
      handleLoadCoaches();
      handleLoadUsers();
    }
  }, [isOpen]);

  // ─── Derived display value for the locked coach field ───────────────────────
  const selectedCoach = coaches.find(
    (c) => c.coach_id.toString() === coachId,
  );
  const lockedCoachLabel = selectedCoach
    ? `${handleCoachFullNameFormat(selectedCoach)} - ${selectedCoach.sports_coached}`
    : "Loading...";

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

      {/* MAIN FORM MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="large">
        <form
          onSubmit={handleStoreAthlete}
          className="flex flex-col h-full overflow-hidden"
        >
          <div className="flex-shrink-0 border-b border-gray-200">
            <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
              Add Athlete Form
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
                  <AutocompleteInput
                    label="First Name"
                    name="first_name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onSelect={handleUserSelect}
                    suggestions={userSuggestions}
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
                        {genders.map((gender, index) => (
                          <option value={gender.gender_id} key={index}>
                            {gender.gender}
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
            {!loadingStore && <CloseButton label="Close" onClose={onClose} />}
            <SubmitButton
              label="Save Athlete"
              loading={loadingStore}
              loadingLabel="Saving..."
            />
          </div>
        </form>
      </Modal>

      {/* CREDENTIALS MODAL — unchanged */}
      <Modal
        isOpen={showCredentials}
        onClose={() => {}}
        showCloseButton={false}
        size="medium"
      >
        <div className="flex flex-col h-full">
          <div className="flex-shrink-0 bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg
                  className="w-6 h-6 text-white"
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
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Account Created Successfully!
                </h2>
                <p className="text-green-100 text-sm">
                  Save these credentials securely
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-yellow-800">
                    Important Security Notice
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    These credentials will only be shown once. Please save them
                    securely or print this page.
                  </p>
                </div>
              </div>
            </div>

            {credentials && (
              <div className="space-y-4">
                {[
                  {
                    label: "Username",
                    field: "username",
                    value: credentials.username,
                  },
                  {
                    label: "Password",
                    field: "password",
                    value: credentials.password,
                  },
                ].map(({ label, field, value }) => (
                  <div
                    key={field}
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
                  >
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                      {label}
                    </label>
                    <div className="flex items-center justify-between gap-3">
                      <code className="flex-1 text-lg font-mono font-bold text-gray-900 bg-white px-4 py-2 rounded-lg border border-gray-200">
                        {value}
                      </code>
                      <button
                        onClick={() => handleCopy(value, field)}
                        className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-semibold"
                      >
                        {copiedField === field ? (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Role
                  </label>
                  <div className="text-lg font-bold text-gray-900 bg-white px-4 py-2 rounded-lg border border-gray-200">
                    {credentials.role}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Next Steps
              </h3>
              <ul className="text-sm text-blue-800 space-y-1.5 ml-6">
                <li className="list-disc">
                  Provide these credentials to the athlete
                </li>
                <li className="list-disc">
                  Store these credentials securely or print this page
                </li>
                <li className="list-disc">
                  Users can change their password in Account Settings
                </li>
              </ul>
            </div>
          </div>

          <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-semibold"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print Credentials
            </button>
            <button
              onClick={handleCredentialsClose}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              I've Saved the Credentials
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AddAthleteFormModal;