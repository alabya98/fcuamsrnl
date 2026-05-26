import { useEffect, useState, type FC, type FormEvent } from "react";
import BackButton from "../../../components/button/BackButton";
import SubmitButton from "../../../components/button/SubmitButton";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import SportService from "../../../services/SportService";
import { useParams } from "react-router-dom";
import Spinner from "../../../components/Spinner/Spinner";
import type { SportFieldErrors } from "../../../interfaces/SportInterface";

interface EditSportFormProps {
  onSportUpdated: (message: string) => void;
}

const EditSportForm: FC<EditSportFormProps> = ({ onSportUpdated }) => {
  const [loadingGet, setLoadingGet] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [sport, setSport] = useState("");
  const [errors, setErrors] = useState<SportFieldErrors>({});

  const { sport_id } = useParams();

  const handleGetSport = async (sportId: string | number) => {
    try {
      setLoadingGet(true);

      const res = await SportService.getSport(sportId);

      if (res.status === 200) {
        setSport(res.data.sport.sport);
      } else {
        console.error(
          "Unexpected status error occurred during getting sport:",
          res.status
        );
      }
    } catch (error) {
      console.error(
        "Unexpected server error occurred during getting sport:",
        error
      );
    } finally {
      setLoadingGet(false);
    }
  };

  const handleUpdateSport = async (e: FormEvent) => {
    try {
      e.preventDefault();

      setLoadingUpdate(true);

      const res = await SportService.updateSport(sport_id!, { sport });

      if (res.status === 200) {
        setErrors({});
        setSport(res.data.sport.sport);
        onSportUpdated(res.data.message);
      } else {
        console.error(
          "Unexpected status error occurred during updating sport: ",
          res.status
        );
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error(
          "Unexpected server error occurred during updating sport",
          error
        );
      }
    } finally {
      setLoadingUpdate(false);
    }
  };

  useEffect(() => {
    if (sport_id) {
      const parsedSportId = parseInt(sport_id);
      handleGetSport(parsedSportId);
    } else {
      console.error(
        "Unexpected parameter error occurred during getting sport:",
        sport_id
      );
    }
  }, [sport_id]);

  return (
    <>
      {loadingGet ? (
        <div className="flex justify-center items-center mt-52">
          <Spinner size="lg" />
        </div>
      ) : (
        <form onSubmit={handleUpdateSport}>
          <div className="mb-4">
            <FloatingLabelInput
              label="Sport"
              type="text"
              name="sport"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              errors={errors.sport}
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            {!loadingUpdate && <BackButton label="Back" path="/sports" />}
            <SubmitButton
              label="Update Sport"
              loading={loadingUpdate}
              loadingLabel="Updating Sport..."
            />
          </div>
        </form>
      )}
    </>
  );
};

export default EditSportForm;