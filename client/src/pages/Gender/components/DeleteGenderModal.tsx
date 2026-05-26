import { useState, type FC, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import SubmitButton from "../../../components/button/SubmitButton";
import CloseButton from "../../../components/button/CloseButton";
import GenderService from "../../../services/GenderService";
import type { GenderColumns } from "../../../interfaces/GenderInterface";

interface DeleteGenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  gender: GenderColumns | null;
  onGenderDeleted: (message: string) => void;
}

const DeleteGenderModal: FC<DeleteGenderModalProps> = ({
  isOpen,
  onClose,
  gender,
  onGenderDeleted,
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    try {
      e.preventDefault();

      if (!gender) return;

      setLoading(true);

      const res = await GenderService.destroyGender(gender.gender_id);

      if (res.status === 200) {
        onGenderDeleted(res.data.message);
        onClose();
      }
    } catch (error) {
      console.error("Error deleting gender:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!gender) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
      <form onSubmit={handleSubmit}>
        <h1 className="text-2xl border-b border-gray-100 p-4 font-semibold mb-4 text-red-600">
          Delete Gender
        </h1>
        <div className="p-4 border-b border-gray-100 mb-4">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this gender category?
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Gender Category:
            </p>
            <p className="text-lg font-bold text-gray-900">{gender.gender}</p>
          </div>
          <p className="text-red-600 font-medium mt-4 text-sm">
            ⚠️ This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-2 px-4 pb-4">
          {!loading && <CloseButton label="Cancel" onClose={onClose} />}
          <SubmitButton
            label="Delete Gender"
            className="bg-red-600 hover:bg-red-700"
            loading={loading}
            loadingLabel="Deleting..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default DeleteGenderModal;