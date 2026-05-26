import { useEffect, useState, type FC, type FormEvent } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import SubmitButton from "../../../components/button/SubmitButton";
import CloseButton from "../../../components/button/CloseButton";
import EquipmentRequestService from "../../../services/EquipmentRequestService";
import CoachService from "../../../services/CoachService";
import type { EquipmentRequestFieldErrors } from "../../../interfaces/EquipmentRequestInterface";

interface EquipmentRequestModalProps {
  onRequestSubmitted: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const EquipmentRequestModal: FC<EquipmentRequestModalProps> = ({
  onRequestSubmitted,
  refreshKey,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [coachId, setCoachId] = useState<number | null>(null);

  const [sport, setSport] = useState("");
  const [equipmentName, setEquipmentName] = useState("");
  const [quantityRequested, setQuantityRequested] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<EquipmentRequestFieldErrors>({});

  const handleSubmitRequest = async (e: FormEvent) => {
    try {
      e.preventDefault();
      
      // ✅ VALIDATE BEFORE SUBMITTING
      if (!coachId) {
        alert("Error: Coach information not loaded. Please try again.");
        return;
      }

      setLoadingSubmit(true);

      const payload = {
        coach_id: coachId,
        sport,
        equipment_name: equipmentName,
        quantity_requested: quantityRequested,
        reason,
      };

      console.log("📦 Submitting payload:", payload);

      const res = await EquipmentRequestService.storeRequest(payload);

      if (res.status === 200) {
        onRequestSubmitted(res.data.message);
        resetForm();
        refreshKey();
        onClose();
      }
    } catch (error: any) {
      console.log("❌ Full error:", error.response);
      if (error.response && error.response.status === 422) {
        console.log("❌ Validation errors:", error.response.data.errors);
        setErrors(error.response.data.errors);
      } else {
        console.log("Unexpected server error during submitting request:", error);
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  const resetForm = () => {
    setEquipmentName("");
    setQuantityRequested("");
    setReason("");
    setErrors({});
  };

  const loadCoachId = async () => {
    try {
      const res = await CoachService.loadCoaches();
      if (res.status === 200) {
        const currentCoach = res.data.coaches.find(
          (coach: any) => coach.user_id === user?.user_id
        );
        if (currentCoach) {
          console.log("✅ Coach loaded:", currentCoach); // ✅ DEBUG
          setCoachId(currentCoach.coach_id);
          setSport(currentCoach.sports_coached || "");
        } else {
          console.log("❌ No coach found for user:", user?.user_id);
        }
      }
    } catch (error) {
      console.error("Error loading coach ID:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (user?.role === "Coach") {
        loadCoachId();
      }
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="medium">
      <form
        onSubmit={handleSubmitRequest}
        className="flex flex-col h-full overflow-hidden"
      >
        <div className="flex-shrink-0 border-b border-gray-200">
          <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
            Request Equipment
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Submit your equipment request to the admin. 
              You will be notified once your request is reviewed.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <FloatingLabelInput
                label="Sport"
                type="text"
                name="sport"
                value={sport}
                readOnly
                disabled
              />
            </div>
            <div>
              <FloatingLabelInput
                label="Equipment Name"
                type="text"
                name="equipment_name"
                value={equipmentName}
                onChange={(e) => setEquipmentName(e.target.value)}
                required
                autoFocus
                placeholder="e.g., Basketball, Volleyball Net"
                errors={errors.equipment_name}
              />
            </div>
            <div>
              <FloatingLabelInput
                label="Quantity Requested"
                type="number"
                name="quantity_requested"
                value={quantityRequested}
                onChange={(e) => setQuantityRequested(e.target.value)}
                required
                min="1"
                errors={errors.quantity_requested}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Request <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please explain why you need this equipment..."
              />
              {errors.reason && (
                <p className="text-red-500 text-xs mt-1">{errors.reason[0]}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col-reverse sm:flex-row justify-end gap-2">
          {!loadingSubmit && <CloseButton label="Cancel" onClose={onClose} />}
          <SubmitButton
            label="Submit Request"
            loading={loadingSubmit}
            loadingLabel="Submitting..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default EquipmentRequestModal;