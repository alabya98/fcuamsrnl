// client/src/pages/Reports/Components/PrintableDemographicsReport.tsx

import { forwardRef } from "react";
import type { AthleteDemographicsReport } from "../../../interfaces/ReportInterface";
import filamerLogo from "../../../assets/filamerlogo.png";

interface PrintableDemographicsReportProps {
  data: AthleteDemographicsReport;
  filters?: {
    sport?: string;
  };
}

const PrintableDemographicsReport = forwardRef<HTMLDivElement, PrintableDemographicsReportProps>(
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
              Athlete Demographics Report
            </h2>
            {filters?.sport && (
              <p className="text-sm text-gray-600 mt-1">Sport: {filters.sport}</p>
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
            Overall Statistics
          </h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 border-2 border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Athletes</p>
              <p className="text-3xl font-bold text-blue-600">
                {data.overall.total_athletes}
              </p>
            </div>
            <div className="p-4 border-2 border-green-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Male</p>
              <p className="text-3xl font-bold text-green-600">
                {data.overall.male_count}
              </p>
            </div>
            <div className="p-4 border-2 border-pink-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Female</p>
              <p className="text-3xl font-bold text-pink-600">
                {data.overall.female_count}
              </p>
            </div>
            <div className="p-4 border-2 border-teal-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Eligible</p>
              <p className="text-3xl font-bold text-teal-600">
                {data.overall.eligible_count}
              </p>
            </div>
          </div>
        </div>

        {/* Gender Distribution */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Gender Distribution
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {data.by_gender.map((gender, index) => (
              <div key={index} className="p-4 border-2 border-gray-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-bold text-gray-800">
                      {gender.gender}
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {gender.count}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600">
                      {gender.percentage}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Sport */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Athletes by Sport
          </h3>
          <div className="space-y-3">
            {data.by_sport.map((sport, index) => (
              <div key={index} className="p-3 border-2 border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-base font-bold text-gray-800">
                    {sport.sport}
                  </h4>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-bold">
                    {sport.count} Athletes
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Male</p>
                    <p className="font-bold text-blue-600">{sport.male}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Female</p>
                    <p className="font-bold text-pink-600">{sport.female}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Eligible</p>
                    <p className="font-bold text-green-600">{sport.eligible}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ineligible</p>
                    <p className="font-bold text-red-600">{sport.ineligible}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Department */}
        <div className="mb-8 page-break">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Athletes by Department
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {data.by_department.map((dept, index) => (
              <div key={index} className="p-3 border-2 border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{dept.department}</p>
                <p className="text-2xl font-bold text-yellow-600">{dept.count}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-blue-600 font-semibold">
                    M: {dept.male}
                  </span>
                  <span className="text-pink-600 font-semibold">
                    F: {dept.female}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Status */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Academic Status
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {data.by_academic_status.map((status, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  status.status === "Eligible"
                    ? "border-green-200"
                    : "border-red-200"
                }`}
              >
                <p className="text-lg font-bold text-gray-800">{status.status}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-2xl font-bold text-gray-800">
                    {status.count}
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {status.percentage}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Athletes by Coach */}
        {data.by_coach.length > 0 && (
          <div className="mb-8 page-break">
            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
              Athletes by Coach
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
                      {coach.count}
                    </p>
                    <p className="text-xs text-gray-500">athletes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

PrintableDemographicsReport.displayName = "PrintableDemographicsReport";

export default PrintableDemographicsReport;