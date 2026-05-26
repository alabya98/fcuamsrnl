<?php
// server/app/Http/Controllers/Api/PracticeReportController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PracticeSchedule;
use App\Models\Attendance;
use App\Models\Coach;
use App\Models\Athlete;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PracticeReportController extends Controller
{
    /**
     * Get Practice Schedule Reports
     */
    public function getPracticeReport(Request $request)
    {
        try {
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');
            $sport = $request->query('sport');
            $coachId = $request->query('coach_id');
            $venue = $request->query('venue');

            // Query practice schedules
            $practicesQuery = PracticeSchedule::with(['coach', 'attendances.athlete'])
                ->where('is_deleted', false);

            if ($startDate && $endDate) {
                $practicesQuery->whereBetween('practice_date', [$startDate, $endDate]);
            }

            if ($sport && $sport !== 'all') {
                $practicesQuery->where('sport', $sport);
            }

            if ($coachId) {
                $practicesQuery->where('coach_id', $coachId);
            }

            if ($venue) {
                $practicesQuery->where('venue', 'LIKE', '%' . $venue . '%');
            }

            $practices = $practicesQuery->orderBy('practice_date', 'desc')->get();

            // Process practice sessions
            $practiceSessions = [];
            $totalAthletesInvolved = collect();

            foreach ($practices as $practice) {
                // Get submitted attendances only
                $attendances = $practice->attendances()
                    ->where('is_submitted', true)
                    ->with('athlete')
                    ->get();

                $totalPlayers = $attendances->count();
                $athletesPresent = $attendances->where('attendance_status', 'Present')->count();
                $athletesAbsent = $attendances->where('attendance_status', 'Absent')->count();
                $athletesExcused = $attendances->where('attendance_status', 'Excused')->count();
                $athletesLate = $attendances->where('attendance_status', 'Late')->count();

                $attendanceRate = $totalPlayers > 0
                    ? round(($athletesPresent / $totalPlayers) * 100, 2)
                    : 0;

                // Build athletes list
                $athletesList = $attendances->map(function ($attendance) {
                    return [
                        'athlete_id' => $attendance->athlete_id,
                        'athlete_name' => $attendance->athlete
                            ? $attendance->athlete->first_name . ' ' . $attendance->athlete->last_name
                            : 'Unknown',
                        'attendance_status' => $attendance->attendance_status,
                        'attendance_notes' => $attendance->attendance_notes,
                    ];
                });

                // Collect unique athletes
                foreach ($attendances as $attendance) {
                    if ($attendance->athlete_id) {
                        $totalAthletesInvolved->push($attendance->athlete_id);
                    }
                }

                $coachName = $practice->coach
                    ? $practice->coach->first_name . ' ' . $practice->coach->last_name
                    : 'Unknown Coach';

                $practiceSessions[] = [
                    'practice_schedule_id' => $practice->practice_schedule_id,
                    'coach_id' => $practice->coach_id,
                    'coach_name' => $coachName,
                    'sport' => $practice->sport,
                    'practice_date' => Carbon::parse($practice->practice_date)->format('Y-m-d'),
                    'start_time' => Carbon::parse($practice->start_time)->format('H:i'),
                    'end_time' => Carbon::parse($practice->end_time)->format('H:i'),
                    'venue' => $practice->venue,
                    'total_players' => $totalPlayers,
                    'athletes_present' => $athletesPresent,
                    'athletes_absent' => $athletesAbsent,
                    'athletes_excused' => $athletesExcused,
                    'athletes_late' => $athletesLate,
                    'attendance_rate' => $attendanceRate,
                    'status' => $practice->status,
                    'athletes' => $athletesList,
                ];
            }

            $totalPractices = count($practiceSessions);
            $completedPractices = $practices->where('status', 'Completed')->count();
            $pendingPractices = $practices->where('status', 'Pending')->count();
            $approvedPractices = $practices->where('status', 'Approved')->count();
            $uniqueAthletesInvolved = $totalAthletesInvolved->unique()->count();

            // Calculate average attendance rate
            $averageAttendanceRate = $totalPractices > 0
                ? round(collect($practiceSessions)->avg('attendance_rate'), 2)
                : 0;

            // By Sport
            $bySport = collect($practiceSessions)->groupBy('sport')->map(function ($sportPractices, $sport) {
                $totalPractices = count($sportPractices);
                $avgAttendance = round(collect($sportPractices)->avg('attendance_rate'), 2);
                $totalAthletes = collect($sportPractices)->pluck('athletes')->flatten(1)
                    ->pluck('athlete_id')->unique()->count();

                return [
                    'sport' => $sport,
                    'total_practices' => $totalPractices,
                    'average_attendance' => $avgAttendance,
                    'total_athletes' => $totalAthletes,
                ];
            })->values();

            // By Coach
            $byCoach = collect($practiceSessions)->groupBy('coach_id')->map(function ($coachPractices) {
                $first = $coachPractices->first();
                $totalPractices = count($coachPractices);
                $avgAttendance = round(collect($coachPractices)->avg('attendance_rate'), 2);
                $athletesCoached = collect($coachPractices)->pluck('athletes')->flatten(1)
                    ->pluck('athlete_id')->unique()->count();

                return [
                    'coach_id' => $first['coach_id'],
                    'coach_name' => $first['coach_name'],
                    'sport' => $first['sport'],
                    'total_practices' => $totalPractices,
                    'average_attendance' => $avgAttendance,
                    'athletes_coached' => $athletesCoached,
                ];
            })->sortByDesc('total_practices')->values();

            // By Venue
            $byVenue = collect($practiceSessions)->groupBy('venue')->map(function ($venuePractices, $venue) {
                $sports = collect($venuePractices)->pluck('sport')->unique()->values();

                return [
                    'venue' => $venue,
                    'practice_count' => count($venuePractices),
                    'sports' => $sports,
                ];
            })->values();

            // By Month
            $byMonth = collect($practiceSessions)->groupBy(function ($practice) {
                return Carbon::parse($practice['practice_date'])->format('Y-m');
            })->map(function ($monthPractices, $month) {
                $totalPractices = count($monthPractices);
                $avgAttendance = round(collect($monthPractices)->avg('attendance_rate'), 2);

                return [
                    'month' => $month,
                    'month_name' => Carbon::parse($month . '-01')->format('F Y'),
                    'total_practices' => $totalPractices,
                    'average_attendance' => $avgAttendance,
                ];
            })->values();

            return response()->json([
                'overall' => [
                    'total_practices' => $totalPractices,
                    'completed_practices' => $completedPractices,
                    'pending_practices' => $pendingPractices,
                    'approved_practices' => $approvedPractices,
                    'total_athletes_involved' => $uniqueAthletesInvolved,
                    'average_attendance_rate' => $averageAttendanceRate,
                ],
                'practices' => $practiceSessions,
                'by_sport' => $bySport,
                'by_coach' => $byCoach,
                'by_venue' => $byVenue,
                'by_month' => $byMonth,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Practice Report Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to generate practice report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export Practice Report to PDF
     */
    public function exportPracticeReportPDF(Request $request)
    {
        try {
            $response = $this->getPracticeReport($request);
            $data = json_decode($response->getContent(), true);

            $pdf = new \TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

            $pdf->SetCreator('FAMS');
            $pdf->SetAuthor('FAMS System');
            $pdf->SetTitle('Practice Schedule Report');
            $pdf->SetMargins(15, 15, 15);
            $pdf->SetAutoPageBreak(TRUE, 15);
            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);
            $pdf->AddPage();
            $pdf->SetFont('helvetica', '', 10);

            $html = $this->generatePracticeReportPDFHTML($data);
            $pdf->writeHTML($html, true, false, true, false, '');

            return response($pdf->Output('practice-report.pdf', 'S'), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="practice-report-' . date('Y-m-d') . '.pdf"'
            ]);

        } catch (\Exception $e) {
            Log::error('Practice Report PDF Export Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to export practice report PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export Practice Report to Excel
     */
    public function exportPracticeReportExcel(Request $request)
    {
        try {
            $response = $this->getPracticeReport($request);
            $data = json_decode($response->getContent(), true);

            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Practice Report');

            $headerStyle = [
                'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => '396B99']],
                'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER]
            ];

            $this->generatePracticeReportExcel($sheet, $data, $headerStyle);

            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
            $filename = 'practice-report-' . date('Y-m-d') . '.xlsx';
            $temp_file = tempnam(sys_get_temp_dir(), $filename);
            $writer->save($temp_file);

            return response()->download($temp_file, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ])->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            Log::error('Practice Report Excel Export Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to export practice report Excel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate PDF HTML for Practice Report
     */
    private function generatePracticeReportPDFHTML($data)
    {
        $html = '<h1 style="color: #396B99; text-align: center;">Practice Schedule Report</h1>';
        $html .= '<p style="text-align: center; color: #666;">Generated on ' . date('F d, Y') . '</p>';
        $html .= '<hr style="border: 1px solid #396B99;">';

        // Overall Statistics
        $html .= '<h2 style="color: #396B99;">Overall Statistics</h2>';
        $html .= '<table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse;">';
        $html .= '<tr style="background-color: #396B99; color: white;">';
        $html .= '<th>Total Practices</th><th>Completed</th><th>Pending</th><th>Athletes Involved</th><th>Avg Attendance</th>';
        $html .= '</tr><tr>';
        $html .= '<td align="center">' . $data['overall']['total_practices'] . '</td>';
        $html .= '<td align="center">' . $data['overall']['completed_practices'] . '</td>';
        $html .= '<td align="center">' . $data['overall']['pending_practices'] . '</td>';
        $html .= '<td align="center">' . $data['overall']['total_athletes_involved'] . '</td>';
        $html .= '<td align="center">' . $data['overall']['average_attendance_rate'] . '%</td>';
        $html .= '</tr></table><br>';

        // Practice Sessions List
        $html .= '<h2 style="color: #396B99;">Practice Sessions</h2>';
        $html .= '<table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse;">';
        $html .= '<tr style="background-color: #396B99; color: white;">';
        $html .= '<th>Date</th><th>Coach</th><th>Sport</th><th>Venue</th><th>Present</th><th>Attendance %</th>';
        $html .= '</tr>';

        foreach ($data['practices'] as $practice) {
            $html .= '<tr>';
            $html .= '<td>' . $practice['practice_date'] . '</td>';
            $html .= '<td>' . $practice['coach_name'] . '</td>';
            $html .= '<td>' . $practice['sport'] . '</td>';
            $html .= '<td>' . $practice['venue'] . '</td>';
            $html .= '<td align="center">' . $practice['athletes_present'] . '</td>';
            $html .= '<td align="center">' . $practice['attendance_rate'] . '%</td>';
            $html .= '</tr>';
        }
        $html .= '</table>';

        return $html;
    }

    /**
     * Generate Excel for Practice Report
     */
    private function generatePracticeReportExcel($sheet, $data, $headerStyle)
    {
        // Title
        $sheet->mergeCells('A1:F1');
        $sheet->setCellValue('A1', 'PRACTICE SCHEDULE REPORT');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

        $sheet->mergeCells('A2:F2');
        $sheet->setCellValue('A2', 'Generated on ' . date('F d, Y'));
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

        $row = 4;

        // Overall Statistics
        $sheet->setCellValue('A' . $row, 'OVERALL STATISTICS');
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(14);
        $row++;

        $sheet->setCellValue('A' . $row, 'Total Practices');
        $sheet->setCellValue('B' . $row, 'Completed');
        $sheet->setCellValue('C' . $row, 'Pending');
        $sheet->setCellValue('D' . $row, 'Athletes Involved');
        $sheet->setCellValue('E' . $row, 'Avg Attendance (%)');
        $sheet->getStyle('A' . $row . ':E' . $row)->applyFromArray($headerStyle);
        $row++;

        $sheet->setCellValue('A' . $row, $data['overall']['total_practices']);
        $sheet->setCellValue('B' . $row, $data['overall']['completed_practices']);
        $sheet->setCellValue('C' . $row, $data['overall']['pending_practices']);
        $sheet->setCellValue('D' . $row, $data['overall']['total_athletes_involved']);
        $sheet->setCellValue('E' . $row, $data['overall']['average_attendance_rate']);
        $row += 2;

        // Practice Sessions List
        $sheet->setCellValue('A' . $row, 'PRACTICE SESSIONS');
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(14);
        $row++;

        $sheet->setCellValue('A' . $row, 'Date');
        $sheet->setCellValue('B' . $row, 'Coach');
        $sheet->setCellValue('C' . $row, 'Sport');
        $sheet->setCellValue('D' . $row, 'Venue');
        $sheet->setCellValue('E' . $row, 'Present');
        $sheet->setCellValue('F' . $row, 'Attendance (%)');
        $sheet->getStyle('A' . $row . ':F' . $row)->applyFromArray($headerStyle);
        $row++;

        foreach ($data['practices'] as $practice) {
            $sheet->setCellValue('A' . $row, $practice['practice_date']);
            $sheet->setCellValue('B' . $row, $practice['coach_name']);
            $sheet->setCellValue('C' . $row, $practice['sport']);
            $sheet->setCellValue('D' . $row, $practice['venue']);
            $sheet->setCellValue('E' . $row, $practice['athletes_present']);
            $sheet->setCellValue('F' . $row, $practice['attendance_rate']);
            $row++;
        }

        // Auto-size columns
        foreach (range('A', 'F') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }

    /**
     * Get available coaches for filtering
     */
    public function getAvailableCoaches(Request $request)
    {
        try {
            $sport = $request->query('sport');

            $query = Coach::where('is_deleted', false)
                ->select('coach_id', 'first_name', 'last_name', 'sports_coached');

            if ($sport) {
                $query->where('sports_coached', $sport);
            }

            $coaches = $query->get()->map(function ($coach) {
                return [
                    'coach_id' => $coach->coach_id,
                    'name' => $coach->first_name . ' ' . $coach->last_name,
                    'sport' => $coach->sports_coached
                ];
            });

            return response()->json([
                'coaches' => $coaches
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to load coaches',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
