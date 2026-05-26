import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React from "react";
import type { RecordColumns } from "../../interfaces/RecordInterface";
import filamerLogo from "../../assets/filamerlogo.png";

interface RecordPrintButtonProps {
  records: RecordColumns[];
  documentTitle: string;
}

const RecordPrintButton: React.FC<RecordPrintButtonProps> = ({
  records,
  documentTitle,
}) => {
  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF("landscape");
      
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
      doc.line(14, 35, 283, 35);
      
      // Add report title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Sports Records Report", 148.5, 45, { align: "center" });
      
      // Calculate statistics
      const goldMedals = records.filter((r) => r.achievement.includes("Gold")).length;
      const championships = records.filter((r) => r.achievement.includes("Champion")).length;
      const uniqueSports = Array.from(new Set(records.map((r) => r.sport))).length;
      
      // Add statistics and date
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const today = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      doc.text(`Generated on: ${today}`, 14, 53);
      doc.text(`Total Records: ${records.length}`, 14, 59);
      doc.text(`Gold Medals: ${goldMedals}`, 80, 59);
      doc.text(`Championships: ${championships}`, 130, 59);
      doc.text(`Sports Covered: ${uniqueSports}`, 190, 59);
      
      // Group records by competition
      const groupedRecords = records.reduce((acc, record) => {
        if (!acc[record.competition_level]) {
          acc[record.competition_level] = [];
        }
        acc[record.competition_level].push(record);
        return acc;
      }, {} as Record<string, RecordColumns[]>);
      
      let currentY = 68;
      
      // Create tables for each competition
      Object.entries(groupedRecords).forEach(([competition, competitionRecords], groupIndex) => {
        // Check if we need a new page
        if (currentY > 160 && groupIndex > 0) {
          doc.addPage();
          currentY = 20;
        }
        
        // Add competition header
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(57, 107, 153);
        doc.rect(14, currentY, 269, 8, "F");
        doc.text(`${competition} (${competitionRecords.length} Records)`, 18, currentY + 5.5);
        
        currentY += 10;
        
        // Format data for table
        const tableData = competitionRecords.map((record, index) => {
          const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
          };
          
          return [
            index + 1,
            record.event_name,
            record.athlete_name,
            record.sport,
            record.achievement,
            formatDate(record.event_date),
            record.venue,
          ];
        });
        
        // Create table
        autoTable(doc, {
          head: [["#", "Event", "Athlete", "Sport", "Achievement", "Date", "Venue"]],
          body: tableData,
          startY: currentY,
          theme: "grid",
          headStyles: {
            fillColor: [240, 240, 240],
            textColor: [60, 60, 60],
            fontStyle: "bold",
            fontSize: 8,
            halign: "center",
          },
          styles: {
            fontSize: 7,
            cellPadding: 2,
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
          },
          columnStyles: {
            0: { cellWidth: 8, halign: "center" },
            1: { cellWidth: 50 },
            2: { cellWidth: 40 },
            3: { cellWidth: 30 },
            4: { cellWidth: 40 },
            5: { cellWidth: 30 },
            6: { cellWidth: 55 },
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
          didParseCell: function (data) {
            // Color achievement column based on achievement type
            if (data.column.index === 4 && data.section === "body") {
              const achievement = data.cell.raw as string;
              if (achievement.includes("Gold") || achievement.includes("1st") || achievement.includes("Champion")) {
                data.cell.styles.fillColor = [255, 235, 150];
                data.cell.styles.textColor = [150, 100, 0];
                data.cell.styles.fontStyle = "bold";
              } else if (achievement.includes("Silver") || achievement.includes("2nd")) {
                data.cell.styles.fillColor = [220, 220, 220];
                data.cell.styles.textColor = [80, 80, 80];
                data.cell.styles.fontStyle = "bold";
              } else if (achievement.includes("Bronze") || achievement.includes("3rd")) {
                data.cell.styles.fillColor = [255, 200, 150];
                data.cell.styles.textColor = [150, 80, 0];
                data.cell.styles.fontStyle = "bold";
              }
            }
          },
          margin: { left: 14, right: 14 },
        });
        
        currentY = (doc as any).lastAutoTable.finalY + 8;
      });
      
      // Add footer with signature lines on last page
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      
      if (finalY < 160) {
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
        doc.text("Records Officer", 50, lineY + 5);
        
        // Verified by
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Verified by:", 115, signatureY);
        doc.line(115, lineY, 175, lineY);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Head Coach", 135, lineY + 5);
        
        // Approved by
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Approved by:", 200, signatureY);
        doc.line(200, lineY, 260, lineY);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Athletics Director", 215, lineY + 5);
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

export default RecordPrintButton;