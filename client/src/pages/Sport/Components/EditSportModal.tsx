import { useEffect, useState, type FC, type FormEvent } from "react";
import Modal from "../../../components/Modal";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import SubmitButton from "../../../components/button/SubmitButton";
import CloseButton from "../../../components/button/CloseButton";
import SportService from "../../../services/SportService";
import type {
  SportColumns,
  SportFieldErrors,
} from "../../../interfaces/SportInterface";

interface EditSportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sport: SportColumns | null;
  onSportUpdated: (message: string) => void;
}

const EditSportModal: FC<EditSportModalProps> = ({
  isOpen,
  onClose,
  sport,
  onSportUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [sportName, setSportName] = useState("");
  const [errors, setErrors] = useState<SportFieldErrors>({});

  useEffect(() => {
    if (sport && isOpen) {
      setSportName(sport.sport);
      setErrors({});
    }
  }, [sport, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    try {
      e.preventDefault();

      if (!sport) return;

      setLoading(true);

      const res = await SportService.updateSport(sport.sport_id, {
        sport: sportName,
      });

      if (res.status === 200) {
        setErrors({});
        onSportUpdated(res.data.message);
        onClose();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error updating sport:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!sport) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
      <form onSubmit={handleSubmit}>
        <h1 className="text-2xl border-b border-gray-100 p-4 font-semibold mb-4">
          Edit Sport
        </h1>
        <div className="p-4 border-b border-gray-100 mb-4">
          <FloatingLabelInput
            label="Sport Name"
            type="text"
            name="sport"
            value={sportName}
            onChange={(e) => setSportName(e.target.value)}
            required
            autoFocus
            errors={errors.sport}
          />
        </div>
        <div className="flex justify-end gap-2 px-4 pb-4">
          {!loading && <CloseButton label="Cancel" onClose={onClose} />}
          <SubmitButton
            label="Update Sport"
            loading={loading}
            loadingLabel="Updating..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditSportModal;