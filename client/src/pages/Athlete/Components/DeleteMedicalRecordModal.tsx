import { useState, type FC, type FormEvent } from "react";
import CloseButton from "../../../components/button/CloseButton";
import SubmitButton from "../../../components/button/SubmitButton";
import Modal from "../../../components/Modal";
import MedicalRecordService from "../../../services/MedicalRecordService";
import type { MedicalRecordColumns } from "../../../interfaces/MedicalRecordInterface";

interface DeleteMedicalRecordModalProps {
  record: MedicalRecordColumns | null;
  onRecordDeleted: (message: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const DeleteMedicalRecordModal: FC<DeleteMedicalRecordModalProps> = ({
  record,
  onRecordDeleted,
  isOpen,
  onClose,
}) => {
  const [loadingDelete, setLoadingDelete] = useState(false);

  const handleDeleteMedicalRecord = async (e: FormEvent) => {
    try {
      e.preventDefault();

      if (!record || !record.medical_record_id) {
        console.error("❌ No record or medical_record_id available");
        return;
      }

      setLoadingDelete(true);

      const res = await MedicalRecordService.destroyMedicalRecord(
        record.medical_record_id
      );

      if (res.status === 200) {
        onRecordDeleted(res.data.message);
        onClose();
      }
    } catch (error: any) {
      console.error("❌ Error deleting medical record:", error);
    } finally {
      setLoadingDelete(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!record) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
        <div className="p-4">
          <p>No medical record data available.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
      <form onSubmit={handleDeleteMedicalRecord}>
        <h1 className="text-2xl border-b border-gray-100 p-4 font-semibold mb-4">
          Delete Medical Record
        </h1>
        <div className="p-4 border-b border-gray-100 mb-4">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this medical record?
          </p>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex">
              <span className="font-semibold text-gray-600 w-40">Record Type:</span>
              <span className="text-gray-800">{record.record_type}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-600 w-40">Record Date:</span>
              <span className="text-gray-800">{formatDate(record.record_date)}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-600 w-40">Diagnosis:</span>
              <span className="text-gray-800">{record.diagnosis}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-600 w-40">Treatment:</span>
              <span className="text-gray-800">{record.treatment}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-600 w-40">Doctor:</span>
              <span className="text-gray-800">{record.doctor_name}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-600 w-40">Status:</span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  record.status === "Active"
                    ? "bg-red-100 text-red-800"
                    : record.status === "Resolved"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {record.status}
              </span>
            </div>
          </div>
          <p className="text-red-600 font-medium mt-4">
            This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          {!loadingDelete && <CloseButton label="Cancel" onClose={onClose} />}
          <SubmitButton
            label="Delete Medical Record"
            loading={loadingDelete}
            loadingLabel="Deleting..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default DeleteMedicalRecordModal;