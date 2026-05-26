import { useEffect, useState, type FC, type FormEvent } from "react";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import AutocompleteInput from "../../../components/input/AutocompleteInput";
import Modal from "../../../components/Modal";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelSelect";
import SubmitButton from "../../../components/button/SubmitButton";
import CloseButton from "../../../components/button/CloseButton";
import SportService from "../../../services/SportService";
import CoachService from "../../../services/CoachService";
import UserService from "../../../services/UserService";
import GenderService from "../../../services/GenderService";
import type { CoachFieldErrors } from "../../../interfaces/CoachInterface";
import type { SportColumns } from "../../../interfaces/SportInterface";
import type { GenderColumns } from "../../../interfaces/GenderInterface";

interface AddCoachFormModalProps {
  onCoachAdded: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
}

interface CredentialsData {
  username: string;
  password: string;
  role: string;
}

const AddCoachFormModal: FC<AddCoachFormModalProps> = ({
  onCoachAdded,
  refreshKey,
  isOpen,
  onClose,
}) => {
  const [loadingSports, setLoadingSports] = useState(false);
  const [sports, setSports] = useState<SportColumns[]>([]);

  const [loadingGenders, setLoadingGenders] = useState(false);
  const [genders, setGenders] = useState<GenderColumns[]>([]);

  const [loadingStore, setLoadingStore] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<any[]>([]);

  // ✅ REMOVED: staffId state — no longer needed
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffixName, setSuffixName] = useState("");
  const [sportsCoached, setSportsCoached] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [genderId, setGenderId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [errors, setErrors] = useState<CoachFieldErrors>({});

  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<CredentialsData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleStoreCoach = async (e: FormEvent) => {
    try {
      e.preventDefault();
      setLoadingStore(true);

      // ✅ REMOVED: staff_id from payload — backend generates it automatically
      const payload = {
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        suffix_name: suffixName,
        position: "Head Coach",
        sports_coached: sportsCoached,
        contact_email: contactEmail,
        gender_id: genderId,
        birth_date: birthDate,
      };

      const res = await CoachService.storeCoach(payload);

      if (res.status === 200) {
        if (res.data.credentials) {
          setCredentials(res.data.credentials);
          setShowCredentials(true);
        } else {
          onCoachAdded(res.data.message);
          resetForm();
          refreshKey();
          onClose();
        }
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.log("Unexpected server error during adding coach:", error);
      }
    } finally {
      setLoadingStore(false);
    }
  };

  const resetForm = () => {
    // ✅ REMOVED: setStaffId reset
    setFirstName("");
    setMiddleName("");
    setLastName("");
    setSuffixName("");
    setSportsCoached("");
    setContactEmail("");
    setGenderId("");
    setBirthDate("");
    setErrors({});
  };

  const handleCredentialsClose = () => {
    setShowCredentials(false);
    setCredentials(null);
    setCopiedField(null);
    onCoachAdded("Coach and user account created successfully!");
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
              body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #396B99; padding-bottom: 20px; }
              .header h1 { color: #396B99; margin: 0; font-size: 24px; }
              .header p { color: #666; margin: 5px 0 0 0; }
              .credentials { background: #f8f9fa; border: 2px solid #396B99; border-radius: 8px; padding: 30px; margin: 20px 0; }
              .credential-row { margin: 15px 0; padding: 10px; background: white; border-radius: 4px; }
              .credential-label { font-weight: bold; color: #396B99; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
              .credential-value { font-size: 18px; color: #333; margin-top: 5px; font-family: 'Courier New', monospace; }
              .notice { background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 15px; margin-top: 30px; }
              .notice-title { font-weight: bold; color: #856404; margin-bottom: 10px; }
              .notice-text { color: #856404; font-size: 14px; line-height: 1.6; }
              .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
              @media print { body { padding: 20px; } }
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
                <div class="credential-label">Temporary Password</div>
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
                • This is a temporary password. You will be required to change it upon first login.<br>
                • Keep these credentials secure and do not share them with others.<br>
                • If you forget your password, contact the system administrator for a reset.<br>
                • This document should be securely destroyed after the password has been changed.
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

  const handleUserSelect = (userData: any) => {
    setFirstName(userData.first_name || "");
    setMiddleName(userData.middle_name || "");
    setLastName(userData.last_name || "");
    setSuffixName(userData.suffix_name || "");
    setGenderId(userData.gender_id?.toString() || "");
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
      handleLoadSports();
      handleLoadGenders();
      handleLoadUsers();
    }
  }, [isOpen]);

  return (
    <>
      {/* MAIN FORM MODAL */}
      <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="medium">
        <form
          onSubmit={handleStoreCoach}
          className="flex flex-col h-full overflow-hidden"
        >
          <div className="flex-shrink-0 border-b border-gray-200">
            <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
              Add Coach Form
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
              {/* LEFT COLUMN */}
              <div className="col-span-1">
                {/* ✅ REMOVED: Staff ID input field */}
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
                          <option
                            value={gender.gender_id}
                            key={gender.gender_id}
                          >
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
            {!loadingStore && <CloseButton label="Close" onClose={onClose} />}
            <SubmitButton
              label="Save Coach"
              loading={loadingStore}
              loadingLabel="Saving..."
            />
          </div>
        </form>
      </Modal>

      {/* CREDENTIALS MODAL */}
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
                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <div className="flex items-center justify-between gap-3">
                    <code className="flex-1 text-lg font-mono font-bold text-gray-900 bg-white px-4 py-2 rounded-lg border border-gray-200">
                      {credentials.username}
                    </code>
                    <button
                      onClick={() =>
                        handleCopy(credentials.username, "username")
                      }
                      className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-semibold"
                    >
                      {copiedField === "username" ? (
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
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                    Temporary Password
                  </label>
                  <div className="flex items-center justify-between gap-3">
                    <code className="flex-1 text-lg font-mono font-bold text-gray-900 bg-white px-4 py-2 rounded-lg border border-gray-200">
                      {credentials.password}
                    </code>
                    <button
                      onClick={() =>
                        handleCopy(credentials.password, "password")
                      }
                      className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-semibold"
                    >
                      {copiedField === "password" ? (
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
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

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
                  The user must change this password upon first login
                </li>
                <li className="list-disc">
                  Store these credentials securely or print this page
                </li>
                <li className="list-disc">
                  Contact the administrator if the password needs to be reset
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

export default AddCoachFormModal;
