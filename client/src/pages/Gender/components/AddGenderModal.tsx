import { useState, type FC, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import SubmitButton from "../../../components/button/SubmitButton";
import CloseButton from "../../../components/button/CloseButton";
import GenderService from "../../../services/GenderService";
import type { GenderFieldErrors } from "../../../interfaces/GenderInterface";

interface AddGenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenderAdded: (message: string) => void;
}

const AddGenderModal: FC<AddGenderModalProps> = ({
  isOpen,
  onClose,
  onGenderAdded,
}) => {
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState("");
  const [errors, setErrors] = useState<GenderFieldErrors>({});

  const handleSubmit = async (e: FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);

      const res = await GenderService.storeGender({ gender });

      if (res.status === 200) {
        setGender("");
        setErrors({});
        onGenderAdded(res.data.message);
        onClose();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error adding gender:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
      <form onSubmit={handleSubmit}>
        <h1 className="text-2xl border-b border-gray-100 p-4 font-semibold mb-4">
          Add New Gender
        </h1>
        <div className="p-4 border-b border-gray-100 mb-4">
          <FloatingLabelInput
            label="Gender Category"
            type="text"
            name="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            autoFocus
            errors={errors.gender}
          />
        </div>
        <div className="flex justify-end gap-2 px-4 pb-4">
          {!loading && <CloseButton label="Cancel" onClose={onClose} />}
          <SubmitButton
            label="Save Gender"
            loading={loading}
            loadingLabel="Saving..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddGenderModal;