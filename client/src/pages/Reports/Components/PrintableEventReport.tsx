// client/src/pages/Reports/Components/PrintableEventReport.tsx

import { forwardRef } from "react";
import type { EventParticipationReport } from "../../../interfaces/ReportInterface";
import filamerLogo from "../../../assets/filamerlogo.png";

interface PrintableEventReportProps {
  data: EventParticipationReport;
  filters?: {
    sport?: string;
    start_date?: string;
    end_date?: string;
  };
}

const PrintableEventReport = forwardRef<HTMLDivElement, PrintableEventReportProps>(
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
              Event Participation Report
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

        {/* Event Overview */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Event Overview
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 border-2 border-purple-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Total Events</p>
              <p className="text-2xl font-bold text-purple-600">
                {data.overall.total_events}
              </p>
            </div>
            <div className="p-3 border-2 border-blue-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Upcoming</p>
              <p className="text-2xl font-bold text-blue-600">
                {data.overall.upcoming}
              </p>
            </div>
            <div className="p-3 border-2 border-green-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Ongoing</p>
              <p className="text-2xl font-bold text-green-600">
                {data.overall.ongoing}
              </p>
            </div>
            <div className="p-3 border-2 border-teal-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-teal-600">
                {data.overall.completed}
              </p>
            </div>
          </div>
        </div>

        {/* Events by Sport */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Events by Sport
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {data.by_sport.map((sport, index) => (
              <div key={index} className="p-3 border-2 border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{sport.sport}</p>
                <p className="text-2xl font-bold text-purple-600">{sport.count}</p>
                <p className="text-xs text-gray-500">events</p>
              </div>
            ))}
          </div>
        </div>

        {/* Events by Type */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Events by Type
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {data.by_type.map((type, index) => (
              <div key={index} className="p-3 border-2 border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{type.type}</p>
                <p className="text-2xl font-bold text-blue-600">{type.count}</p>
                <p className="text-xs text-gray-500">events</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Athletes */}
        <div className="mb-8 page-break">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Top Athletes (Most Records)
          </h3>
          <div className="space-y-2">
            {data.top_athletes.map((athlete, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">
                      {athlete.athlete_name}
                    </p>
                    <p className="text-sm text-gray-600">{athlete.sport}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-600">
                    {athlete.total_records}
                  </p>
                  <p className="text-xs text-gray-500">records</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Distribution */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Achievement Distribution
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {data.achievement_distribution.map((achievement, index) => (
              <div key={index} className="p-3 border-2 border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">
                  {achievement.achievement}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {achievement.count}
                </p>
                <p className="text-xs text-gray-500">times</p>
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

PrintableEventReport.displayName = "PrintableEventReport";

export default PrintableEventReport;