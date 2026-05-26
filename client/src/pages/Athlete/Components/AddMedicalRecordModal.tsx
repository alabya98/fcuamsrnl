import { useState, type FC, type FormEvent } from "react";
import FloatingLabelInput from "../../../components/input/FloatingLabelInput";
import Modal from "../../../components/Modal";
import FloatingLabelSelect from "../../../components/Select/FloatingLabelSelect";
import SubmitButton from "../../../components/button/SubmitButton";
import CloseButton from "../../../components/button/CloseButton";
import MedicalRecordService from "../../../services/MedicalRecordService";
import type { MedicalRecordFieldErrors } from "../../../interfaces/MedicalRecordInterface";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";

interface AddMedicalRecordModalProps {
  athlete: AthleteColumns;
  onRecordAdded: (message: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const AddMedicalRecordModal: FC<AddMedicalRecordModalProps> = ({
  athlete,
  onRecordAdded,
  isOpen,
  onClose,
}) => {
  const [loadingStore, setLoadingStore] = useState(false);
  const [recordDate, setRecordDate] = useState("");
  const [recordType, setRecordType] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [prescribedMedication, setPrescribedMedication] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [hospitalClinic, setHospitalClinic] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [status, setStatus] = useState("Active");
  const [errors, setErrors] = useState<MedicalRecordFieldErrors>({});

  const handleStoreMedicalRecord = async (e: FormEvent) => {
    try {
      e.preventDefault();

      setLoadingStore(true);

      const payload = {
        athlete_id: athlete.athlete_id,
        record_date: recordDate,
        record_type: recordType,
        diagnosis: diagnosis,
        treatment: treatment,
        prescribed_medication: prescribedMedication || null,
        doctor_name: doctorName,
        hospital_clinic: hospitalClinic || null,
        notes: notes || null,
        follow_up_date: followUpDate || null,
        status: status,
      };

      const res = await MedicalRecordService.storeMedicalRecord(payload);

      if (res.status === 200) {
        onRecordAdded(res.data.message);

        // Reset form
        setRecordDate("");
        setRecordType("");
        setDiagnosis("");
        setTreatment("");
        setPrescribedMedication("");
        setDoctorName("");
        setHospitalClinic("");
        setNotes("");
        setFollowUpDate("");
        setStatus("Active");
        setErrors({});

        onClose();
      }
    } catch (error: any) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
      } else {
        console.error("Error adding medical record:", error);
      }
    } finally {
      setLoadingStore(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton>
      <form onSubmit={handleStoreMedicalRecord}>
        <h1 className="text-2xl border-b border-gray-100 p-4 font-semibold mb-4">
          Add Medical Record
        </h1>
        <div className="grid grid-cols-2 gap-4 border-b border-gray-100 mb-4 max-h-[60vh] overflow-y-auto px-4">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <FloatingLabelInput
                label="Record Date"
                type="date"
                name="record_date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                required
                autoFocus
                errors={errors.record_date}
              />
            </div>

            <div className="mb-4">
              <FloatingLabelSelect
                label="Record Type"
                name="record_type"
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                required
                errors={errors.record_type}
              >
                <option value="">Select Record Type</option>
                <option value="Injury">Injury</option>
                <option value="Illness">Illness</option>
                <option value="Checkup">Checkup</option>
                <option value="Surgery">Surgery</option>
                <option value="Physical Therapy">Physical Therapy</option>
                <option value="Vaccination">Vaccination</option>
                <option value="Allergy">Allergy</option>
                <option value="Other">Other</option>
              </FloatingLabelSelect>
            </div>

            <div className="mb-4">
              <FloatingLabelInput
                label="Diagnosis"
                type="text"
                name="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
                errors={errors.diagnosis}
              />
            </div>

            <div className="mb-4">
              <FloatingLabelInput
                label="Treatment"
                type="text"
                name="treatment"
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                required
                errors={errors.treatment}
              />
            </div>

            <div className="mb-4">
              <FloatingLabelInput
                label="Prescribed Medication"
                type="text"
                name="prescribed_medication"
                value={prescribedMedication}
                onChange={(e) => setPrescribedMedication(e.target.value)}
                errors={errors.prescribed_medication}
              />
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <FloatingLabelInput
                label="Doctor Name"
                type="text"
                name="doctor_name"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                required
                errors={errors.doctor_name}
              />
            </div>

            <div className="mb-4">
              <FloatingLabelInput
                label="Hospital/Clinic"
                type="text"
                name="hospital_clinic"
                value={hospitalClinic}
                onChange={(e) => setHospitalClinic(e.target.value)}
                errors={errors.hospital_clinic}
              />
            </div>

            <div className="mb-4">
              <FloatingLabelInput
                label="Follow-up Date"
                type="date"
                name="follow_up_date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                errors={errors.follow_up_date}
              />
            </div>

            <div className="mb-4">
              <FloatingLabelSelect
                label="Status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                errors={errors.status}
              >
                <option value="Active">Active</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Resolved">Resolved</option>
              </FloatingLabelSelect>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.notes ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Additional notes..."
              />
              {errors.notes && (
                <p className="text-red-500 text-sm mt-1">{errors.notes[0]}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-4 pb-4">
          {!loadingStore && <CloseButton label="Close" onClose={onClose} />}
          <SubmitButton
            label="Save Medical Record"
            loading={loadingStore}
            loadingLabel="Saving..."
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddMedicalRecordModal;