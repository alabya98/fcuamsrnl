import { useEffect, useState, type FC, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import type { UserColumns } from "../../../interfaces/UserInterface";
import CloseButton from "../../../components/button/CloseButton";
import SubmitButton from "../../../components/button/SubmitButton";
import UserService from "../../../services/UserService";

interface DeleteUserFormModalProps {
  user: UserColumns | null;
  onUserDeleted: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const DeleteUserFormModal: FC<DeleteUserFormModalProps> = ({
  user,
  onUserDeleted,
  refreshKey,
  isOpen,
  onClose,
}) => {
  const [loadingDestroy, setLoadingDestroy] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [suffixName, setSuffixName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");

  const handleDestroyUser = async (e: FormEvent) => {
    try {
      e.preventDefault();

      if (!user || !user.user_id) {
        console.error("❌ No user or user_id available for deletion");
        return;
      }

      setLoadingDestroy(true);

      const res = await UserService.destroyUser(user.user_id);

      if (res.status === 200) {
        onUserDeleted(res.data.message);
        refreshKey();
        onClose();
      } else {
        console.error(
          "Unexpected status error occurred during deleting user: ",
          res.status
        );
      }
    } catch (error) {
      console.error(
        "Unexpected server error occurred during deleting user: ",
        error
      );
    } finally {
      setLoadingDestroy(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      setFirstName(user.first_name);
      setMiddleName(user.middle_name ?? "");
      setLastName(user.last_name);
      setSuffixName(user.suffix_name ?? "");
      setGender(user.gender?.gender || "N/A");
      setBirthDate(user.birth_date);
      setUsername(user.username);
      setRole(user.role);
    }
  }, [isOpen, user]);

  if (!user) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="medium">
      <form onSubmit={handleDestroyUser} className="flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 border-b border-gray-200">
          <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
            Delete User
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-red-800 mb-1">
                  Warning: This action cannot be undone
                </h3>
                <p className="text-sm text-red-700">
                  Are you sure you want to delete this user? All associated data will be permanently removed.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <div className="mb-3">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  First Name
                </label>
                <p className="text-sm font-medium text-gray-900 mt-1">{firstName}</p>
              </div>
              <div className="mb-3">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Middle Name
                </label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {middleName || "N/A"}
                </p>
              </div>
              <div className="mb-3">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Last Name
                </label>
                <p className="text-sm font-medium text-gray-900 mt-1">{lastName}</p>
              </div>
              <div className="mb-3">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Suffix Name
                </label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {suffixName || "N/A"}
                </p>
              </div>
            </div>

            <div>
              <div className="mb-3">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Gender
                </label>
                <p className="text-sm font-medium text-gray-900 mt-1">{gender}</p>
              </div>
              <div className="mb-3">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Birth Date
                </label>
                <p className="text-sm font-medium text-gray-900 mt-1">{birthDate}</p>
              </div>
              <div className="mb-3">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Username
                </label>
                <p className="text-sm font-medium text-gray-900 mt-1">{username}</p>
              </div>
              <div className="mb-3">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Role
                </label>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-bold rounded ${
                    role === 'Admin' ? 'bg-red-100 text-red-700' :
                    role === 'Coach' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {role}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col-reverse sm:flex-row justify-end gap-2">
          {!loadingDestroy && <CloseButton label="Cancel" onClose={onClose} />}
          <SubmitButton
            className="bg-red-600 hover:bg-red-700"
            label="Delete User"
            loading={loadingDestroy}
            loadingLabel="Deleting..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default DeleteUserFormModal;