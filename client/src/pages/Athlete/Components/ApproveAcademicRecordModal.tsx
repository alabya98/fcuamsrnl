import { useState, type FC, type FormEvent } from "react";
import CloseButton from "../../../components/button/CloseButton";
import SubmitButton from "../../../components/button/SubmitButton";
import Modal from "../../../components/Modal";
import AcademicRecordService from "../../../services/AcademicRecordService";
import type { AcademicRecordColumns } from "../../../interfaces/AcademicRecordInterface";

interface ApproveAcademicRecordModalProps {
  record: AcademicRecordColumns | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ApproveAcademicRecordModal: FC<ApproveAcademicRecordModalProps> = ({
  record,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleApprove = async (e: FormEvent) => {
    e.preventDefault();
    if (!record) return;

    try {
      setLoading(true);
      const res = await AcademicRecordService.approveRecord(record.academic_record_id);
      if (res.status === 200) {
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      console.error("❌ Error approving academic record:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!record) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="medium">
      <form onSubmit={handleApprove} className="flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 border-b border-gray-200">
          <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
            Approve Academic Record
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded">
            <div className="flex items-start">
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
              <div>
                <h3 className="text-sm font-bold text-green-800 mb-1">
                  Confirm Approval
                </h3>
                <p className="text-sm text-green-700">
                  Approve this academic record? The athlete may be marked Eligible if no other pending records remain.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
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
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Units:</span>
              <span className="text-sm font-medium text-gray-900 col-span-2">{record.total_units}</span>
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
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col-reverse sm:flex-row justify-end gap-2">
          {!loading && <CloseButton label="Cancel" onClose={onClose} />}
          <SubmitButton
            className="bg-green-600 hover:bg-green-700"
            label="Approve Record"
            loading={loading}
            loadingLabel="Approving..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default ApproveAcademicRecordModal;