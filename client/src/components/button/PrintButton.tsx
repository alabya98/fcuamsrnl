import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React from "react";
import type { AthleteColumns } from "../../interfaces/AthleteInterface";
import filamerLogo from "../../assets/filamerlogo.png";

interface PrintButtonProps {
  athletes: AthleteColumns[];
  documentTitle: string;
}

const PrintButton: React.FC<PrintButtonProps> = ({
  athletes,
  documentTitle,
}) => {
  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF();
      
      // Load and add logo
      const img = new Image();
      img.src = filamerLogo;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Add logo (left side)
      doc.addImage(img, "PNG", 14, 10, 20, 20);
      
      // Add header with title (next to logo)
      doc.setFontSize(18);
      doc.setTextColor(57, 107, 153); // #396B99
      doc.text("Filamer Athlete Management System", 38, 18);
      
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text("Filamer Christian University", 38, 26);
      
      // Add blue line separator
      doc.setDrawColor(57, 107, 153);
      doc.setLineWidth(1);
      doc.line(14, 35, 196, 35);
      
      // Add report title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Athletes Report", 105, 45, { align: "center" });
      
      // Add date and count
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      doc.text(`Generated on: ${today}`, 14, 53);
      doc.text(`Total Athletes: ${athletes.length}`, 14, 59);
      
      // Format athlete data for table
      const tableData = athletes.map((athlete, index) => {
        let fullName = `${athlete.first_name} `;
        if (athlete.middle_name) {
          fullName += `${athlete.middle_name.charAt(0)}. `;
        }
        fullName += athlete.last_name;
        if (athlete.suffix_name) {
          fullName += ` ${athlete.suffix_name}`;
        }
        
        return [
          index + 1,
          athlete.school_id,
          fullName,
          athlete.sport,
          athlete.position,
          athlete.department,
          athlete.academic_status,
        ];
      });
      
      // Create table
      autoTable(doc, {
        head: [["#", "School ID", "Full Name", "Sport", "Position", "Department", "Status"]],
        body: tableData,
        startY: 68,
        theme: "grid",
        headStyles: {
          fillColor: [57, 107, 153], // #396B99
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
          1: { cellWidth: 25, halign: "center" },
          2: { cellWidth: 45 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 30 },
          6: { cellWidth: 25, halign: "center" },
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        didParseCell: function (data) {
          // Style status column
          if (data.column.index === 6 && data.section === "body") {
            const status = data.cell.raw as string;
            if (status === "Eligible") {
              data.cell.styles.textColor = [34, 139, 34]; // Green
              data.cell.styles.fontStyle = "bold";
            } else {
              data.cell.styles.textColor = [220, 53, 69]; // Red
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
        margin: { top: 68, left: 14, right: 14 },
      });
      
      // Add footer with signature lines
      const finalY = (doc as any).lastAutoTable.finalY || 200;
      
      if (finalY < 250) {
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        const signatureY = finalY + 20;
        const lineY = signatureY + 15;
        
        // Prepared by
        doc.text("Prepared by:", 20, signatureY);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(20, lineY, 70, lineY);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Name & Signature", 35, lineY + 5);
        
        // Checked by
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Checked by:", 80, signatureY);
        doc.line(80, lineY, 130, lineY);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Name & Signature", 95, lineY + 5);
        
        // Approved by
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Approved by:", 140, signatureY);
        doc.line(140, lineY, 190, lineY);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Name & Signature", 153, lineY + 5);
      }
      
      doc.save(`${documentTitle}.pdf`);
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

export default PrintButton;