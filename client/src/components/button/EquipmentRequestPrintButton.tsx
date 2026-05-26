import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React from "react";
import type { EquipmentRequestColumns } from "../../interfaces/EquipmentRequestInterface";
import filamerLogo from "../../assets/filamerlogo.png";

interface EquipmentRequestPrintButtonProps {
  requests: EquipmentRequestColumns[];
  documentTitle: string;
  onAfterPrint?: () => void;
}

const EquipmentRequestPrintButton: React.FC<EquipmentRequestPrintButtonProps> = ({ requests, documentTitle, onAfterPrint }) => {
  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF({ orientation: "landscape" });

      const img = new Image();
      img.src = filamerLogo;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // Logo
      doc.addImage(img, "PNG", 14, 10, 20, 20);

      // Header
      doc.setFontSize(18);
      doc.setTextColor(57, 107, 153);
      doc.text("Filamer Athlete Management System", 38, 18);

      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text("Filamer Christian University", 38, 26);

      // Blue separator line
      doc.setDrawColor(57, 107, 153);
      doc.setLineWidth(1);
      doc.line(14, 35, 283, 35);

      // Report title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Approved Equipment Requests for Procurement", 148.5, 45, { align: "center" });

      // Date and count
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      doc.text(`Generated on: ${today}`, 14, 53);
      doc.text(`Total Requests: ${requests.length}`, 14, 59);

      // Table data
      const tableData = requests.map((request: EquipmentRequestColumns, index: number) => {
        let coachName = "N/A";
        if (request.coach) {
          const coach = request.coach;
          coachName = `${coach.first_name} `;
          if (coach.middle_name) {
            coachName += `${coach.middle_name.charAt(0)}. `;
          }
          coachName += coach.last_name;
        }

        const requestDate = new Date(request.created_at).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        );

        return [
          index + 1,
          `#${request.request_id}`,
          coachName,
          request.sport,
          request.equipment_name,
          request.quantity_requested,
          request.reason.length > 40
            ? request.reason.substring(0, 40) + "..."
            : request.reason,
          requestDate,
        ];
      });

      // Table
      autoTable(doc, {
        head: [
          [
            "#",
            "Request ID",
            "Coach",
            "Sport",
            "Equipment",
            "Qty",
            "Reason",
            "Date Requested",
          ],
        ],
        body: tableData,
        startY: 68,
        theme: "grid",
        headStyles: {
          fillColor: [57, 107, 153],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 9,
          halign: "center",
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        columnStyles: {
          0: { cellWidth: 10, halign: "center" },
          1: { cellWidth: 20, halign: "center" },
          2: { cellWidth: 35 },
          3: { cellWidth: 25 },
          4: { cellWidth: 40 },
          5: { cellWidth: 15, halign: "center" },
          6: { cellWidth: 80 },
          7: { cellWidth: 30 },
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { top: 68, left: 14, right: 14 },
      });

      // Signature footer
      const finalY = (doc as any).lastAutoTable.finalY || 200;

      if (finalY < 170) {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        const signatureY = finalY + 20;
        const lineY = signatureY + 15;

        // Prepared by
        doc.text("Prepared by:", 30, signatureY);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(30, lineY, 90, lineY);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Name & Signature", 50, lineY + 5);

        // Checked by
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Checked by:", 118.5, signatureY);
        doc.line(118.5, lineY, 178.5, lineY);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Name & Signature", 138.5, lineY + 5);

        // Approved by
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Approved by:", 207, signatureY);
        doc.line(207, lineY, 267, lineY);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Name & Signature", 227, lineY + 5);
      }

      doc.save(`${documentTitle}.pdf`);

      if (onAfterPrint) {
        onAfterPrint();
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <button
      onClick={handleDownloadPDF}
      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
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
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Download PDF
    </button>
  );
};

export default EquipmentRequestPrintButton;