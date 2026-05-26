import { forwardRef } from "react";
import type { EquipmentRequestColumns } from "../../../interfaces/EquipmentRequestInterface";
import filamerLogo from "../../../assets/filamerlogo.png";

interface PrintableEquipmentRequestListProps {
  requests: EquipmentRequestColumns[];
  title?: string;
}

const PrintableEquipmentRequestList = forwardRef<
  HTMLDivElement,
  PrintableEquipmentRequestListProps
>(({ requests, title = "Equipment Request List" }, ref) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCoachName = (request: EquipmentRequestColumns) => {
    if (!request.coach) return "N/A";
    const c = request.coach;
    let name = `${c.first_name} `;
    if (c.middle_name) name += `${c.middle_name.charAt(0)}. `;
    name += c.last_name;
    return name;
  };

  const reprintCount = requests.filter(
    (r: EquipmentRequestColumns) => r.is_printed,
  ).length;

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
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {reprintCount > 0 && (
            <p className="text-xs text-amber-600 mt-1 font-medium">
              ⚠ {reprintCount} of {requests.length} item(s) in this batch were
              previously printed
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Generated on:</p>
          <p className="font-semibold">
            {formatDate(new Date().toISOString())}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Total Requests: {requests.length}
          </p>
        </div>
      </div>

      {/* Table — NO Status column */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-blue-700 text-white">
            <th className="border border-gray-300 px-4 py-2 text-left text-sm">
              #
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm">
              Request ID
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm">
              Coach
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm">
              Sport
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm">
              Equipment
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm">
              Quantity
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm">
              Reason
            </th>
            <th className="border border-gray-300 px-4 py-2 text-left text-sm">
              Date Requested
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request: EquipmentRequestColumns, index: number) => (
            <tr
              key={request.request_id}
              className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
            >
              <td className="border border-gray-300 px-4 py-2 text-sm">
                {index + 1}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-sm">
                #{request.request_id}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-sm font-medium">
                {formatCoachName(request)}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-sm">
                {request.sport}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-sm font-medium">
                {request.equipment_name}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                {request.quantity_requested}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-sm">
                {request.reason}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-sm">
                {formatDate(request.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Admin Notes */}
      {requests.some((r: EquipmentRequestColumns) => r.admin_notes) && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Admin Notes:</h3>
          <div className="space-y-2">
            {requests
              .filter((r: EquipmentRequestColumns) => r.admin_notes)
              .map((request: EquipmentRequestColumns) => (
                <div
                  key={request.request_id}
                  className="border border-gray-300 rounded p-3 bg-gray-50"
                >
                  <p className="text-sm font-semibold text-gray-700">
                    Request #{request.request_id} — {request.equipment_name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {request.admin_notes}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Signature Footer */}
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
            body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            @page { size: A4 landscape; margin: 1cm; }
          }
        `}</style>
    </div>
  );
});

PrintableEquipmentRequestList.displayName = "PrintableEquipmentRequestList";

export default PrintableEquipmentRequestList;
