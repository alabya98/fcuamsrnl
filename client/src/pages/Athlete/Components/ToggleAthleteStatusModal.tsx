import { useState, type FC, type FormEvent } from "react";
import CloseButton from "../../../components/button/CloseButton";
import SubmitButton from "../../../components/button/SubmitButton";
import Modal from "../../../components/Modal";
import AthleteService from "../../../services/AthleteService";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";

interface ToggleAthleteStatusModalProps {
  athlete: AthleteColumns | null;
  onAthleteStatusToggled: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const ToggleAthleteStatusModal: FC<ToggleAthleteStatusModalProps> = ({
  athlete,
  onAthleteStatusToggled,
  refreshKey,
  isOpen,
  onClose,
}) => {
  const [loadingToggle, setLoadingToggle] = useState(false);

  const newStatus = athlete?.athlete_status === "active" ? "inactive" : "active";
  const isMarkingInactive = newStatus === "inactive";

  const handleToggleStatus = async (e: FormEvent) => {
    try {
      e.preventDefault();

      if (!athlete || !athlete.athlete_id) {
        console.error("❌ No athlete or athlete_id available");
        return;
      }

      setLoadingToggle(true);

      const res = await AthleteService.toggleAthleteStatus(athlete.athlete_id);

      if (res.status === 200) {
        onAthleteStatusToggled(res.data.message);
        refreshKey();
        onClose();
      }
    } catch (error: any) {
      console.error(
        "❌ Unexpected server error occurred during toggling athlete status: ",
        error
      );
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleAthleteFullNameFormat = () => {
    if (!athlete) return "";

    let fullName = "";

    if (athlete.middle_name) {
      fullName = `${athlete.last_name}, ${athlete.first_name} ${athlete.middle_name.charAt(0)}.`;
    } else {
      fullName = `${athlete.last_name}, ${athlete.first_name}`;
    }

    if (athlete.suffix_name) {
      fullName += ` ${athlete.suffix_name}`;
    }

    return fullName;
  };

  if (!athlete) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="medium">
      <form onSubmit={handleToggleStatus} className="flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 border-b border-gray-200">
          <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
            {isMarkingInactive ? "Mark Athlete as Inactive" : "Mark Athlete as Active"}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
          <div
            className={`border-l-4 p-4 mb-4 rounded ${
              isMarkingInactive
                ? "bg-orange-50 border-orange-500"
                : "bg-green-50 border-green-500"
            }`}
          >
            <div className="flex items-start">
              {isMarkingInactive ? (
                <svg
                  className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
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
              )}
              <div>
                <h3
                  className={`text-sm font-bold mb-1 ${
                    isMarkingInactive ? "text-orange-800" : "text-green-800"
                  }`}
                >
                  {isMarkingInactive
                    ? "This athlete will be marked as inactive"
                    : "This athlete will be marked as active"}
                </h3>
                <p
                  className={`text-sm ${
                    isMarkingInactive ? "text-orange-700" : "text-green-700"
                  }`}
                >
                  {isMarkingInactive
                    ? "The athlete will no longer be counted in attendance and practice sessions."
                    : "The athlete will be restored and included in attendance and practice sessions."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">School ID:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">{athlete.school_id}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Name:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">{handleAthleteFullNameFormat()}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Sport:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">
                <span className="inline-flex px-2 py-1 text-xs font-bold rounded bg-green-100 text-green-700">
                  {athlete.sport}
                </span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Department:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">{athlete.department}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Current Status:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold rounded ${
                    athlete.athlete_status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      athlete.athlete_status === "active"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></span>
                  {athlete.athlete_status.charAt(0).toUpperCase() +
                    athlete.athlete_status.slice(1)}
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col-reverse sm:flex-row justify-end gap-2">
          {!loadingToggle && <CloseButton label="Cancel" onClose={onClose} />}
          <SubmitButton
            className={
              isMarkingInactive
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-green-600 hover:bg-green-700"
            }
            label={isMarkingInactive ? "Mark as Inactive" : "Mark as Active"}
            loading={loadingToggle}
            loadingLabel={isMarkingInactive ? "Marking as Inactive..." : "Marking as Active..."}
          />
        </div>
      </form>
    </Modal>
  );
};

export default ToggleAthleteStatusModal;