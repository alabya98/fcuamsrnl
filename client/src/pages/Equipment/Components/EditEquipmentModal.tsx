import { useEffect, useState, type FC, type FormEvent } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelSelect";
import SubmitButton from "../../../components/button/SubmitButton";
import CloseButton from "../../../components/button/CloseButton";
import CoachService from "../../../services/CoachService";
import EquipmentService from "../../../services/EquipmentService";
import type {
  EquipmentFieldErrors,
  EquipmentColumns,
} from "../../../interfaces/EquipmentInterface";
import type { CoachColumns } from "../../../interfaces/CoachInterface";

interface EditEquipmentModalProps {
  equipment: EquipmentColumns | null;
  onEquipmentUpdated: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const EditEquipmentModal: FC<EditEquipmentModalProps> = ({
  equipment,
  onEquipmentUpdated,
  refreshKey,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [coaches, setCoaches] = useState<CoachColumns[]>([]);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const [coachId, setCoachId] = useState("");
  const [sport, setSport] = useState("");
  const [equipmentName, setEquipmentName] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState("");
  const [damagedQuantity, setDamagedQuantity] = useState("0");
  const [lostQuantity, setLostQuantity] = useState("0");
  const [condition, setCondition] = useState("New");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<EquipmentFieldErrors>({});
  const [showConditionHint, setShowConditionHint] = useState(false);
  const [conditionHint, setConditionHint] = useState("");

  const handleUpdateEquipment = async (e: FormEvent) => {
    try {
      e.preventDefault();
      if (!equipment) return;

      setLoadingUpdate(true);

      const payload =
        user?.role === "Admin"
          ? {
              coach_id: coachId,
              sport,
              equipment_name: equipmentName,
              total_quantity: totalQuantity,
              available_quantity: availableQuantity,
              damaged_quantity: damagedQuantity,
              lost_quantity: lostQuantity,
              condition,
              notes,
            }
          : {
              damaged_quantity: damagedQuantity,
              lost_quantity: lostQuantity,
              condition,
              notes,
            };

      const res = await EquipmentService.updateEquipment(
        equipment.equipment_id,
        payload,
      );

      if (res.status === 200) {
        onEquipmentUpdated(res.data.message);
        refreshKey();
        onClose();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.log(
          "Unexpected server error during updating equipment:",
          error,
        );
      }
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleLoadCoaches = async () => {
    try {
      setLoadingCoaches(true);
      const res = await CoachService.loadCoaches();
      if (res.status === 200) {
        setCoaches(res.data.coaches);
      }
    } catch (error) {
      console.error("Error loading coaches:", error);
    } finally {
      setLoadingCoaches(false);
    }
  };

  const handleCoachFullNameFormat = (coach: CoachColumns) => {
    let fullName = "";
    if (coach.middle_name) {
      fullName = `${coach.first_name} ${coach.middle_name.charAt(0)}. ${coach.last_name}`;
    } else {
      fullName = `${coach.first_name} ${coach.last_name}`;
    }
    if (coach.suffix_name) {
      fullName += ` ${coach.suffix_name}`;
    }
    return fullName;
  };

  const handleCoachChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCoachId = e.target.value;
    setCoachId(selectedCoachId);

    const selectedCoach = coaches.find(
      (coach) => coach.coach_id.toString() === selectedCoachId,
    );
    if (selectedCoach) {
      setSport(selectedCoach.sports_coached || "");
    } else {
      setSport("");
    }
  };

  useEffect(() => {
    if (equipment && isOpen) {
      setCoachId(equipment.coach_id?.toString() || "");
      setSport(equipment.sport || "");
      setEquipmentName(equipment.equipment_name || "");
      setTotalQuantity(equipment.total_quantity?.toString() || "0");
      setAvailableQuantity(equipment.available_quantity?.toString() || "0");
      setDamagedQuantity(equipment.damaged_quantity?.toString() || "0");
      setLostQuantity(equipment.lost_quantity?.toString() || "0");
      setCondition(equipment.condition || "New");
      setNotes(equipment.notes || "");
      setErrors({});

      if (user?.role === "Admin") {
        handleLoadCoaches();
      }
    }
  }, [equipment, isOpen]);

  // Auto-calculate available quantity and auto-adjust condition for ALL roles
  useEffect(() => {
    const total = parseInt(totalQuantity) || 0;
    const damaged = parseInt(damagedQuantity) || 0;
    const lost = parseInt(lostQuantity) || 0;
    const available = total - damaged - lost;
    setAvailableQuantity(available >= 0 ? available.toString() : "0");

    if (total > 0) {
      const damagedLostTotal = damaged + lost;
      const damagePercentage = (damagedLostTotal / total) * 100;

      let newCondition = "Good";
      let hint = "";

      if (damagePercentage === 0) {
        newCondition = "New";
        hint = "✨ Condition auto-set: New (0% damaged/lost)";
      } else if (damagePercentage <= 25) {
        newCondition = "Good";
        hint = `✅ Condition auto-set: Good (${damagePercentage.toFixed(0)}% damaged/lost)`;
      } else if (damagePercentage <= 50) {
        newCondition = "Fair";
        hint = `⚠️ Condition auto-set: Fair (${damagePercentage.toFixed(0)}% damaged/lost)`;
      } else {
        newCondition = "Poor";
        hint = `❌ Condition auto-set: Poor (${damagePercentage.toFixed(0)}% damaged/lost)`;
      }

      // Auto-update condition for BOTH Admin and Coach
      setCondition(newCondition);
      setConditionHint(hint);
      setShowConditionHint(true);

      setTimeout(() => setShowConditionHint(false), 5000);
    }
  }, [totalQuantity, damagedQuantity, lostQuantity]);

  const isAdmin = user?.role === "Admin";

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="large">
      <form
        onSubmit={handleUpdateEquipment}
        className="flex flex-col h-full overflow-hidden"
      >
        <div className="flex-shrink-0 border-b border-gray-200">
          <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
            {isAdmin ? "Edit Equipment" : "Update Equipment Status"}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
          {!isAdmin && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You can update damaged/lost quantities,
                condition, and add notes. Total quantity changes require admin
                approval.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
            <div className="col-span-1">
              {isAdmin ? (
                <div className="mb-2 sm:mb-3">
                  <FloatingLabelSelect
                    label="Assign to Coach"
                    name="coach_id"
                    value={coachId}
                    onChange={handleCoachChange}
                    required
                    errors={errors.coach_id}
                  >
                    {loadingCoaches ? (
                      <option value="">Loading...</option>
                    ) : (
                      <>
                        <option value="">Select Coach</option>
                        {coaches.map((coach) => (
                          <option value={coach.coach_id} key={coach.coach_id}>
                            {handleCoachFullNameFormat(coach)} -{" "}
                            {coach.sports_coached}
                          </option>
                        ))}
                      </>
                    )}
                  </FloatingLabelSelect>
                </div>
              ) : (
                <div className="mb-2 sm:mb-3">
                  <FloatingLabelInput
                    label="Assigned Coach"
                    type="text"
                    name="coach_name"
                    value={
                      equipment?.coach
                        ? handleCoachFullNameFormat({
                            ...equipment.coach,
                            coach_id: equipment.coach.coach_id,
                            first_name: equipment.coach.first_name,
                            last_name: equipment.coach.last_name,
                            middle_name: equipment.coach.middle_name,
                            suffix_name: equipment.coach.suffix_name,
                            sport: equipment.coach.sports_coached,
                          } as CoachColumns)
                        : "Not Assigned"
                    }
                    readOnly
                    disabled
                  />
                </div>
              )}
              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Sport"
                  type="text"
                  name="sport"
                  value={sport}
                  readOnly
                  disabled
                  errors={errors.sport}
                />
              </div>
              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Equipment Name"
                  type="text"
                  name="equipment_name"
                  value={equipmentName}
                  onChange={(e) => setEquipmentName(e.target.value)}
                  required
                  disabled={!isAdmin}
                  errors={errors.equipment_name}
                />
              </div>
              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Total Quantity"
                  type="number"
                  name="total_quantity"
                  value={totalQuantity}
                  onChange={(e) => setTotalQuantity(e.target.value)}
                  required
                  min="0"
                  disabled={!isAdmin}
                  errors={errors.total_quantity}
                />
              </div>
            </div>

            <div className="col-span-1">
              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Damaged Quantity"
                  type="number"
                  name="damaged_quantity"
                  value={damagedQuantity}
                  onChange={(e) => setDamagedQuantity(e.target.value)}
                  min="0"
                  errors={errors.damaged_quantity}
                />
              </div>
              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Lost Quantity"
                  type="number"
                  name="lost_quantity"
                  value={lostQuantity}
                  onChange={(e) => setLostQuantity(e.target.value)}
                  min="0"
                  errors={errors.lost_quantity}
                />
              </div>
              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Available Quantity (Auto-calculated)"
                  type="number"
                  name="available_quantity"
                  value={availableQuantity}
                  readOnly
                  disabled
                  errors={errors.available_quantity}
                />
              </div>
              <div className="mb-2 sm:mb-3">
                <FloatingLabelSelect
                  label="Condition"
                  name="condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  required
                  errors={errors.condition}
                >
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </FloatingLabelSelect>

                {/* Condition hint shown for both Admin and Coach */}
                {showConditionHint && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-xs text-blue-800 font-medium">
                      {conditionHint}
                      {isAdmin && (
                        <span className="block mt-0.5 text-gray-500 font-normal">
                          You can override this by selecting a different condition above.
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-1 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                  isAdmin
                    ? "Additional notes about this equipment..."
                    : "Explain what happened (e.g., 'Damaged during practice on Jan 23')"
                }
              />
              {errors.notes && (
                <p className="text-red-500 text-xs mt-1">{errors.notes[0]}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col-reverse sm:flex-row justify-end gap-2">
          {!loadingUpdate && <CloseButton label="Close" onClose={onClose} />}
          <SubmitButton
            label={isAdmin ? "Update Equipment" : "Submit Update"}
            loading={loadingUpdate}
            loadingLabel="Updating..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditEquipmentModal;