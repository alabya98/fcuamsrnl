import { useEffect, useState, type FC, type FormEvent } from "react";
import CloseButton from "../../../components/button/CloseButton";
import SubmitButton from "../../../components/button/SubmitButton";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelSelect";
import SportService from "../../../services/SportService";
import CoachService from "../../../services/CoachService";
import GenderService from "../../../services/GenderService";
import type {
  CoachColumns,
  CoachFieldErrors,
} from "../../../interfaces/CoachInterface";
import type { SportColumns } from "../../../interfaces/SportInterface";
import type { GenderColumns } from "../../../interfaces/GenderInterface";

interface EditCoachFormModalProps {
  coach: CoachColumns | null;
  onCoachUpdated: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const EditCoachFormModal: FC<EditCoachFormModalProps> = ({
  coach,
  onCoachUpdated,
  refreshKey,
  isOpen,
  onClose,
}) => {
  const [loadingSports, setLoadingSports] = useState(false);
  const [sports, setSports] = useState<SportColumns[]>([]);

  const [loadingGenders, setLoadingGenders] = useState(false);
  const [genders, setGenders] = useState<GenderColumns[]>([]);

  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [staffId, setStaffId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffixName, setSuffixName] = useState("");
  const [position, setPosition] = useState("Head Coach"); // ✅ Added position state
  const [sportsCoached, setSportsCoached] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [genderId, setGenderId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [errors, setErrors] = useState<CoachFieldErrors>({});

  const handleUpdateCoach = async (e: FormEvent) => {
    try {
      e.preventDefault();

      if (!coach || !coach.coach_id) {
        console.error("No coach or coach_id available");
        return;
      }

      setLoadingUpdate(true);

      const payload = {
        staff_id: staffId,
        first_name: firstName,
        middle_name: middleName || null,
        last_name: lastName,
        suffix_name: suffixName || null,
        position: position, // ✅ Use the position state instead of hardcoded "Coach"
        sports_coached: sportsCoached,
        contact_email: contactEmail,
        gender_id: genderId,
        birth_date: birthDate,
      };

      const res = await CoachService.updateCoach(coach.coach_id, payload);

      if (res.status === 200) {
        setErrors({});
        onCoachUpdated(res.data.message);
        refreshKey();
        onClose();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors || {};
        setErrors(validationErrors);
      } else {
        console.error("Error updating coach:", error);
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
      }
    } catch (error) {
      console.error("Error loading sports:", error);
    } finally {
      setLoadingSports(false);
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

  useEffect(() => {
    if (isOpen) {
      handleLoadSports();
      handleLoadGenders();
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && coach) {
      setStaffId(coach.staff_id || "");
      setFirstName(coach.first_name || "");
      setMiddleName(coach.middle_name ?? "");
      setLastName(coach.last_name || "");
      setSuffixName(coach.suffix_name ?? "");
      setPosition(coach.position || "Head Coach"); // ✅ Load coach's existing position
      setSportsCoached(coach.sports_coached || "");
      setContactEmail(coach.contact_email || "");

      if (coach.user && coach.user.gender_id) {
        setGenderId(coach.user.gender_id.toString());
      } else if (coach.gender && coach.gender.gender_id) {
        setGenderId(coach.gender.gender_id.toString());
      } else if (coach.gender_id) {
        setGenderId(coach.gender_id.toString());
      } else {
        setGenderId("");
      }

      const birthDateValue = coach.user?.birth_date || coach.birth_date;

      if (birthDateValue) {
        const dateObj = new Date(birthDateValue);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const day = String(dateObj.getDate()).padStart(2, "0");
        setBirthDate(`${year}-${month}-${day}`);
      } else {
        setBirthDate("");
      }
    }
  }, [isOpen, coach]);

  if (!coach) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="medium">
      <form
        onSubmit={handleUpdateCoach}
        className="flex flex-col h-full overflow-hidden"
      >
        <div className="flex-shrink-0 border-b border-gray-200">
          <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
            Edit Coach Form
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
            {/* LEFT COLUMN */}
            <div className="col-span-1">
              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Staff ID"
                  type="text"
                  name="staff_id"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value)}
                  required
                  autoFocus
                  errors={errors.staff_id}
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
            </div>

            {/* RIGHT COLUMN */}
            <div className="col-span-1">
              <div className="mb-2 sm:mb-3">
                <FloatingLabelSelect
                  label="Gender"
                  name="gender_id"
                  value={genderId}
                  onChange={(e) => setGenderId(e.target.value)}
                  required
                  errors={errors.gender_id}
                >
                  {loadingGenders ? (
                    <option value="">Loading...</option>
                  ) : (
                    <>
                      <option value="">Select Gender</option>
                      {genders.map((gender) => (
                        <option value={gender.gender_id} key={gender.gender_id}>
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

              {/* ✅ Added Position dropdown */}
              <div className="mb-2 sm:mb-3">
                <FloatingLabelSelect
                  label="Position"
                  name="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                  errors={errors.position}
                >
                  <option value="Head Coach">Head Coach</option>
                  <option value="Coach">Coach</option>
                  <option value="Assistant Coach">Assistant Coach</option>
                </FloatingLabelSelect>
              </div>

              <div className="mb-2 sm:mb-3">
                <FloatingLabelSelect
                  label="Sports Coached"
                  name="sports_coached"
                  value={sportsCoached}
                  onChange={(e) => setSportsCoached(e.target.value)}
                  required
                  errors={errors.sports_coached}
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
                  label="Contact Email"
                  type="email"
                  name="contact_email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  errors={errors.contact_email}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col-reverse sm:flex-row justify-end gap-2">
          {!loadingUpdate && <CloseButton label="Close" onClose={onClose} />}
          <SubmitButton
            label="Update Coach"
            loading={loadingUpdate}
            loadingLabel="Updating..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditCoachFormModal;
