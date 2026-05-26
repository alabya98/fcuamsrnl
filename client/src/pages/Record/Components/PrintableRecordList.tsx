import { forwardRef } from "react";
import type { RecordColumns } from "../../../interfaces/RecordInterface";
import filamerLogo from "../../../assets/filamerlogo.png";
import { useAuth } from "../../../contexts/AuthContext";

interface PrintableRecordListProps {
  records: RecordColumns[];
  title?: string;
}

const PrintableRecordList = forwardRef<HTMLDivElement, PrintableRecordListProps>(
  ({ records, title = "Sports Records Report" }, ref) => {
    const { user } = useAuth();

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const uniqueSports = Array.from(new Set(records.map((r) => r.sport)));
    const goldMedals = records.filter((r) =>
      r.achievement.includes("Gold")
    ).length;
    const championships = records.filter((r) =>
      r.achievement.includes("Champion")
    ).length;

    // Group records by competition level
    const groupedRecords = records.reduce(
      (acc, record) => {
        if (!acc[record.competition_level]) {
          acc[record.competition_level] = [];
        }
        acc[record.competition_level].push(record);
        return acc;
      },
      {} as Record<string, RecordColumns[]>
    );

    return (
      <div ref={ref} className="p-8 bg-white">
        {/* Professional Header */}
        <div className="mb-8 pb-6 border-b-4 border-[#396B99]">
          <div className="flex items-center justify-center gap-4 mb-3">
            <img
              src={filamerLogo}
              alt="Filamer Logo"
              className="w-24 h-24 object-contain"
            />
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-[#396B99] tracking-tight">
                Filamer Athlete Management System
              </h1>
              <p className="text-gray-700 text-lg font-medium mt-1">
                Filamer Christian University
              </p>
              <p className="text-gray-500 text-sm mt-1 italic">
                Excellence in Sports and Athletics
              </p>
            </div>
          </div>
        </div>

        {/* Title Bar with Date */}
        <div className="mb-6 bg-gradient-to-r from-[#396B99] to-[#2d5577] text-white p-4 rounded-lg shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="text-sm text-blue-100 mt-1">
                Comprehensive Athletic Achievement Records
              </p>
            </div>
            <div className="text-right bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg">
              <p className="text-xs text-blue-100 font-medium">Generated on:</p>
              <p className="text-lg font-bold">
                {formatDate(new Date().toISOString())}
              </p>
              <p className="text-xs text-blue-100 mt-1">
                Total Records:{" "}
                <span className="font-bold text-white">{records.length}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Summary */}
        {/* Enhanced Statistics Summary - NO ICONS */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-5 shadow-md">
            <p className="text-xs text-yellow-700 font-bold uppercase tracking-wide mb-2">
              Total Records
            </p>
            <p className="text-4xl font-extrabold text-yellow-900">
              {records.length}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-5 shadow-md">
            <p className="text-xs text-green-700 font-bold uppercase tracking-wide mb-2">
              Gold Medals
            </p>
            <p className="text-4xl font-extrabold text-green-900">
              {goldMedals}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-5 shadow-md">
            <p className="text-xs text-blue-700 font-bold uppercase tracking-wide mb-2">
              Championships
            </p>
            <p className="text-4xl font-extrabold text-blue-900">
              {championships}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-5 shadow-md">
            <p className="text-xs text-purple-700 font-bold uppercase tracking-wide mb-2">
              {user?.role === "Coach" ? "Sport" : "Sports Covered"}
            </p>
            {user?.role === "Coach" ? (
              <p className="text-2xl font-extrabold text-purple-900 leading-tight break-words">
                {uniqueSports.length > 0 ? uniqueSports[0] : "N/A"}
              </p>
            ) : (
              <p className="text-4xl font-extrabold text-purple-900">
                {uniqueSports.length}
              </p>
            )}
          </div>
        </div>

        {/* Grouped Records with Enhanced Styling */}
        {Object.entries(groupedRecords).map(
          ([competition, competitionRecords]) => (
            <div key={competition} className="mb-8 page-break-inside-avoid">
              <div className="bg-gradient-to-r from-[#396B99] to-[#2d5577] text-white px-5 py-3 rounded-t-lg shadow-md">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {competition}
                  <span className="ml-auto text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
                    {competitionRecords.length}{" "}
                    {competitionRecords.length === 1 ? "Record" : "Records"}
                  </span>
                </h3>
              </div>
              <table className="w-full border-collapse shadow-lg">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      #
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Athlete
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Sport
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Achievement
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Venue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {competitionRecords.map((record, index) => (
                    <tr
                      key={record.record_id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50 transition-colors`}
                    >
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 font-medium">
                        {index + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-800">
                        {record.event_name}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                        {record.athlete_name}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700 font-medium">
                        {record.sport}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm">
                        <span
                          className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                            record.achievement.includes("Gold") ||
                            record.achievement.includes("1st") ||
                            record.achievement.includes("Champion")
                              ? "bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-900 border border-yellow-400"
                              : record.achievement.includes("Silver") ||
                                record.achievement.includes("2nd")
                              ? "bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 border border-gray-400"
                              : record.achievement.includes("Bronze") ||
                                record.achievement.includes("3rd")
                              ? "bg-gradient-to-r from-orange-200 to-orange-300 text-orange-900 border border-orange-400"
                              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300"
                          }`}
                        >
                          {record.achievement}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                        {formatDate(record.event_date)}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-sm text-gray-600">
                        {record.venue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Professional Footer with Signatures */}
        <div className="mt-16 pt-8 border-t-4 border-[#396B99] page-break-inside-avoid">
          <div className="grid grid-cols-3 gap-12 text-center">
            <div>
              <p className="text-sm font-bold text-gray-700 mb-12 uppercase tracking-wide">
                Prepared by:
              </p>
              <div className="border-t-2 border-gray-800 pt-2 mx-8">
                <p className="text-sm font-bold text-gray-800">
                  Records Officer
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Sports Records Management
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 mb-12 uppercase tracking-wide">
                Verified by:
              </p>
              <div className="border-t-2 border-gray-800 pt-2 mx-8">
                <p className="text-sm font-bold text-gray-800">Head Coach</p>
                <p className="text-xs text-gray-500 mt-1">
                  Athletic Department
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 mb-12 uppercase tracking-wide">
                Approved by:
              </p>
              <div className="border-t-2 border-gray-800 pt-2 mx-8">
                <p className="text-sm font-bold text-gray-800">
                  Athletics Director
                </p>
                <p className="text-xs text-gray-500 mt-1">FCU Sports Division</p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="mt-8 text-center text-xs text-gray-500 italic border-t border-gray-200 pt-4">
          <p>
            This is an official document of Filamer Christian University
            Athletics Department
          </p>
          <p className="mt-1">
            Generated by Filamer Athlete Management System (FAMS)
          </p>
        </div>

        <style>{`
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            @page {
              size: A4 landscape;
              margin: 1cm;
            }
            .page-break-inside-avoid {
              page-break-inside: avoid;
            }
          }
        `}</style>
      </div>
    );
  }
);

PrintableRecordList.displayName = "PrintableRecordList";

export default PrintableRecordList;