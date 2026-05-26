import { useState, type FC, type FormEvent } from "react";
import CloseButton from "../../../components/button/CloseButton";
import SubmitButton from "../../../components/button/SubmitButton";
import Modal from "../../../components/Modal";
import CoachService from "../../../services/CoachService";
import type { CoachColumns } from "../../../interfaces/CoachInterface";

interface DeleteCoachFormModalProps {
  coach: CoachColumns | null;
  onCoachDeleted: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const DeleteCoachFormModal: FC<DeleteCoachFormModalProps> = ({
  coach,
  onCoachDeleted,
  refreshKey,
  isOpen,
  onClose,
}) => {
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleDeleteCoach = async (e: FormEvent) => {
    try {
      e.preventDefault();

      if (!coach || !coach.coach_id) {
        console.error("❌ No coach or coach_id available");
        return;
      }

      setLoadingDelete(true);

      const res = await CoachService.destroyCoach(coach.coach_id);

      if (res.status === 200) {
        onCoachDeleted(res.data.message);
        refreshKey();
        onClose();
      }
    } catch (error: any) {
      console.error(
        "❌ Unexpected server error occurred during deleting coach: ",
        error
      );
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleCoachFullNameFormat = () => {
    if (!coach) return "";

    let fullName = "";

    if (coach.middle_name) {
      fullName = `${coach.last_name}, ${coach.first_name} ${coach.middle_name.charAt(0)}.`;
    } else {
      fullName = `${coach.last_name}, ${coach.first_name}`;
    }

    if (coach.suffix_name) {
      fullName += ` ${coach.suffix_name}`;
    }

    return fullName;
  };

  if (!coach) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="medium">
      <form onSubmit={handleDeleteCoach} className="flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 border-b border-gray-200">
          <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
            Delete Coach
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
                  Are you sure you want to delete this coach? All associated data will be permanently removed.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Staff ID:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">{coach.staff_id}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Name:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">{handleCoachFullNameFormat()}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Position:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">
                <span className="inline-flex px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-700">
                  {coach.position}
                </span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Sport:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">
                <span className="inline-flex px-2 py-1 text-xs font-bold rounded bg-green-100 text-green-700">
                  {coach.sports_coached}
                </span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Department:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">{coach.department}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Email:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">{coach.contact_email}</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col-reverse sm:flex-row justify-end gap-2">
          {!loadingDelete && <CloseButton label="Cancel" onClose={onClose} />}
          <SubmitButton
            className="bg-red-600 hover:bg-red-700"
            label="Delete Coach"
            loading={loadingDelete}
            loadingLabel="Deleting..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default DeleteCoachFormModal;