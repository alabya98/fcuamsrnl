import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { forwardRef, useImperativeHandle } from "react";
import filamerLogo from "../../assets/filamerlogo.png";
import type {
  AthleteDemographicsReport,
  AttendanceAnalyticsReport,
  EventParticipationReport,
} from "../../interfaces/ReportInterface";
import type { GameReportData } from "../../interfaces/GameReportInterface";
import type { PracticeReportData } from "../../interfaces/PracticeReportInterface";

type ReportTab =
  | "demographics"
  | "attendance"
  | "events"
  | "games"
  | "practices";

export interface ReportsPDFButtonProps {
  activeTab: ReportTab;
  demographicsReport?: AthleteDemographicsReport | null;
  attendanceReport?: AttendanceAnalyticsReport | null;
  eventReport?: EventParticipationReport | null;
  gameReport?: GameReportData | null;
  practiceReport?: PracticeReportData | null;
  filters?: {
    sport?: string;
    start_date?: string;
    end_date?: string;
  };
  disabled?: boolean;
  onRequestPreview?: () => void;
}

const ReportsPDFButton = forwardRef<
  { triggerDownload: () => Promise<void> },
  ReportsPDFButtonProps
>(
  (
    {
      activeTab,
      demographicsReport,
      attendanceReport,
      eventReport,
      gameReport,
      practiceReport,
      filters,
      disabled,
      onRequestPreview,
    },
    ref,
  ) => {
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const addHeader = async (doc: jsPDF, title: string) => {
      const img = new Image();
      img.src = filamerLogo;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      doc.addImage(img, "PNG", 14, 10, 20, 20);
      doc.setFontSize(18);
      doc.setTextColor(57, 107, 153);
      doc.text("Filamer Athlete Management System", 38, 18);
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text("Filamer Christian University", 38, 26);
      doc.setDrawColor(57, 107, 153);
      doc.setLineWidth(1);
      doc.line(14, 35, 196, 35);
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(title, 105, 45, { align: "center" });
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${today}`, 14, 53);
      if (filters?.sport) doc.text(`Sport: ${filters.sport}`, 14, 59);
      if (filters?.start_date || filters?.end_date) {
        const dateRange = `Date Range: ${filters.start_date || "N/A"} to ${filters.end_date || "N/A"}`;
        doc.text(dateRange, 14, filters?.sport ? 65 : 59);
      }
    };

    const addFooter = (doc: jsPDF, finalY: number) => {
      if (finalY < 250) {
        const signatureY = finalY + 20;
        const lineY = signatureY + 15;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Prepared by:", 20, signatureY);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(20, lineY, 70, lineY);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Name & Signature", 35, lineY + 5);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Checked by:", 80, signatureY);
        doc.line(80, lineY, 130, lineY);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Name & Signature", 95, lineY + 5);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Approved by:", 140, signatureY);
        doc.line(140, lineY, 190, lineY);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Name & Signature", 153, lineY + 5);
      }
    };

    const getStartY = () => {
      let y = 68;
      if (filters?.sport) y += 6;
      if (filters?.start_date || filters?.end_date) y += 6;
      return y;
    };

    const headStyles = {
      fillColor: [57, 107, 153] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: "bold" as const,
      fontSize: 9,
      halign: "center" as const,
    };

    const tableStyles = {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [200, 200, 200] as [number, number, number],
      lineWidth: 0.1,
    };

    const altRow = {
      fillColor: [245, 245, 245] as [number, number, number],
    };

    // ─── Demographics ─────────────────────────────────────────────────────────
    const generateDemographicsPDF = async () => {
      if (!demographicsReport) return;
      const doc = new jsPDF();
      await addHeader(doc, "Athlete Demographics Report");
      const startY = getStartY();

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Overall Statistics", 14, startY - 3);
      autoTable(doc, {
        head: [["Total Athletes", "Male", "Female", "Eligible", "Ineligible"]],
        body: [
          [
            demographicsReport.overall.total_athletes,
            demographicsReport.overall.male_count,
            demographicsReport.overall.female_count,
            demographicsReport.overall.eligible_count,
            demographicsReport.overall.ineligible_count,
          ],
        ],
        startY,
        theme: "grid",
        headStyles,
        styles: tableStyles,
        alternateRowStyles: altRow,
        margin: { left: 14, right: 14 },
      });
      let y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Gender Distribution", 14, y);
      y += 4;
      autoTable(doc, {
        head: [["Gender", "Count", "Percentage"]],
        body: demographicsReport.by_gender.map((g) => [
          g.gender,
          g.count,
          `${g.percentage}%`,
        ]),
        startY: y,
        theme: "grid",
        headStyles,
        styles: tableStyles,
        alternateRowStyles: altRow,
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40, halign: "center" },
          2: { cellWidth: 40, halign: "center" },
        },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Athletes by Sport", 14, y);
      y += 4;
      autoTable(doc, {
        head: [["Sport", "Total", "Male", "Female", "Eligible", "Ineligible"]],
        body: demographicsReport.by_sport.map((s) => [
          s.sport,
          s.count,
          s.male,
          s.female,
          s.eligible,
          s.ineligible,
        ]),
        startY: y,
        theme: "grid",
        headStyles,
        styles: tableStyles,
        alternateRowStyles: altRow,
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 20, halign: "center" },
          2: { cellWidth: 20, halign: "center" },
          3: { cellWidth: 20, halign: "center" },
          4: { cellWidth: 25, halign: "center" },
          5: { cellWidth: 25, halign: "center" },
        },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Athletes by Department", 14, y);
      y += 4;
      autoTable(doc, {
        head: [["Department", "Total", "Male", "Female"]],
        body: demographicsReport.by_department.map((d) => [
          d.department,
          d.count,
          d.male,
          d.female,
        ]),
        startY: y,
        theme: "grid",
        headStyles,
        styles: tableStyles,
        alternateRowStyles: altRow,
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30, halign: "center" },
          2: { cellWidth: 30, halign: "center" },
          3: { cellWidth: 30, halign: "center" },
        },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Academic Status", 14, y);
      y += 4;
      autoTable(doc, {
        head: [["Status", "Count", "Percentage"]],
        body: demographicsReport.by_academic_status.map((s) => [
          s.status,
          s.count,
          `${s.percentage}%`,
        ]),
        startY: y,
        theme: "grid",
        headStyles,
        styles: tableStyles,
        alternateRowStyles: altRow,
        didParseCell: (data) => {
          if (data.column.index === 0 && data.section === "body") {
            data.cell.styles.textColor =
              data.cell.raw === "Eligible" ? [34, 139, 34] : [220, 53, 69];
            data.cell.styles.fontStyle = "bold";
          }
        },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40, halign: "center" },
          2: { cellWidth: 40, halign: "center" },
        },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;

      if (demographicsReport.by_coach.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text("Athletes by Coach", 14, y);
        y += 4;
        autoTable(doc, {
          head: [["Coach Name", "Sport", "Athletes"]],
          body: demographicsReport.by_coach.map((c) => [
            c.coach_name,
            c.sport,
            c.count,
          ]),
          startY: y,
          theme: "grid",
          headStyles,
          styles: tableStyles,
          alternateRowStyles: altRow,
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 70 },
            2: { cellWidth: 30, halign: "center" },
          },
          margin: { left: 14, right: 14 },
        });
        y = (doc as any).lastAutoTable.finalY + 10;
      }

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Health & Medical Records", 14, y);
      y += 4;
      autoTable(doc, {
        head: [["Status", "Count", "Percentage"]],
        body: demographicsReport.health_overview.map((h) => [
          h.status,
          h.count,
          `${h.percentage}%`,
        ]),
        startY: y,
        theme: "grid",
        headStyles,
        styles: tableStyles,
        alternateRowStyles: altRow,
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 40, halign: "center" },
          2: { cellWidth: 40, halign: "center" },
        },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Enrollment Trends", 14, y);
      y += 4;
      autoTable(doc, {
        head: [["Year", "Athletes Enrolled"]],
        body: demographicsReport.enrollment_trends.map((t) => [
          t.year,
          t.count,
        ]),
        startY: y,
        theme: "grid",
        headStyles,
        styles: tableStyles,
        alternateRowStyles: altRow,
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 80, halign: "center" },
        },
        margin: { left: 14, right: 14 },
      });

      addFooter(doc, (doc as any).lastAutoTable.finalY);
      doc.save(
        `Demographics_Report_${new Date().toISOString().split("T")[0]}.pdf`,
      );
    };

    // ─── Attendance ───────────────────────────────────────────────────────────
    const generateAttendancePDF = async () => {
      if (!attendanceReport) return;
      const doc = new jsPDF();
      await addHeader(doc, "Attendance Analytics Report");
      const startY = getStartY();

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Overall Attendance Statistics", 14, startY - 3);
      autoTable(doc, {
        head: [
          [
            "Total Records",
            "Present",
            "Absent",
            "Excused",
            "Late",
            "Attendance Rate",
          ],
        ],
        body: [
          [
            attendanceReport.overall.total_records,
            attendanceReport.overall.present,
            attendanceReport.overall.absent,
            attendanceReport.overall.excused,
            attendanceReport.overall.late,
            `${attendanceReport.overall.attendance_rate}%`,
          ],
        ],
        startY,
        theme: "grid",
        headStyles,
        styles: tableStyles,
        alternateRowStyles: altRow,
        margin: { left: 14, right: 14 },
      });
      let y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Attendance by Sport", 14, y);
      y += 4;
      autoTable(doc, {
        head: [
          [
            "Sport",
            "Athletes",
            "Total",
            "Present",
            "Absent",
            "Excused",
            "Late",
            "Rate",
          ],
        ],
        body: attendanceReport.by_sport.map((s) => [
          s.sport,
          s.total_athletes,
          s.total_records,
          s.present,
          s.absent,
          s.excused,
          s.late,
          `${s.attendance_rate}%`,
        ]),
        startY: y,
        theme: "grid",
        headStyles,
        styles: tableStyles,
        alternateRowStyles: altRow,
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 18, halign: "center" },
          2: { cellWidth: 18, halign: "center" },
          3: { cellWidth: 18, halign: "center" },
          4: { cellWidth: 18, halign: "center" },
          5: { cellWidth: 18, halign: "center" },
          6: { cellWidth: 18, halign: "center" },
          7: { cellWidth: 20, halign: "center" },
        },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Monthly Attendance Trends", 14, y);
      y += 4;
      autoTable(doc, {
        head: [
          ["Month", "Total", "Present", "Absent", "Excused", "Late", "Rate"],
        ],
        body: attendanceReport.by_month.map((m) => [
          m.month,
          m.total,
          m.present,
          m.absent,
          m.excused,
          m.late,
          `${m.rate}%`,
        ]),
        startY: y,
        theme: "grid",
        headStyles,
        styles: tableStyles,
        alternateRowStyles: altRow,
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 22, halign: "center" },
          2: { cellWidth: 22, halign: "center" },
          3: { cellWidth: 22, halign: "center" },
          4: { cellWidth: 22, halign: "center" },
          5: { cellWidth: 22, halign: "center" },
          6: { cellWidth: 22, halign: "center" },
        },
        margin: { left: 14, right: 14 },
      });

      addFooter(doc, (doc as any).lastAutoTable.finalY);
      doc.save(
        `Attendance_Report_${new Date().toISOString().split("T")[0]}.pdf`,
      );
    };

    // ─── Events ───────────────────────────────────────────────────────────────
    const generateEventsPDF = async () => {
      if (!eventReport) return;
      const doc = new jsPDF();
      await addHeader(doc, "Event Participation Report");
      const startY = getStartY();

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Event Overview", 14, startY - 3);
      autoTable(doc, {
        head: [
          [
            "Total Events",
            "Upcoming",
            "Ongoing",
            "Completed",
            "Cancelled",
            "Participants",
          ],
        ],
        body: [
          [
            eventReport.overall.total_events,
            eventReport.overall.upcoming,
            eventReport.overall.ongoing,
            eventReport.overall.completed,
            eventReport.overall.cancelled,
            eventReport.overall.unique_participants,
          ],
        ],
        startY,
        theme: "grid",
        headStyles,
        styles: tableStyles,
        alternateRowStyles: altRow,
        margin: { left: 14, right: 14 },
      });
      let y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Events List", 14, y);
      y += 4;
      autoTable(doc, {
        head: [
          [
            "Event Name",
            "Sport",
            "Type",
            "Date",
            "Venue",
            "Status",
            "Participants",
          ],
        ],
        body: eventReport.events.map((e) => [
          e.event_name,
          e.sport,
          e.event_type,
          new Date(e.event_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          e.venue,
          e.status,
          e.participant_count,
        ]),
        startY: y,
        theme: "grid",
        headStyles,
        styles: { ...tableStyles, fontSize: 7 },
        alternateRowStyles: altRow,
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 22 },
          2: { cellWidth: 20 },
          3: { cellWidth: 22 },
          4: { cellWidth: 30 },
          5: { cellWidth: 20, halign: "center" },
          6: { cellWidth: 18, halign: "center" },
        },
        didParseCell: (data) => {
          if (data.column.index === 5 && data.section === "body") {
            const v = data.cell.raw as string;
            if (v === "Completed") data.cell.styles.textColor = [34, 139, 34];
            else if (v === "Upcoming")
              data.cell.styles.textColor = [57, 107, 153];
            else if (v === "Cancelled")
              data.cell.styles.textColor = [220, 53, 69];
          }
        },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Events by Sport", 14, y);
      y += 4;
      autoTable(doc, {
        head: [["Sport", "Event Count"]],
        body: eventReport.by_sport.map((s) => [s.sport, s.count]),
        startY: y,
        theme: "grid",
        headStyles,
        styles: tableStyles,
        alternateRowStyles: altRow,
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 60, halign: "center" },
        },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Top Athletes (Most Records)", 14, y);
      y += 4;
      autoTable(doc, {
        head: [["#", "Athlete Name", "Sport", "Total Records"]],
        body: eventReport.top_athletes.map((a, i) => [
          i + 1,
          a.athlete_name,
          a.sport,
          a.total_records,
        ]),
        startY: y,
        theme: "grid",
        headStyles,
        styles: tableStyles,
        alternateRowStyles: altRow,
        columnStyles: {
          0: { cellWidth: 15, halign: "center" },
          1: { cellWidth: 70 },
          2: { cellWidth: 60 },
          3: { cellWidth: 30, halign: "center" },
        },
        margin: { left: 14, right: 14 },
      });

      addFooter(doc, (doc as any).lastAutoTable.finalY);
      doc.save(
        `Event_Participation_Report_${new Date().toISOString().split("T")[0]}.pdf`,
      );
    };

    // ─── Games ────────────────────────────────────────────────────────────────
    const generateGamesPDF = async () => {
      if (!gameReport) return;
      const doc = new jsPDF();
      await addHeader(doc, "Game Reports");
      const startY = getStartY();

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Overall Game Statistics", 14, startY - 3);
      autoTable(doc, {
        head: [
          [
            "Total Games",
            "Completed",
            "Scheduled",
            "Cancelled",
            "Wins",
            "Losses",
            "Draws",
            "Win Rate",
          ],
        ],
        body: [
          [
            gameReport.overall.total_games,
            gameReport.overall.completed_games,
            gameReport.overall.scheduled_games,
            gameReport.overall.cancelled_games,
            gameReport.overall.total_wins,
            gameReport.overall.total_losses,
            gameReport.overall.total_draws,
            `${gameReport.overall.win_rate}%`,
          ],
        ],
        startY,
        theme: "grid",
        headStyles,
        styles: { ...tableStyles, fontSize: 7 },
        alternateRowStyles: altRow,
        margin: { left: 14, right: 14 },
      });
      let y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Games by Sport", 14, y);
      y += 4;
      autoTable(doc, {
        head: [["Sport", "Total Games", "Wins", "Losses", "Draws", "Win Rate"]],
        body: gameReport.by_sport.map((s) => [
          s.sport,
          s.total_games,
          s.wins,
          s.losses,
          s.draws,
          `${s.win_rate}%`,
        ]),
        startY: y,
        theme: "grid",
        headStyles,
        styles: tableStyles,
        alternateRowStyles: altRow,
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 25, halign: "center" },
          2: { cellWidth: 20, halign: "center" },
          3: { cellWidth: 20, halign: "center" },
          4: { cellWidth: 20, halign: "center" },
          5: { cellWidth: 25, halign: "center" },
        },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Games List", 14, y);
      y += 4;
      autoTable(doc, {
        head: [
          [
            "Event",
            "Sport",
            "Date",
            "Home Team",
            "Score",
            "Away Team",
            "Status",
          ],
        ],
        body: gameReport.games.map((g) => [
          g.event_name,
          g.sport,
          new Date(g.game_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          g.home_team,
          `${g.home_score} - ${g.away_score}`,
          g.away_team,
          g.game_status,
        ]),
        startY: y,
        theme: "grid",
        headStyles,
        styles: { ...tableStyles, fontSize: 7 },
        alternateRowStyles: altRow,
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 22 },
          2: { cellWidth: 22 },
          3: { cellWidth: 28 },
          4: { cellWidth: 18, halign: "center" },
          5: { cellWidth: 28 },
          6: { cellWidth: 20, halign: "center" },
        },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;

      if (gameReport.top_performers.length > 0) {
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text("Top Performers", 14, y);
        y += 4;
        autoTable(doc, {
          head: [
            ["#", "Athlete Name", "Sport", "Games Played", "Wins", "Win Rate"],
          ],
          body: gameReport.top_performers.map((p, i) => [
            i + 1,
            p.athlete_name,
            p.sport,
            p.total_games,
            p.wins,
            `${p.win_rate}%`,
          ]),
          startY: y,
          theme: "grid",
          headStyles,
          styles: tableStyles,
          alternateRowStyles: altRow,
          columnStyles: {
            0: { cellWidth: 12, halign: "center" },
            1: { cellWidth: 55 },
            2: { cellWidth: 40 },
            3: { cellWidth: 25, halign: "center" },
            4: { cellWidth: 20, halign: "center" },
            5: { cellWidth: 25, halign: "center" },
          },
          margin: { left: 14, right: 14 },
        });
      }

      addFooter(doc, (doc as any).lastAutoTable.finalY);
      doc.save(`Game_Report_${new Date().toISOString().split("T")[0]}.pdf`);
    };

    // ─── Practices ────────────────────────────────────────────────────────────
    const generatePracticesPDF = async () => {
      if (!practiceReport) return;
      const doc = new jsPDF();
      await addHeader(doc, "Practice Schedule Report");
      const startY = getStartY();

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Overall Practice Statistics", 14, startY - 3);
      autoTable(doc, {
        head: [
          [
            "Total",
            "Completed",
            "Pending",
            "Approved",
            "Athletes Involved",
            "Avg Attendance Rate",
          ],
        ],
        body: [
          [
            practiceReport.overall.total_practices,
            practiceReport.overall.completed_practices,
            practiceReport.overall.pending_practices,
            practiceReport.overall.approved_practices,
            practiceReport.overall.total_athletes_involved,
            `${practiceReport.overall.average_attendance_rate}%`,
          ],
        ],
        startY,
        theme: "grid",
        headStyles,
        styles: { ...tableStyles, fontSize: 7 },
        alternateRowStyles: altRow,
        margin: { left: 14, right: 14 },
      });
      let y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Practices by Sport", 14, y);
      y += 4;
      autoTable(doc, {
        head: [
          ["Sport", "Total Practices", "Avg Attendance", "Total Athletes"],
        ],
        body: practiceReport.by_sport.map((s) => [
          s.sport,
          s.total_practices,
          `${s.average_attendance}%`,
          s.total_athletes,
        ]),
        startY: y,
        theme: "grid",
        headStyles,
        styles: tableStyles,
        alternateRowStyles: altRow,
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 35, halign: "center" },
          2: { cellWidth: 35, halign: "center" },
          3: { cellWidth: 35, halign: "center" },
        },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Practices by Coach", 14, y);
      y += 4;
      autoTable(doc, {
        head: [
          [
            "Coach Name",
            "Sport",
            "Total Practices",
            "Avg Attendance",
            "Athletes Coached",
          ],
        ],
        body: practiceReport.by_coach.map((c) => [
          c.coach_name,
          c.sport,
          c.total_practices,
          `${c.average_attendance}%`,
          c.athletes_coached,
        ]),
        startY: y,
        theme: "grid",
        headStyles,
        styles: tableStyles,
        alternateRowStyles: altRow,
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 35 },
          2: { cellWidth: 30, halign: "center" },
          3: { cellWidth: 30, halign: "center" },
          4: { cellWidth: 30, halign: "center" },
        },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text("Practice Sessions", 14, y);
      y += 4;
      autoTable(doc, {
        head: [
          [
            "Coach",
            "Sport",
            "Date",
            "Venue",
            "Players",
            "Present",
            "Absent",
            "Rate",
            "Status",
          ],
        ],
        body: practiceReport.practices.map((p) => [
          p.coach_name,
          p.sport,
          new Date(p.practice_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          p.venue,
          p.total_players,
          p.athletes_present,
          p.athletes_absent,
          `${p.attendance_rate}%`,
          p.status,
        ]),
        startY: y,
        theme: "grid",
        headStyles,
        styles: { ...tableStyles, fontSize: 7 },
        alternateRowStyles: altRow,
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 22 },
          2: { cellWidth: 22 },
          3: { cellWidth: 28 },
          4: { cellWidth: 14, halign: "center" },
          5: { cellWidth: 14, halign: "center" },
          6: { cellWidth: 14, halign: "center" },
          7: { cellWidth: 16, halign: "center" },
          8: { cellWidth: 18, halign: "center" },
        },
        margin: { left: 14, right: 14 },
      });

      addFooter(doc, (doc as any).lastAutoTable.finalY);
      doc.save(`Practice_Report_${new Date().toISOString().split("T")[0]}.pdf`);
    };

    // ─── Master download handler ───────────────────────────────────────────────
    const handleDownloadPDF = async () => {
      try {
        if (activeTab === "demographics") await generateDemographicsPDF();
        else if (activeTab === "attendance") await generateAttendancePDF();
        else if (activeTab === "events") await generateEventsPDF();
        else if (activeTab === "games") await generateGamesPDF();
        else if (activeTab === "practices") await generatePracticesPDF();
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please try again.");
      }
    };

    // Expose triggerDownload so the parent's preview modal can call it via ref
    useImperativeHandle(ref, () => ({
      triggerDownload: handleDownloadPDF,
    }));

    return (
      <button
        onClick={onRequestPreview ? onRequestPreview : handleDownloadPDF}
        disabled={disabled}
        className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
  },
);

ReportsPDFButton.displayName = "ReportsPDFButton";

export default ReportsPDFButton;
