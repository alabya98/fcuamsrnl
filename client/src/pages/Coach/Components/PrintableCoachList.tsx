import { forwardRef } from "react";
import type { CoachColumns } from "../../../interfaces/CoachInterface";
import filamerLogo from "../../../assets/filamerlogo.png";

interface PrintableCoachListProps {
  coaches: CoachColumns[];
}

const PrintableCoachList = forwardRef<HTMLDivElement, PrintableCoachListProps>(
  ({ coaches }, ref) => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const handleFullNameFormat = (coach: CoachColumns) => {
      let fullName = `${coach.first_name}`;
      if (coach.middle_name) {
        fullName += ` ${coach.middle_name.charAt(0)}.`;
      }
      fullName += ` ${coach.last_name}`;
      if (coach.suffix_name) {
        fullName += ` ${coach.suffix_name}`;
      }
      return fullName;
    };

    return (
      <div ref={ref} className="p-8 bg-white text-gray-900">
        {/* Header */}
        <div className="text-center mb-6 border-b-4 border-blue-700 pb-4">
          <div className="flex justify-center items-center gap-3 mb-2">
            <img
              src={filamerLogo}
              alt="Filamer Logo"
              className="w-16 h-16 object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-blue-700">
                Filamer Athlete Management System
              </h1>
              <p className="text-gray-600">Filamer Christian University</p>
            </div>
          </div>
        </div>

        {/* Report Info */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Coaches Report</h2>
          <div className="text-right">
            <p className="text-sm text-gray-600">Generated on:</p>
            <p className="font-semibold">{currentDate}</p>
            <p className="text-sm text-gray-600 mt-1">
              Total Coaches: {coaches.length}
            </p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="border border-gray-300 px-4 py-2 text-left text-sm">
                #
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm">
                Staff ID
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm">
                Full Name
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm">
                Position
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm">
                Sports
              </th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm">
                Email
              </th>
            </tr>
          </thead>
          <tbody>
            {coaches.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="border border-gray-300 px-4 py-8 text-center text-gray-500"
                >
                  No coaches found
                </td>
              </tr>
            ) : (
              coaches.map((coach, index) => (
                <tr
                  key={coach.coach_id}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {coach.staff_id}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm font-medium">
                    {handleFullNameFormat(coach)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {coach.position}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {coach.sports_coached}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-sm">
                    {coach.contact_email}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="font-semibold mb-1">Prepared by:</p>
              <div className="border-t-2 border-gray-800 mt-8 pt-1">
                <p className="text-sm">Name & Signature</p>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1">Checked by:</p>
              <div className="border-t-2 border-gray-800 mt-8 pt-1">
                <p className="text-sm">Name & Signature</p>
              </div>
            </div>
            <div>
              <p className="font-semibold mb-1">Approved by:</p>
              <div className="border-t-2 border-gray-800 mt-8 pt-1">
                <p className="text-sm">Name & Signature</p>
              </div>
            </div>
          </div>
        </div>

        {/* Print Styles */}
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
          }
        `}</style>
      </div>
    );
  }
);

PrintableCoachList.displayName = "PrintableCoachList";
export default PrintableCoachList;