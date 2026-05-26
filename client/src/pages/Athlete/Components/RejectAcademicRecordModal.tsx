import { useState, type FC, type FormEvent } from "react";
import CloseButton from "../../../components/button/CloseButton";
import SubmitButton from "../../../components/button/SubmitButton";
import Modal from "../../../components/Modal";
import AcademicRecordService from "../../../services/AcademicRecordService";
import type { AcademicRecordColumns } from "../../../interfaces/AcademicRecordInterface";

interface RejectAcademicRecordModalProps {
  record: AcademicRecordColumns | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RejectAcademicRecordModal: FC<RejectAcademicRecordModalProps> = ({
  record,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesError, setNotesError] = useState("");

  const handleReject = async (e: FormEvent) => {
    e.preventDefault();
    if (!record) return;

    if (!notes.trim()) {
      setNotesError("Please provide a reason for rejection.");
      return;
    }

    try {
      setLoading(true);
      const res = await AcademicRecordService.rejectRecord(record.academic_record_id, notes.trim());
      if (res.status === 200) {
        setNotes("");
        setNotesError("");
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error("❌ Error rejecting academic record:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNotes("");
    setNotesError("");
    onClose();
  };

  if (!record) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} showCloseButton size="medium">
      <form onSubmit={handleReject} className="flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 border-b border-gray-200">
          <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
            Reject Academic Record
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0"
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
              <div>
                <h3 className="text-sm font-bold text-red-800 mb-1">
                  Confirm Rejection
                </h3>
                <p className="text-sm text-red-700">
                  This academic record will be rejected. The athlete will be notified with the reason you provide below.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-3 mb-4">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Semester:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">{record.semester_term}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">GWA:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">
                {record.gwa_grade !== null && record.gwa_grade !== undefined
                  ? Number(record.gwa_grade).toFixed(2)
                  : "N/A"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Percentage:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">
                {record.calculated_percentage !== null && record.calculated_percentage !== undefined
                  ? `${Number(record.calculated_percentage).toFixed(2)}%`
                  : "N/A"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Courses:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">{record.courses.length}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Current Status:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">
                <span className="inline-flex px-2 py-1 text-xs font-bold rounded bg-yellow-100 text-yellow-700">
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </span>
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (e.target.value.trim()) setNotesError("");
              }}
              placeholder="Enter the reason for rejection..."
              rows={4}
              className={`w-full px-3 py-2 border-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none ${
                notesError
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 focus:border-red-500"
              }`}
            />
            {notesError && (
              <p className="text-xs text-red-600 font-semibold mt-1">{notesError}</p>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col-reverse sm:flex-row justify-end gap-2">
          {!loading && <CloseButton label="Cancel" onClose={handleClose} />}
          <SubmitButton
            className="bg-red-600 hover:bg-red-700"
            label="Reject Record"
            loading={loading}
            loadingLabel="Rejecting..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default RejectAcademicRecordModal;