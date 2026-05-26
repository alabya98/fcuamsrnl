import { useState, type FC, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import SubmitButton from "../../../components/button/SubmitButton";
import CloseButton from "../../../components/button/CloseButton";
import SportService from "../../../services/SportService";
import type { SportFieldErrors } from "../../../interfaces/SportInterface";

interface AddSportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSportAdded: (message: string) => void;
}

const AddSportModal: FC<AddSportModalProps> = ({
  isOpen,
  onClose,
  onSportAdded,
}) => {
  const [loading, setLoading] = useState(false);
  const [sport, setSport] = useState("");
  const [errors, setErrors] = useState<SportFieldErrors>({});

  const handleSubmit = async (e: FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);

      const res = await SportService.storeSport({ sport });

      if (res.status === 200) {
        setSport("");
        setErrors({});
        onSportAdded(res.data.message);
        onClose();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error adding sport:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
      <form onSubmit={handleSubmit}>
        <h1 className="text-2xl border-b border-gray-100 p-4 font-semibold mb-4">
          Add New Sport
        </h1>
        <div className="p-4 border-b border-gray-100 mb-4">
          <FloatingLabelInput
            label="Sport Name"
            type="text"
            name="sport"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            required
            autoFocus
            errors={errors.sport}
          />
        </div>
        <div className="flex justify-end gap-2 px-4 pb-4">
          {!loading && <CloseButton label="Cancel" onClose={onClose} />}
          <SubmitButton
            label="Save Sport"
            loading={loading}
            loadingLabel="Saving..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddSportModal;