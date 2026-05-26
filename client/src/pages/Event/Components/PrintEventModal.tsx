import { type FC } from "react";
import Modal from "../../../components/Modal";
import CloseButton from "../../../components/button/CloseButton";
import type { EventColumns } from "../../../interfaces/EventInterface";
import filamerLogo from "../../../assets/filamerlogo.png";

interface PrintEventModalProps {
  event: EventColumns | null;
  isOpen: boolean;
  onClose: () => void;
}

const PrintEventModal: FC<PrintEventModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
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

  const buildFullName = (person: any): string => {
    if (!person) return "—";
    if (person.full_name && !person.full_name.includes("undefined")) {
      return person.full_name;
    }
    const parts = [
      person.first_name,
      person.middle_name || null,
      person.last_name,
    ].filter(Boolean);
    return parts.join(" ").trim() || "—";
  };

  const handlePrint = () => {
    if (!event) return;

    const coachRows = (event.coaches ?? [])
      .map(
        (coach, i) => `
        <tr style="background-color: ${i % 2 === 0 ? "#f9fafb" : "#ffffff"};">
          <td class="td">${i + 1}</td>
          <td class="td" style="font-weight:500;">${buildFullName(coach)}</td>
          <td class="td">${coach.staff_id ?? "—"}</td>
          <td class="td">${coach.position ?? "—"}</td>
        </tr>`,
      )
      .join("");

    const athleteRows = (event.athletes ?? [])
      .map(
        (athlete, i) => `
        <tr style="background-color: ${i % 2 === 0 ? "#f9fafb" : "#ffffff"};">
          <td class="td">${i + 1}</td>
          <td class="td" style="font-weight:500;">${buildFullName(athlete)}</td>
          <td class="td">${athlete.school_id ?? "—"}</td>
          <td class="td">___________________</td>
        </tr>`,
      )
      .join("");

    const detailRows = [
      ["Event Type", event.event_type],
      ["Sport", event.sport],
      ["Start Date", formatDate(event.event_date)],
      ...(event.end_date && event.end_date !== event.event_date
        ? [["End Date", formatDate(event.end_date)]]
        : []),
      [
        "Time",
        `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`,
      ],
      ["Venue", event.venue],
      ...(event.organizer ? [["Organizer", event.organizer]] : []),
      ...(event.max_participants
        ? [["Max Participants", String(event.max_participants)]]
        : []),
      ...(event.registration_deadline
        ? [["Registration Deadline", formatDate(event.registration_deadline)]]
        : []),
      ["Status", event.status],
    ]
      .map(
        ([label, value], i) => `
        <tr style="background-color: ${i % 2 === 0 ? "#f9fafb" : "#ffffff"};">
          <td class="td" style="font-weight:600; color:#374151; width:35%;">${label}</td>
          <td class="td">${value}</td>
        </tr>`,
      )
      .join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Event Information - ${event.event_name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      padding: 32px;
      background: white;
      color: #111827;
      font-size: 13px;
    }

    /* ── Header ── */
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 16px;
      border-bottom: 4px solid #1d4ed8;
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 4px;
    }
    .header-inner img { width: 64px; height: 64px; object-fit: contain; }
    .header-title { font-size: 26px; font-weight: bold; color: #1d4ed8; line-height: 1.2; }
    .header-subtitle { font-size: 13px; color: #4b5563; }

    /* ── Title row ── */
    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .doc-title   { font-size: 22px; font-weight: bold; color: #1f2937; }
    .doc-event   { font-size: 15px; font-weight: 600; color: #1d4ed8; margin-top: 4px; }
    .meta-right  { text-align: right; font-size: 12px; color: #4b5563; }
    .meta-right strong { font-size: 13px; color: #111827; }

    /* ── Section heading ── */
    .section-title {
      font-size: 15px;
      font-weight: bold;
      color: #1f2937;
      margin: 24px 0 8px;
      padding-bottom: 4px;
      border-bottom: 2px solid #d1d5db;
    }

    /* ── Description / Notes text ── */
    .text-block {
      font-size: 13px;
      color: #111827;
      line-height: 1.6;
      white-space: pre-wrap;
      margin-bottom: 8px;
    }

    /* ── Tables ── */
    table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
    .th {
      background-color: #1d4ed8;
      color: #ffffff;
      border: 1px solid #d1d5db;
      padding: 9px 12px;
      text-align: left;
      font-size: 12px;
      font-weight: bold;
    }
    .td {
      border: 1px solid #d1d5db;
      padding: 9px 12px;
      font-size: 12px;
    }

    /* ── Footer signatures ── */
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 2px solid #d1d5db;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 32px;
      text-align: center;
      font-size: 12px;
    }
    .sig-line {
      border-top: 2px solid #1f2937;
      padding-top: 6px;
      margin-top: 48px;
    }

    /* ── Print meta ── */
    .print-info {
      margin-top: 16px;
      text-align: center;
      font-size: 11px;
      color: #6b7280;
    }

    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; padding: 0; }
      @page { size: A4; margin: 1cm; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="header-inner">
      <img src="${filamerLogo}" alt="Filamer Logo" />
      <div>
        <div class="header-title">Filamer Athlete Management System</div>
        <div class="header-subtitle">Filamer Christian University</div>
      </div>
    </div>
  </div>

  <!-- Title row -->
  <div class="title-row">
    <div>
      <div class="doc-title">Event Information</div>
      <div class="doc-event">${event.event_name}</div>
    </div>
    <div class="meta-right">
      <div>Generated on:</div>
      <strong>${formatDate(new Date().toISOString())}</strong>
      <div style="margin-top:4px;">
        Coaches: ${(event.coaches ?? []).length} &nbsp;|&nbsp;
        Athletes: ${(event.athletes ?? []).length}
      </div>
    </div>
  </div>

  <!-- Event Details table -->
  <div class="section-title">Event Details</div>
  <table>
    <tbody>${detailRows}</tbody>
  </table>

  ${
    event.description
      ? `
  <div class="section-title">Description</div>
  <p class="text-block">${event.description}</p>`
      : ""
  }

  ${
    event.notes
      ? `
  <div class="section-title">Notes / Remarks</div>
  <p class="text-block">${event.notes}</p>`
      : ""
  }

  <!-- Coaches -->
  ${
    (event.coaches ?? []).length > 0
      ? `
  <div class="section-title">Assigned Coaches (${event.coaches!.length})</div>
  <table>
    <thead>
      <tr>
        <th class="th" style="width:6%;">#</th>
        <th class="th">Name</th>
        <th class="th" style="width:22%;">Staff ID</th>
        <th class="th" style="width:22%;">Position</th>
      </tr>
    </thead>
    <tbody>${coachRows}</tbody>
  </table>`
      : ""
  }

  <!-- Athletes -->
  ${
    (event.athletes ?? []).length > 0
      ? `
  <div class="section-title">Participating Athletes (${event.athletes!.length})</div>
  <table>
    <thead>
      <tr>
        <th class="th" style="width:6%;">#</th>
        <th class="th">Name</th>
        <th class="th" style="width:22%;">School ID</th>
        <th class="th" style="width:28%;">Signature</th>
      </tr>
    </thead>
    <tbody>${athleteRows}</tbody>
  </table>`
      : ""
  }

  <!-- Footer signatures -->
  <div class="footer">
    <div>
      <div style="font-weight:600;">Prepared by:</div>
      <div class="sig-line">
        <div style="font-weight:600;">${buildFullName(event.creator)}</div>
        <div style="font-size:11px; color:#6b7280;">${event.creator?.role ?? ""}</div>
      </div>
    </div>
    <div>
      <div style="font-weight:600;">Checked by:</div>
      <div class="sig-line">Name &amp; Signature</div>
    </div>
    <div>
      <div style="font-weight:600;">Approved by:</div>
      <div class="sig-line">Name &amp; Signature</div>
    </div>
  </div>

  <div class="print-info">
    Printed on: ${new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}
  </div>

</body>
</html>`;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  if (!event) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton size="large">
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Modal Header */}
        <div className="border-b border-gray-100 p-4 flex-shrink-0">
          <h1 className="text-2xl font-semibold">Print Event Details</h1>
          <p className="text-sm text-gray-500 font-normal mt-1">
            Preview and print event information
          </p>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm">
            {/* Mimics PrintableAthleteList header */}
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

            {/* Title row */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Event Information
                </h2>
                <p className="text-base font-semibold text-blue-700 mt-1">
                  {event.event_name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Generated on:</p>
                <p className="font-semibold">
                  {formatDate(new Date().toISOString())}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Coaches: {event.coaches?.length ?? 0} &nbsp;|&nbsp; Athletes:{" "}
                  {event.athletes?.length ?? 0}
                </p>
              </div>
            </div>

            {/* Details preview table */}
            <table className="w-full border-collapse border border-gray-300 mb-4">
              <tbody>
                {[
                  ["Event Type", event.event_type],
                  ["Sport", event.sport],
                  ["Start Date", formatDate(event.event_date)],
                  [
                    "Time",
                    `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`,
                  ],
                  ["Venue", event.venue],
                  ["Status", event.status],
                ].map(([label, value], i) => (
                  <tr
                    key={label}
                    className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 w-1/3">
                      {label}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-sm">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Coach / Athlete count badges */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 font-medium">Coaches</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">
                  {event.coaches?.length ?? 0}
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500 font-medium">Athletes</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">
                  {event.athletes?.length ?? 0}
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6">
              Document includes coach list, athlete roster with signatures, and
              approval section.
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-gray-100 px-4 py-4 flex justify-end gap-2 flex-shrink-0 bg-white">
          <CloseButton label="Close" onClose={onClose} />
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2 font-semibold"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            Print
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PrintEventModal;
