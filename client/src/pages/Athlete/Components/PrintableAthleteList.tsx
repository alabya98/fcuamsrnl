import { forwardRef } from "react";
import type { AthleteColumns } from "../../../interfaces/AthleteInterface";
import filamerLogo from "../../../assets/filamerlogo.png";

interface PrintableAthleteListProps {
  athletes: AthleteColumns[];
  title?: string;
}

const PrintableAthleteList = forwardRef <
  HTMLDivElement,
  PrintableAthleteListProps
>(({ athletes, title = "Athlete List" }, ref) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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

  // ✅ Derive sport label from title for the subtitle line
  const isSportFiltered = title !== "Athlete List";

  return (
    <div ref={ref} className="p-8 bg-white">
      {/* Header */}
      <div className="text-center mb-8 border-b-4 border-blue-700 pb-4">
        <div className="flex items-center justify-center gap-3 mb-2">
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

      {/* Title and Date */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Athlete List</h2>
          {/* ✅ Show sport subtitle only when filtered */}
          {isSportFiltered && (
            <p className="text-base font-semibold text-blue-700 mt-1">
              Sport: {title.replace(" — Athlete List", "")}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Generated on:</p>
          <p className="font-semibold">
            {formatDate(new Date().toISOString())}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Total Athletes: {athletes.length}
          </p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-blue-700 text-white">
            <th className="border border-gray-300 px-4 py-2 text-left text-sm">#</th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm">School ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm">Full Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm">Sport</th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm">Position</th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm">Department</th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm">Status</th>
          </tr>
        </thead>
        <tbody>
          {athletes.map((athlete, index) => (
            <tr
              key={athlete.athlete_id}
              className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
            >
              <td className="border border-gray-300 px-4 py-2 text-sm">{index + 1}</td>
              <td className="border border-gray-300 px-4 py-2 text-sm">{athlete.school_id}</td>
              <td className="border border-gray-300 px-4 py-2 text-sm font-medium">
                {formatName(athlete)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-sm">{athlete.sport}</td>
              <td className="border border-gray-300 px-4 py-2 text-sm">{athlete.position}</td>
              <td className="border border-gray-300 px-4 py-2 text-sm">{athlete.department}</td>
              <td className="border border-gray-300 px-4 py-2 text-sm">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    athlete.academic_status === "Eligible"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {athlete.academic_status}
                </span>
              </td>
            </tr>
          ))}
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
});

PrintableAthleteList.displayName = "PrintableAthleteList";

export default PrintableAthleteList;