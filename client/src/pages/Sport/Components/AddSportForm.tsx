import { useState, type FC, type FormEvent } from "react";
import SubmitButton from "../../../components/button/SubmitButton";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import SportService from "../../../services/SportService";
import type { SportFieldErrors } from "../../../interfaces/SportInterface";

interface AddSportFormProps {
  onSportAdded: (message: string) => void;
  refreshKey: () => void;
}

const AddSportForm: FC<AddSportFormProps> = ({ onSportAdded, refreshKey }) => {
  const [loadingStore, setLoadingStore] = useState(false);
  const [sport, setSport] = useState("");
  const [errors, setErrors] = useState<SportFieldErrors>({});

  const handleStoreSport = async (e: FormEvent) => {
    try {
      e.preventDefault();

      setLoadingStore(true);

      const res = await SportService.storeSport({ sport });

      if (res.status === 200) {
        setSport("");
        setErrors({});
        onSportAdded(res.data.message);
        refreshKey();
      } else {
        console.error(
          "Unexpected error occurred during store sport: ",
          res.data
        );
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error(
          "Unexpected server error occurred during store sport: ",
          error
        );
      }
    } finally {
      setLoadingStore(false);
    }
  };

  return (
    <>
      <form onSubmit={handleStoreSport}>
        <div className="mb-4">
          <FloatingLabelInput
            label="Sport"
            type="text"
            name="sport"
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            required
            autoFocus
            errors={errors.sport}
          />
        </div>
        <div className="flex justify-end">
          <SubmitButton
            label="Save Sport"
            loading={loadingStore}
            loadingLabel="Saving Sport..."
          />
        </div>
      </form>
    </>
  );
};

export default AddSportForm;
