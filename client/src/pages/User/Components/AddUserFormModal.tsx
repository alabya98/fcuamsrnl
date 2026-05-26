// client/src/pages/User/Components/AddUserFormModal.tsx
import { useEffect, useState, type FC, type FormEvent } from "react";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelSelect";
import SubmitButton from "../../../components/button/SubmitButton";
import CloseButton from "../../../components/button/CloseButton";
import GenderService from "../../../services/GenderService";
import UserService from "../../../services/UserService";
import type { UserFieldErrors } from "../../../interfaces/UserInterface";
import type { GenderColumns } from "../../../interfaces/GenderInterface";

interface AddUserFormModalProps {
  onUserAdded: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const AddUserFormModal: FC<AddUserFormModalProps> = ({
  onUserAdded,
  refreshKey,
  isOpen,
  onClose,
}) => {
  const [loadingGenders, setLoadingGenders] = useState(false);
  const [genders, setGenders] = useState<GenderColumns[]>([]);

  const [loadingStore, setLoadingStore] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffixName, setSuffixName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<UserFieldErrors>({});

  const handleStoreUser = async (e: FormEvent) => {
    try {
      e.preventDefault();
      setLoadingStore(true);

      const payload = {
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        suffix_name: suffixName,
        gender: gender,
        birth_date: birthDate,
        username: username,
        role: "Admin", // ✅ FIXED: Always Admin
        password: password,
        password_confirmation: passwordConfirmation,
      };

      const res = await UserService.storeUser(payload);

      if (res.status === 200) {
        onUserAdded(res.data.message);

        setFirstName("");
        setMiddleName("");
        setLastName("");
        setSuffixName("");
        setGender("");
        setBirthDate("");
        setUsername("");
        setPassword("");
        setPasswordConfirmation("");
        setErrors({});

        refreshKey();
        onClose();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.log("Unexpected server error during adding user:", error);
      }
    } finally {
      setLoadingStore(false);
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
      handleLoadGenders();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="medium">
      <form
        onSubmit={handleStoreUser}
        className="flex flex-col h-full overflow-hidden"
      >
        <div className="flex-shrink-0 border-b border-gray-200">
          <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
            Add Admin User Form
          </h1>
        </div>

        {/* ✅ NEW: Info Notice */}
        <div className="flex-shrink-0 bg-blue-50 border-b border-blue-200 px-3 sm:px-4 py-2">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Admin Account Only
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                This form is for creating administrator accounts only. To add
                athletes or coaches, use their respective forms which will
                automatically create user accounts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
            <div className="col-span-1">
              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="First Name"
                  type="text"
                  name="first_name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoFocus
                  errors={errors.first_name}
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
            </div>

            <div className="col-span-1">
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
              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Username"
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  errors={errors.username}
                />
              </div>
              {/* ✅ REMOVED: Role Dropdown (Always Admin) */}
              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Password"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  errors={errors.password}
                />
              </div>
              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Password Confirmation"
                  type="password"
                  name="password_confirmation"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  errors={errors.password_confirmation}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col-reverse sm:flex-row justify-end gap-2">
          {!loadingStore && <CloseButton label="Close" onClose={onClose} />}
          <SubmitButton
            label="Save Admin User"
            loading={loadingStore}
            loadingLabel="Saving..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddUserFormModal;