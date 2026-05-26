import { useEffect, useState, type FC, type FormEvent } from "react";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelSelect";
import SubmitButton from "../../../components/button/SubmitButton";
import CloseButton from "../../../components/button/CloseButton";
import CoachService from "../../../services/CoachService";
import EquipmentService from "../../../services/EquipmentService";
import type { EquipmentFieldErrors } from "../../../interfaces/EquipmentInterface";
import type { CoachColumns } from "../../../interfaces/CoachInterface";

interface AddEquipmentModalProps {
  onEquipmentAdded: (message: string) => void;
  refreshKey: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const AddEquipmentModal: FC<AddEquipmentModalProps> = ({
  onEquipmentAdded,
  refreshKey,
  isOpen,
  onClose,
}) => {
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [coaches, setCoaches] = useState<CoachColumns[]>([]);
  const [loadingStore, setLoadingStore] = useState(false);

  const [coachId, setCoachId] = useState("");
  const [sport, setSport] = useState("");
  const [equipmentName, setEquipmentName] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState("");
  const [damagedQuantity, setDamagedQuantity] = useState("0");
  const [lostQuantity, setLostQuantity] = useState("0");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<EquipmentFieldErrors>({});

  const handleStoreEquipment = async (e: FormEvent) => {
    try {
      e.preventDefault();
      setLoadingStore(true);

      const payload = {
        coach_id: coachId,
        sport,
        equipment_name: equipmentName,
        total_quantity: totalQuantity,
        available_quantity: availableQuantity,
        damaged_quantity: damagedQuantity,
        lost_quantity: lostQuantity,
        condition: "New", // ✅ AUTOMATICALLY SET TO "NEW"
        notes: notes || null,
      };

      const res = await EquipmentService.storeEquipment(payload);

      if (res.status === 200) {
        onEquipmentAdded(res.data.message);
        resetForm();
        refreshKey();
        onClose();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.log("Unexpected server error during adding equipment:", error);
      }
    } finally {
      setLoadingStore(false);
    }
  };

  const resetForm = () => {
    setCoachId("");
    setSport("");
    setEquipmentName("");
    setTotalQuantity("");
    setAvailableQuantity("");
    setDamagedQuantity("0");
    setLostQuantity("0");
    setNotes("");
    setErrors({});
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

    // Auto-fill sport based on selected coach
    const selectedCoach = coaches.find(
      (coach) => coach.coach_id.toString() === selectedCoachId
    );
    if (selectedCoach) {
      setSport(selectedCoach.sports_coached || "");
    } else {
      setSport("");
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleLoadCoaches();
    }
  }, [isOpen]);

  // Auto-calculate available quantity
  useEffect(() => {
    const total = parseInt(totalQuantity) || 0;
    const damaged = parseInt(damagedQuantity) || 0;
    const lost = parseInt(lostQuantity) || 0;
    const available = total - damaged - lost;
    setAvailableQuantity(available >= 0 ? available.toString() : "0");
  }, [totalQuantity, damagedQuantity, lostQuantity]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="large">
      <form
        onSubmit={handleStoreEquipment}
        className="flex flex-col h-full overflow-hidden"
      >
        <div className="flex-shrink-0 border-b border-gray-200">
          <h1 className="text-base sm:text-lg md:text-xl px-3 sm:px-4 py-2 sm:py-2.5 font-semibold">
            Add Equipment
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
            <div className="col-span-1">
              <div className="mb-2 sm:mb-3 coach-select-wrapper">
                <FloatingLabelSelect
                  label="Assign to Coach"
                  name="coach_id"
                  value={coachId}
                  onChange={handleCoachChange}
                  required
                  autoFocus
                  errors={errors.coach_id}
                >
                  {loadingCoaches ? (
                    <option value="">Loading...</option>
                  ) : (
                    <>
                      <option value="">Select Coach</option>
                      {coaches.map((coach) => (
                        <option
                          value={coach.coach_id}
                          key={coach.coach_id}
                          style={{
                            padding: "10px",
                            lineHeight: "1.6",
                          }}
                        >
                          {handleCoachFullNameFormat(coach)} -{" "}
                          {coach.sports_coached}
                        </option>
                      ))}
                    </>
                  )}
                </FloatingLabelSelect>
                {coachId && !loadingCoaches && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-600">
                      Coach selected:{" "}
                      <span className="font-semibold text-gray-900">
                        {
                          coaches.find(
                            (c) => c.coach_id.toString() === coachId
                          )?.sports_coached
                        }
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-2 sm:mb-3">
                <FloatingLabelInput
                  label="Sport (Auto-filled)"
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
                  placeholder="e.g., Basketballs, Training Cones"
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

              {/* ✅ REMOVED: Condition field - now automatically set to "New" */}
              <div className="mb-2 sm:mb-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-green-800">
                        Condition: New
                      </p>
                      <p className="text-xs text-green-600">
                        Automatically set for new equipment
                      </p>
                    </div>
                  </div>
                </div>
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
                placeholder="Additional notes about this equipment..."
              />
              {errors.notes && (
                <p className="text-red-500 text-xs mt-1">{errors.notes[0]}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 border-t border-gray-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col-reverse sm:flex-row justify-end gap-2">
          {!loadingStore && <CloseButton label="Close" onClose={onClose} />}
          <SubmitButton
            label="Save Equipment"
            loading={loadingStore}
            loadingLabel="Saving..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddEquipmentModal;