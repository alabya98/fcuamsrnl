// client/src/pages/Reports/Components/PrintableAttendanceReport.tsx

import { forwardRef } from "react";
import type { AttendanceAnalyticsReport } from "../../../interfaces/ReportInterface";
import filamerLogo from "../../../assets/filamerlogo.png";

interface PrintableAttendanceReportProps {
  data: AttendanceAnalyticsReport;
  filters?: {
    sport?: string;
    start_date?: string;
    end_date?: string;
  };
}

const PrintableAttendanceReport = forwardRef<HTMLDivElement, PrintableAttendanceReportProps>(
  ({ data, filters }, ref) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
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
              Attendance Analytics Report
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
            Overall Attendance Statistics
          </h3>
          <div className="grid grid-cols-5 gap-4">
            <div className="p-4 border-2 border-blue-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Total Records</p>
              <p className="text-2xl font-bold text-blue-600">
                {data.overall.total_records}
              </p>
            </div>
            <div className="p-4 border-2 border-green-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Present</p>
              <p className="text-2xl font-bold text-green-600">
                {data.overall.present}
              </p>
            </div>
            <div className="p-4 border-2 border-red-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Absent</p>
              <p className="text-2xl font-bold text-red-600">
                {data.overall.absent}
              </p>
            </div>
            <div className="p-4 border-2 border-yellow-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Excused</p>
              <p className="text-2xl font-bold text-yellow-600">
                {data.overall.excused}
              </p>
            </div>
            <div className="p-4 border-2 border-purple-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {data.overall.attendance_rate}%
              </p>
            </div>
          </div>
        </div>

        {/* By Sport */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Attendance by Sport
          </h3>
          <div className="space-y-3">
            {data.by_sport.map((sport, index) => (
              <div key={index} className="p-3 border-2 border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-base font-bold text-gray-800">
                    {sport.sport}
                  </h4>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-bold">
                    {sport.attendance_rate}% Rate
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Athletes</p>
                    <p className="font-bold text-gray-800">
                      {sport.total_athletes}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total</p>
                    <p className="font-bold text-gray-800">
                      {sport.total_records}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Present</p>
                    <p className="font-bold text-green-600">{sport.present}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Absent</p>
                    <p className="font-bold text-red-600">{sport.absent}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Excused</p>
                    <p className="font-bold text-yellow-600">{sport.excused}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Late</p>
                    <p className="font-bold text-orange-600">{sport.late}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="mb-8 page-break">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Monthly Attendance Trends
          </h3>
          <div className="space-y-2">
            {data.by_month.map((month, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-800">{month.month}</span>
                  <span className="text-sm text-gray-600">
                    {month.total} records • {month.rate}% rate
                  </span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600 font-semibold">
                    P: {month.present}
                  </span>
                  <span className="text-red-600 font-semibold">
                    A: {month.absent}
                  </span>
                  <span className="text-yellow-600 font-semibold">
                    E: {month.excused}
                  </span>
                  <span className="text-orange-600 font-semibold">
                    L: {month.late}
                  </span>
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

PrintableAttendanceReport.displayName = "PrintableAttendanceReport";

export default PrintableAttendanceReport;