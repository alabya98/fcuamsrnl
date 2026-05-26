import { forwardRef } from "react"; // Removed unused 'React' import
import type { MedicalRecordColumns } from "../../../interfaces/MedicalRecordInterface";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";
import filamerLogo from '../../../assets/filamerlogo.png';

interface PrintableMedicalRecordsProps {
  athlete: AthleteColumns;
  medicalRecords: MedicalRecordColumns[];
}

const PrintableMedicalRecords = forwardRef<
  HTMLDivElement,
  PrintableMedicalRecordsProps
>(({ athlete, medicalRecords }, ref) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatName = (athlete: AthleteColumns) => {
    let name = `${athlete.first_name} `;
    if (athlete.middle_name) {
      name += `${athlete.middle_name.charAt(0)}. `;
    }
    name += athlete.last_name;
    if (athlete.suffix_name) {
      name += ` ${athlete.suffix_name}`;
    }
    return name;
  };

  return (
    <div ref={ref} className="p-8 bg-white">
      {/* Header */}
      <div className="text-center mb-8 border-b-4 border-blue-700 pb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
          <img
            src={filamerLogo}
            alt="Filamer Logo"
            className="w-20 h-20 object-contain"
          />
          <div>
            <h1 className="text-3xl font-bold text-blue-700">
              Filamer Athlete Management System
            </h1>
            <p className="text-gray-600">Filamer Christian University</p>
          </div>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Medical Records Report
      </h2>

      {/* Athlete Information */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6 border-2 border-blue-200">
        <h3 className="font-bold text-lg mb-4 text-blue-700">
          Athlete Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Full Name:</p>
            <p className="font-semibold">{formatName(athlete)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">School ID:</p>
            <p className="font-semibold">{athlete.school_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Sport:</p>
            <p className="font-semibold">{athlete.sport}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Department:</p>
            <p className="font-semibold">{athlete.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Generated on:</p>
            <p className="font-semibold">
              {formatDate(new Date().toISOString())}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Records:</p>
            <p className="font-semibold">{medicalRecords.length}</p>
          </div>
        </div>
      </div>

      {/* Medical Records */}
      {medicalRecords.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No medical records found
        </p>
      ) : (
        <div className="space-y-6">
          {medicalRecords.map((record, index) => (
            <div
              key={record.medical_record_id}
              className="border-2 border-gray-300 rounded-lg p-6 page-break-inside-avoid"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {index + 1}. {record.record_type}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(record.record_date)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    record.status === "Active"
                      ? "bg-red-100 text-red-800"
                      : record.status === "Resolved"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {record.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">
                    Diagnosis
                  </p>
                  <p className="text-sm text-gray-800 mt-1">
                    {record.diagnosis}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">
                    Treatment
                  </p>
                  <p className="text-sm text-gray-800 mt-1">
                    {record.treatment}
                  </p>
                </div>
              </div>

              {record.prescribed_medication && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase font-medium">
                    Prescribed Medication
                  </p>
                  <p className="text-sm text-gray-800 mt-1">
                    {record.prescribed_medication}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium">
                    Doctor
                  </p>
                  <p className="text-sm text-gray-800 mt-1">
                    {record.doctor_name}
                  </p>
                </div>
                {record.hospital_clinic && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">
                      Hospital/Clinic
                    </p>
                    <p className="text-sm text-gray-800 mt-1">
                      {record.hospital_clinic}
                    </p>
                  </div>
                )}
              </div>

              {record.follow_up_date && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase font-medium">
                    Follow-up Date
                  </p>
                  <p className="text-sm text-gray-800 mt-1">
                    {formatDate(record.follow_up_date)}
                  </p>
                </div>
              )}

              {record.notes && (
                <div className="bg-gray-50 rounded p-3 mt-3">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                    Notes
                  </p>
                  <p className="text-sm text-gray-700">{record.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-4 border-t-2 border-gray-300 page-break-inside-avoid">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="font-semibold mb-1">Prepared by:</p>
            <div className="border-t-2 border-gray-800 mt-12 pt-1">
              <p className="text-sm">Medical Staff</p>
            </div>
          </div>
          <div>
            <p className="font-semibold mb-1">Reviewed by:</p>
            <div className="border-t-2 border-gray-800 mt-12 pt-1">
              <p className="text-sm">Head Coach</p>
            </div>
          </div>
          <div>
            <p className="font-semibold mb-1">Approved by:</p>
            <div className="border-t-2 border-gray-800 mt-12 pt-1">
              <p className="text-sm">Athletics Director</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            @page {
              size: A4;
              margin: 1cm;
            }
            .page-break-inside-avoid {
              page-break-inside: avoid;
            }
          }
        `}</style>
    </div>
  );
});

PrintableMedicalRecords.displayName = "PrintableMedicalRecords";

export default PrintableMedicalRecords;
