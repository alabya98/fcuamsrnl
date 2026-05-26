import { useEffect, useState, type FormEvent } from "react";
import BackButton from "../../../components/button/BackButton";
import SubmitButton from "../../../components/button/SubmitButton";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import { useNavigate, useParams } from "react-router-dom";
import SportService from "../../../services/SportService";
import Spinner from "../../../components/Spinner/Spinner";

const DeleteSportForm = () => {
  const [loadingGet, setLoadingGet] = useState(false);
  const [loadingDestroy, setLoadingDestroy] = useState(false);
  const [sport, setSport] = useState("");

  const { sport_id } = useParams();
  const navigate = useNavigate();

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

  const handleDestroySport = async (e: FormEvent) => {
    try {
      e.preventDefault();

      setLoadingDestroy(true);

      const res = await SportService.destroySport(sport_id!);

      if (res.status === 200) {
        navigate("/sports", { state: { message: res.data.message } });
      } else {
        console.error(
          "Unexpected status error occurred during deleting sport: ",
          res.status
        );
      }
    } catch (error) {
      console.error(
        "Unexpected server error occurred during deleting sport: ",
        error
      );
    } finally {
      setLoadingDestroy(false);
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
        <form onSubmit={handleDestroySport}>
          <div className="mb-4">
            <FloatingLabelInput
              label="Sport"
              type="text"
              name="sport"
              value={sport}
              readOnly
            />
          </div>
          <div className="flex justify-end gap-2">
            {!loadingDestroy && <BackButton label="Back" path="/sports" />}
            <SubmitButton
              label="Delete Sport"
              className="bg-red-600 hover:bg-red-700"
              loading={loadingDestroy}
              loadingLabel="Deleting Sport..."
            />
          </div>
        </form>
      )}
    </>
  );
};

export default DeleteSportForm;