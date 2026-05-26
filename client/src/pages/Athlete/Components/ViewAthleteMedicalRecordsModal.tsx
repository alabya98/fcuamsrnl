import { useEffect, useState, useRef, type FC } from "react";
import Modal from "../../../components/Modal";
import MedicalRecordService from "../../../services/MedicalRecordService";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";
import type { MedicalRecordColumns } from "../../../interfaces/MedicalRecordInterface";
// ❌ REMOVED: import AddMedicalRecordModal from "./AddMedicalRecordModal";
import EditMedicalRecordModal from "./EditMedicalRecordModal";
import DeleteMedicalRecordModal from "./DeleteMedicalRecordModal";
import PrintButton from "../../../components/button/PrintButton";
import PrintableMedicalRecords from "./PrintableMedicalRecords";

interface ViewAthleteMedicalRecordsModalProps {
  athlete: AthleteColumns | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordUpdated: (message: string) => void;
}

const ViewAthleteMedicalRecordsModal: FC<ViewAthleteMedicalRecordsModalProps> = ({
  athlete,
  isOpen,
  onClose,
  onRecordUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecordColumns[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal states
  // ❌ REMOVED: const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecordColumns | null>(null);

  // Print states
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleLoadMedicalRecords = async () => {
    if (!athlete || !athlete.athlete_id) return;

    try {
      setLoading(true);
      const res = await MedicalRecordService.loadMedicalRecordsByAthlete(athlete.athlete_id);

      if (res.status === 200) {
        setMedicalRecords(res.data.medical_records);
      }
    } catch (error) {
      console.error("Error loading medical records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (isOpen && athlete) {
      handleLoadMedicalRecords();
    }
  }, [isOpen, athlete, refreshKey]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-red-100 text-red-700";
      case "Resolved":
        return "bg-green-100 text-green-700";
      case "Ongoing":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleAthleteFullNameFormat = () => {
    if (!athlete) return "";

    let fullName = "";

    if (athlete.middle_name) {
      fullName = `${athlete.first_name} ${athlete.middle_name.charAt(0)}. ${athlete.last_name}`;
    } else {
      fullName = `${athlete.first_name} ${athlete.last_name}`;
    }

    if (athlete.suffix_name) {
      fullName += ` ${athlete.suffix_name}`;
    }

    return fullName;
  };

  const handleEditRecord = (record: MedicalRecordColumns) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  const handleDeleteRecord = (record: MedicalRecordColumns) => {
    setSelectedRecord(record);
    setIsDeleteModalOpen(true);
  };

  if (!athlete) {
    return null;
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="large">
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 border-b border-gray-200">
            <div className="px-3 sm:px-4 py-2 sm:py-2.5">
              <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
                Medical Records
              </h1>
              <div className="mt-2 bg-blue-50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Athlete Name</p>
                    <p className="font-semibold text-gray-800">{handleAthleteFullNameFormat()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">School ID</p>
                    <p className="font-semibold text-gray-800">{athlete.school_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Sport</p>
                    <p className="font-semibold text-gray-800">{athlete.sport}</p></div>
              <div>
                <p className="text-gray-600 font-medium">Department</p>
                <p className="font-semibold text-gray-800">{athlete.department}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ❌ REMOVED: Add Medical Record Button */}
      {/* Action Buttons - Only Print Button Now */}
      {medicalRecords.length > 0 && (
        <div className="flex-shrink-0 border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-2.5 flex justify-end">
          <button
            onClick={() => setShowPrintPreview(true)}
            className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print Records
          </button>
        </div>
      )}

      {/* Medical Records List */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading medical records...</p>
          </div>
        ) : medicalRecords.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-2 text-gray-500">No medical records found</p>
            {/* ❌ REMOVED: <p className="text-sm text-gray-400">Click "Add Medical Record" to create one</p> */}
          </div>
        ) : (
          <div className="space-y-3">
            {medicalRecords.map((record) => (
              <div
                key={record.medical_record_id}
                className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-800">
                        {record.record_type}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-bold rounded ${getStatusBadgeClass(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(record.record_date)}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => handleEditRecord(record)}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRecord(record)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Diagnosis</p>
                    <p className="text-xs sm:text-sm text-gray-800 mt-1">{record.diagnosis}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Treatment</p>
                    <p className="text-xs sm:text-sm text-gray-800 mt-1">{record.treatment}</p>
                  </div>
                </div>

                {record.prescribed_medication && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 uppercase font-bold">
                      Prescribed Medication
                    </p>
                    <p className="text-xs sm:text-sm text-gray-800 mt-1">
                      {record.prescribed_medication}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Doctor</p>
                    <p className="text-xs sm:text-sm text-gray-800 mt-1">{record.doctor_name}</p>
                  </div>
                  {record.hospital_clinic && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">
                        Hospital/Clinic
                      </p>
                      <p className="text-xs sm:text-sm text-gray-800 mt-1">
                        {record.hospital_clinic}
                      </p>
                    </div>
                  )}
                </div>

                {record.follow_up_date && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 uppercase font-bold">Follow-up Date</p>
                    <p className="text-xs sm:text-sm text-gray-800 mt-1">
                      {formatDate(record.follow_up_date)}
                    </p>
                  </div>
                )}

                {record.notes && (
                  <div className="bg-gray-50 rounded p-2 sm:p-3 mt-3">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Notes</p>
                    <p className="text-xs sm:text-sm text-gray-700">{record.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </Modal>

  {/* Modals */}
  {athlete && (
    <>
      {/* ❌ REMOVED: AddMedicalRecordModal */}
      <EditMedicalRecordModal
        record={selectedRecord}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRecord(null);
        }}
        onRecordUpdated={(message) => {
          onRecordUpdated(message);
          handleRefresh();
        }}
      />
      <DeleteMedicalRecordModal
        record={selectedRecord}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedRecord(null);
        }}
        onRecordDeleted={(message) => {
          onRecordUpdated(message);
          handleRefresh();
        }}
      />
    </>
  )}

  {/* Print Preview Modal */}
  {showPrintPreview && athlete && (
    <Modal
      isOpen={showPrintPreview}
      onClose={() => setShowPrintPreview(false)}
      showCloseButton
      size="large"
    >
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-2.5 flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
            Print Preview - Medical Records
          </h2>
          <PrintButton
            contentRef={printRef as React.RefObject<HTMLDivElement>}
            documentTitle={`Medical_Records_${athlete.school_id}_${
              new Date().toISOString().split("T")[0]
            }`}
          />
        </div>
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <PrintableMedicalRecords
              ref={printRef}
              athlete={athlete}
              medicalRecords={medicalRecords}
            />
          </div>
        </div>
      </div>
    </Modal>
  )}
</>
);
};
export default ViewAthleteMedicalRecordsModal;