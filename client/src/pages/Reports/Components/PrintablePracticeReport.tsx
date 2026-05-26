// client/src/pages/Reports/Components/PrintablePracticeReport.tsx

import { forwardRef } from "react";
import type { PracticeReportData } from "../../../interfaces/PracticeReportInterface";
import filamerLogo from "../../../assets/filamerlogo.png";

interface PrintablePracticeReportProps {
  data: PracticeReportData;
  filters?: {
    sport?: string;
    start_date?: string;
    end_date?: string;
    coach_id?: string;
    venue?: string;
  };
}

const PrintablePracticeReport = forwardRef<HTMLDivElement, PrintablePracticeReportProps>(
  ({ data, filters }, ref) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };

    const formatTime = (timeString: string) => {
      const time = new Date(`1970-01-01T${timeString}`);
      return time.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Practice Schedule Report
            </h2>
            {filters?.sport && (
              <p className="text-sm text-gray-600 mt-1">Sport: {filters.sport}</p>
            )}
            {filters?.start_date && filters?.end_date && (
              <p className="text-sm text-gray-600 mt-1">
                Period: {formatDate(filters.start_date)} -{" "}
                {formatDate(filters.end_date)}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Generated on:</p>
            <p className="font-semibold">
              {formatDate(new Date().toISOString())}
            </p>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Overall Practice Statistics
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 border-2 border-blue-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Total Practices</p>
              <p className="text-2xl font-bold text-blue-600">
                {data.overall.total_practices}
              </p>
            </div>
            <div className="p-3 border-2 border-green-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {data.overall.completed_practices}
              </p>
            </div>
            <div className="p-3 border-2 border-purple-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Avg Attendance</p>
              <p className="text-2xl font-bold text-purple-600">
                {data.overall.average_attendance_rate}%
              </p>
            </div>
          </div>
        </div>

        {/* Practice Sessions List */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Practice Sessions
          </h3>
          <div className="space-y-3">
            {data.practices.map((practice, index) => (
              <div key={index} className="p-3 border-2 border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-base font-bold text-gray-800">
                    {practice.sport} Practice
                  </h4>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-bold">
                    {practice.attendance_rate}% Attendance
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Coach</p>
                    <p className="font-bold text-gray-800">{practice.coach_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-bold text-gray-800">
                      {formatDate(practice.practice_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Time</p>
                    <p className="font-bold text-gray-800">
                      {formatTime(practice.start_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Present</p>
                    <p className="font-bold text-green-600">
                      {practice.athletes_present}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total</p>
                    <p className="font-bold text-gray-800">
                      {practice.total_players}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Sport */}
        <div className="mb-8 page-break">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Practices by Sport
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {data.by_sport.map((sport, index) => (
              <div key={index} className="p-3 border-2 border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{sport.sport}</p>
                <p className="text-2xl font-bold text-blue-600">
                  {sport.total_practices}
                </p>
                <p className="text-xs text-gray-500">
                  {sport.average_attendance}% avg attendance
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* By Coach */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Practices by Coach
          </h3>
          <div className="space-y-2">
            {data.by_coach.map((coach, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-bold text-gray-800">{coach.coach_name}</p>
                  <p className="text-sm text-gray-600">{coach.sport}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-cyan-600">
                    {coach.total_practices}
                  </p>
                  <p className="text-xs text-gray-500">
                    {coach.average_attendance}% attendance
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-gray-300">
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
            .page-break {
              page-break-before: always;
            }
          }
        `}</style>
      </div>
    );
  }
);

PrintablePracticeReport.displayName = "PrintablePracticeReport";

export default PrintablePracticeReport;