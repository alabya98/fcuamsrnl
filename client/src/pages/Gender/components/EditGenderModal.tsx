import { useEffect, useState, type FC, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import SubmitButton from "../../../components/button/SubmitButton";
import CloseButton from "../../../components/button/CloseButton";
import GenderService from "../../../services/GenderService";
import type {
  GenderColumns,
  GenderFieldErrors,
} from "../../../interfaces/GenderInterface";

interface EditGenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  gender: GenderColumns | null;
  onGenderUpdated: (message: string) => void;
}

const EditGenderModal: FC<EditGenderModalProps> = ({
  isOpen,
  onClose,
  gender,
  onGenderUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [genderName, setGenderName] = useState("");
  const [errors, setErrors] = useState<GenderFieldErrors>({});

  useEffect(() => {
    if (gender && isOpen) {
      setGenderName(gender.gender);
      setErrors({});
    }
  }, [gender, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    try {
      e.preventDefault();

      if (!gender) return;

      setLoading(true);

      const res = await GenderService.updateGender(gender.gender_id, {
        gender: genderName,
      });

      if (res.status === 200) {
        setErrors({});
        onGenderUpdated(res.data.message);
        onClose();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error updating gender:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!gender) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
      <form onSubmit={handleSubmit}>
        <h1 className="text-2xl border-b border-gray-100 p-4 font-semibold mb-4">
          Edit Gender
        </h1>
        <div className="p-4 border-b border-gray-100 mb-4">
          <FloatingLabelInput
            label="Gender Category"
            type="text"
            name="gender"
            value={genderName}
            onChange={(e) => setGenderName(e.target.value)}
            required
            autoFocus
            errors={errors.gender}
          />
        </div>
        <div className="flex justify-end gap-2 px-4 pb-4">
          {!loading && <CloseButton label="Cancel" onClose={onClose} />}
          <SubmitButton
            label="Update Gender"
            loading={loading}
            loadingLabel="Updating..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditGenderModal;