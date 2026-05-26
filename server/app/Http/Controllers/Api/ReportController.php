<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Athlete;
use App\Models\Attendance;
use App\Models\Event;
use App\Models\Record;
use App\Models\Sport;
use App\Models\Coach;
use App\Models\Gender;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Get Athlete Demographics & Statistics Report
     */
    public function getAthleteDemographicsReport(Request $request)
    {
        try {
            $sport = $request->query('sport');

            $query = Athlete::with(['gender', 'coach'])
                ->where('is_deleted', false);

            if ($sport) {
                $query->where('sport', $sport);
            }

            $athletes = $query->get();

            // Overall Statistics
            $totalAthletes = $athletes->count();

            // FIXED: Proper gender counting - use 'gender' column instead of 'gender_name'
            $maleCount = 0;
            $femaleCount = 0;

            foreach ($athletes as $athlete) {
                if ($athlete->gender) {
                    // Check both 'gender' and 'gender_name' columns for compatibility
                    $genderValue = isset($athlete->gender->gender) ? $athlete->gender->gender : (isset($athlete->gender->gender_name) ? $athlete->gender->gender_name : '');
                    $genderName = strtolower(trim($genderValue));

                    if ($genderName === 'male') {
                        $maleCount++;
                    } elseif ($genderName === 'female') {
                        $femaleCount++;
                    }
                }
            }

            $eligibleCount = $athletes->where('academic_status', 'Eligible')->count();
            $ineligibleCount = $athletes->where('academic_status', 'Ineligible')->count();
            $athletesWithCoach = $athletes->whereNotNull('coach_id')->count();
            $athletesWithoutCoach = $athletes->whereNull('coach_id')->count();

            // ✅ FIXED: Athletes with medical records - using the medical_documents_count field
            // Since medical records are uploaded as documents, we check if they have any
            $athletesWithMedicalRecords = Athlete::where('is_deleted', false)
                ->where('medical_documents_count', '>', 0)
                ->when($sport, function ($q) use ($sport) {
                    return $q->where('sport', $sport);
                })
                ->count();

            // Athletes with records/achievements
            $athleteNames = $athletes->map(function ($athlete) {
                return $athlete->first_name . ' ' . $athlete->last_name;
            });

            $athletesWithRecords = 0;
            if ($athleteNames->count() > 0) {
                $athletesWithRecords = Record::where('is_deleted', false)
                    ->where(function ($q) use ($athleteNames) {
                        foreach ($athleteNames as $name) {
                            $q->orWhere('athlete_name', 'LIKE', '%' . $name . '%');
                        }
                    })
                    ->distinct('athlete_name')
                    ->count('athlete_name');
            }

            $athletesWithoutRecords = $totalAthletes - $athletesWithRecords;

            // By Department
            $byDepartment = $athletes->groupBy('department')->map(function ($group, $dept) {
                $maleCount = 0;
                $femaleCount = 0;

                foreach ($group as $athlete) {
                    if ($athlete->gender) {
                        $genderValue = isset($athlete->gender->gender) ? $athlete->gender->gender : (isset($athlete->gender->gender_name) ? $athlete->gender->gender_name : '');
                        $genderName = strtolower(trim($genderValue));
                        if ($genderName === 'male') {
                            $maleCount++;
                        } elseif ($genderName === 'female') {
                            $femaleCount++;
                        }
                    }
                }

                return [
                    'department' => $dept,
                    'count' => $group->count(),
                    'male' => $maleCount,
                    'female' => $femaleCount
                ];
            })->sortByDesc('count')->values();

            // FIXED: By Sport - Get from Sports Management
            $sportsList = Sport::where('is_deleted', false)->get();

            $bySport = $sportsList->map(function ($sportItem) use ($athletes) {
                $athletesInSport = $athletes->where('sport', $sportItem->sport);

                $maleCount = 0;
                $femaleCount = 0;

                foreach ($athletesInSport as $athlete) {
                    if ($athlete->gender) {
                        $genderValue = isset($athlete->gender->gender) ? $athlete->gender->gender : (isset($athlete->gender->gender_name) ? $athlete->gender->gender_name : '');
                        $genderName = strtolower(trim($genderValue));
                        if ($genderName === 'male') {
                            $maleCount++;
                        } elseif ($genderName === 'female') {
                            $femaleCount++;
                        }
                    }
                }

                return [
                    'sport' => $sportItem->sport,
                    'count' => $athletesInSport->count(),
                    'male' => $maleCount,
                    'female' => $femaleCount,
                    'eligible' => $athletesInSport->where('academic_status', 'Eligible')->count(),
                    'ineligible' => $athletesInSport->where('academic_status', 'Ineligible')->count()
                ];
            })->filter(function ($sport) {
                return $sport['count'] > 0;
            })->sortByDesc('count')->values();

            // By Gender
            $byGender = collect([
                [
                    'gender' => 'Male',
                    'count' => $maleCount,
                    'percentage' => $totalAthletes > 0 ? round(($maleCount / $totalAthletes) * 100, 1) : 0
                ],
                [
                    'gender' => 'Female',
                    'count' => $femaleCount,
                    'percentage' => $totalAthletes > 0 ? round(($femaleCount / $totalAthletes) * 100, 1) : 0
                ]
            ]);

            // Academic Status Distribution
            $byAcademicStatus = [
                [
                    'status' => 'Eligible',
                    'count' => $eligibleCount,
                    'percentage' => $totalAthletes > 0 ? round(($eligibleCount / $totalAthletes) * 100, 1) : 0
                ],
                [
                    'status' => 'Ineligible',
                    'count' => $ineligibleCount,
                    'percentage' => $totalAthletes > 0 ? round(($ineligibleCount / $totalAthletes) * 100, 1) : 0
                ]
            ];

            // Age Distribution
            $ageDistribution = [];
            $athletesWithBirthDate = $athletes->filter(function ($athlete) {
                return $athlete->birth_date !== null;
            });

            if ($athletesWithBirthDate->count() > 0) {
                $ageGroups = $athletesWithBirthDate->groupBy(function ($athlete) {
                    $age = Carbon::parse($athlete->birth_date)->age;
                    if ($age < 18) return 'Under 18';
                    if ($age <= 20) return '18-20';
                    if ($age <= 22) return '21-22';
                    if ($age <= 24) return '23-24';
                    return '25+';
                });

                $ageDistribution = $ageGroups->map(function ($group, $range) {
                    return [
                        'age_range' => $range,
                        'count' => $group->count()
                    ];
                })->values();
            }

            // Coach Assignment Distribution
            $coachAssignment = [
                [
                    'status' => 'With Coach',
                    'count' => $athletesWithCoach,
                    'percentage' => $totalAthletes > 0 ? round(($athletesWithCoach / $totalAthletes) * 100, 1) : 0
                ],
                [
                    'status' => 'Without Coach',
                    'count' => $athletesWithoutCoach,
                    'percentage' => $totalAthletes > 0 ? round(($athletesWithoutCoach / $totalAthletes) * 100, 1) : 0
                ]
            ];

            // Athletes by Coach
            $byCoach = $athletes->whereNotNull('coach_id')
                ->groupBy(function ($athlete) {
                    return $athlete->coach ? $athlete->coach->coach_id : 'unknown';
                })
                ->map(function ($group) {
                    $coach = $group->first()->coach;
                    return [
                        'coach_name' => $coach ? $coach->first_name . ' ' . $coach->last_name : 'Unknown',
                        'sport' => $coach ? $coach->sports_coached : 'N/A',
                        'count' => $group->count()
                    ];
                })
                ->sortByDesc('count')
                ->values();

            // Health & Medical Overview
            $healthOverview = [
                [
                    'status' => 'With Medical Records',
                    'count' => $athletesWithMedicalRecords,
                    'percentage' => $totalAthletes > 0 ? round(($athletesWithMedicalRecords / $totalAthletes) * 100, 1) : 0
                ],
                [
                    'status' => 'No Medical Records',
                    'count' => $totalAthletes - $athletesWithMedicalRecords,
                    'percentage' => $totalAthletes > 0 ? round((($totalAthletes - $athletesWithMedicalRecords) / $totalAthletes) * 100, 1) : 0
                ]
            ];

            // Achievement Overview
            $achievementOverview = [
                [
                    'status' => 'With Records/Achievements',
                    'count' => $athletesWithRecords,
                    'percentage' => $totalAthletes > 0 ? round(($athletesWithRecords / $totalAthletes) * 100, 1) : 0
                ],
                [
                    'status' => 'No Records Yet',
                    'count' => $athletesWithoutRecords,
                    'percentage' => $totalAthletes > 0 ? round(($athletesWithoutRecords / $totalAthletes) * 100, 1) : 0
                ]
            ];

            // Enrollment Trends
            $enrollmentTrends = $athletes->groupBy(function ($athlete) {
                return Carbon::parse($athlete->created_at)->format('Y');
            })->map(function ($group, $year) {
                return [
                    'year' => $year,
                    'count' => $group->count()
                ];
            })->sortBy('year')->values();

            return response()->json([
                'overall' => [
                    'total_athletes' => $totalAthletes,
                    'male_count' => $maleCount,
                    'female_count' => $femaleCount,
                    'eligible_count' => $eligibleCount,
                    'ineligible_count' => $ineligibleCount,
                    'with_coach' => $athletesWithCoach,
                    'without_coach' => $athletesWithoutCoach,
                    'with_medical_records' => $athletesWithMedicalRecords,
                    'with_achievements' => $athletesWithRecords,
                    'without_achievements' => $athletesWithoutRecords
                ],
                'by_department' => $byDepartment,
                'by_sport' => $bySport,
                'by_gender' => $byGender,
                'by_academic_status' => $byAcademicStatus,
                'age_distribution' => $ageDistribution,
                'coach_assignment' => $coachAssignment,
                'by_coach' => $byCoach,
                'health_overview' => $healthOverview,
                'achievement_overview' => $achievementOverview,
                'enrollment_trends' => $enrollmentTrends
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate athlete demographics report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Attendance Analytics Report
     */
    public function getAttendanceAnalyticsReport(Request $request)
    {
        try {
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');
            $sport = $request->query('sport');

            // ✅ FIX: Base query that filters deleted schedules and only counts submitted attendance
            $query = Attendance::with(['athlete', 'practiceSchedule'])
                ->where('is_submitted', true) // Only count submitted attendance
                ->whereHas('practiceSchedule', function($q) use ($startDate, $endDate) {
                    $q->where('is_deleted', false); // ✅ Exclude deleted schedules

                    if ($startDate && $endDate) {
                        $q->whereBetween('practice_date', [$startDate, $endDate]);
                    }
                });

            $attendanceRecords = $query->get();

            // Filter by sport if provided
            if ($sport) {
                $attendanceRecords = $attendanceRecords->filter(function ($record) use ($sport) {
                    return $record->athlete && $record->athlete->sport === $sport;
                });
            }

            // Overall statistics
            $totalRecords = $attendanceRecords->count();
            $presentCount = $attendanceRecords->where('attendance_status', 'Present')->count();
            $absentCount = $attendanceRecords->where('attendance_status', 'Absent')->count();
            $excusedCount = $attendanceRecords->where('attendance_status', 'Excused')->count();
            $lateCount = $attendanceRecords->where('attendance_status', 'Late')->count();

            // ✅ FIX: By Sport - filter deleted schedules
            $bySport = Athlete::where('is_deleted', false)
                ->select('sport', DB::raw('COUNT(*) as count'))
                ->groupBy('sport')
                ->get()
                ->map(function ($item) use ($startDate, $endDate) {
                    $athleteIds = Athlete::where('sport', $item->sport)
                        ->where('is_deleted', false)
                        ->pluck('athlete_id');

                    $query = Attendance::whereIn('athlete_id', $athleteIds)
                        ->where('is_submitted', true) // Only submitted
                        ->whereHas('practiceSchedule', function($q) use ($startDate, $endDate) {
                            $q->where('is_deleted', false); // ✅ Exclude deleted schedules

                            if ($startDate && $endDate) {
                                $q->whereBetween('practice_date', [$startDate, $endDate]);
                            }
                        });

                    $sportAttendance = $query->get();
                    $sportTotal = $sportAttendance->count();
                    $sportPresent = $sportAttendance->where('attendance_status', 'Present')->count();

                    return [
                        'sport' => $item->sport,
                        'total_athletes' => $item->count,
                        'total_records' => $sportTotal,
                        'present' => $sportPresent,
                        'absent' => $sportAttendance->where('attendance_status', 'Absent')->count(),
                        'excused' => $sportAttendance->where('attendance_status', 'Excused')->count(),
                        'late' => $sportAttendance->where('attendance_status', 'Late')->count(),
                        'attendance_rate' => $sportTotal > 0 ? round(($sportPresent / $sportTotal) * 100, 2) : 0
                    ];
                });

            // ✅ FIX: By Month - use practice_date from practice_schedule
            $byMonth = $attendanceRecords->groupBy(function ($record) {
                // Use practice_date from the relationship
                if ($record->practiceSchedule) {
                    return Carbon::parse($record->practiceSchedule->practice_date)->format('Y-m');
                }
                return Carbon::parse($record->practice_date)->format('Y-m');
            })->map(function ($records, $month) {
                $total = $records->count();
                $present = $records->where('attendance_status', 'Present')->count();

                return [
                    'month' => $month,
                    'total' => $total,
                    'present' => $present,
                    'absent' => $records->where('attendance_status', 'Absent')->count(),
                    'excused' => $records->where('attendance_status', 'Excused')->count(),
                    'late' => $records->where('attendance_status', 'Late')->count(),
                    'rate' => $total > 0 ? round(($present / $total) * 100, 2) : 0
                ];
            })->values();

            return response()->json([
                'overall' => [
                    'total_records' => $totalRecords,
                    'present' => $presentCount,
                    'absent' => $absentCount,
                    'excused' => $excusedCount,
                    'late' => $lateCount,
                    'attendance_rate' => $totalRecords > 0 ? round(($presentCount / $totalRecords) * 100, 2) : 0
                ],
                'by_sport' => $bySport,
                'by_month' => $byMonth
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate attendance analytics report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Event Participation Report
     */
    public function getEventParticipationReport(Request $request)
    {
        try {
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');
            $sport = $request->query('sport');
            $hideEmpty = $request->query('hide_empty', false);

            $eventsQuery = Event::with(['creator'])
                ->where('is_deleted', false);

            if ($startDate && $endDate) {
                $eventsQuery->whereBetween('event_date', [$startDate, $endDate]);
            }

            if ($sport && $sport !== 'all') {
                $eventsQuery->where('sport', $sport);
            }

            $events = $eventsQuery->orderBy('event_date', 'desc')->get();

            $detailedEvents = $events->map(function ($event) use ($startDate, $endDate) {
                try {
                    $recordsQuery = Record::where('is_deleted', false)
                        ->where('event_name', 'LIKE', '%' . $event->event_name . '%')
                        ->where('sport', $event->sport);

                    if ($startDate && $endDate) {
                        $recordsQuery->whereBetween('event_date', [$startDate, $endDate]);
                    }

                    $eventRecords = $recordsQuery->get();
                    $participantCount = $eventRecords->unique('athlete_name')->count();

                    $participants = $eventRecords->map(function ($record) {
                        return [
                            'athlete_name' => $record->athlete_name ?? 'Unknown',
                            'achievement' => $record->achievement ?? 'N/A',
                            'competition_level' => $record->competition_level ?? 'N/A',
                            'record_type' => $record->record_type ?? 'N/A'
                        ];
                    })->unique('athlete_name')->values();

                    return [
                        'event_id' => $event->event_id,
                        'event_name' => $event->event_name ?? 'Untitled Event',
                        'description' => $event->description ?? '',
                        'event_type' => $event->event_type ?? 'N/A',
                        'sport' => $event->sport ?? 'N/A',
                        'event_date' => $event->event_date ? Carbon::parse($event->event_date)->format('Y-m-d') : null,
                        'venue' => $event->venue ?? 'TBA',
                        'status' => $event->status ?? 'Pending',
                        'organizer' => $event->organizer ?? 'N/A',
                        'max_participants' => $event->max_participants ?? 0,
                        'participant_count' => $participantCount,
                        'total_records' => $eventRecords->count(),
                        'participants' => $participants,
                        'has_records' => $eventRecords->count() > 0,
                        'creator' => $event->creator ? [
                            'name' => ($event->creator->first_name ?? '') . ' ' . ($event->creator->last_name ?? ''),
                            'role' => $event->creator->role ?? 'N/A'
                        ] : null
                    ];
                } catch (\Exception $e) {
                    Log::error('Error processing event: ' . $event->event_id, ['error' => $e->getMessage()]);
                    return null;
                }
            })->filter();

            if ($hideEmpty) {
                $detailedEvents = $detailedEvents->filter(function ($event) {
                    return $event && $event['total_records'] > 0;
                });
            }

            $detailedEvents = $detailedEvents->values();

            $totalEvents = $events->count();
            $eventsWithRecords = $detailedEvents->where('total_records', '>', 0)->count();
            $eventsWithoutRecords = $totalEvents - $eventsWithRecords;

            $upcomingEvents = $events->where('status', 'Upcoming')->count();
            $ongoingEvents = $events->where('status', 'Ongoing')->count();
            $completedEvents = $events->where('status', 'Completed')->count();
            $cancelledEvents = $events->where('status', 'Cancelled')->count();

            $recordsQuery = Record::where('is_deleted', false);
            if ($startDate && $endDate) {
                $recordsQuery->whereBetween('event_date', [$startDate, $endDate]);
            }
            if ($sport && $sport !== 'all') {
                $recordsQuery->where('sport', $sport);
            }
            $totalRecords = $recordsQuery->count();
            $uniqueParticipants = $recordsQuery->distinct('athlete_name')->count('athlete_name');

            $bySport = Event::where('is_deleted', false)
                ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                    return $q->whereBetween('event_date', [$startDate, $endDate]);
                })
                ->when($sport && $sport !== 'all', function ($q) use ($sport) {
                    return $q->where('sport', $sport);
                })
                ->select('sport', DB::raw('COUNT(*) as count'))
                ->groupBy('sport')
                ->get()
                ->map(function ($item) {
                    return [
                        'sport' => $item->sport ?? 'Unknown',
                        'count' => $item->count ?? 0
                    ];
                });

            $byMonth = $events->filter(function ($event) {
                return $event->event_date !== null;
            })->groupBy(function ($event) {
                return Carbon::parse($event->event_date)->format('Y-m');
            })->map(function ($events, $month) {
                return [
                    'month' => $month,
                    'month_name' => Carbon::parse($month . '-01')->format('F Y'),
                    'total' => $events->count(),
                    'upcoming' => $events->where('status', 'Upcoming')->count(),
                    'ongoing' => $events->where('status', 'Ongoing')->count(),
                    'completed' => $events->where('status', 'Completed')->count(),
                    'cancelled' => $events->where('status', 'Cancelled')->count()
                ];
            })->values();

            $byType = $events->filter(function ($event) {
                return $event->event_type !== null;
            })->groupBy('event_type')->map(function ($events, $type) {
                return [
                    'type' => $type ?? 'Unknown',
                    'count' => $events->count()
                ];
            })->values();

            $athleteParticipation = Record::where('is_deleted', false)
                ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                    return $q->whereBetween('event_date', [$startDate, $endDate]);
                })
                ->when($sport && $sport !== 'all', function ($q) use ($sport) {
                    return $q->where('sport', $sport);
                })
                ->whereNotNull('athlete_name')
                ->select('athlete_name', 'sport', DB::raw('COUNT(*) as total_records'))
                ->groupBy('athlete_name', 'sport')
                ->orderBy('total_records', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($item) {
                    return [
                        'athlete_name' => $item->athlete_name ?? 'Unknown',
                        'sport' => $item->sport ?? 'N/A',
                        'total_records' => $item->total_records ?? 0
                    ];
                });

            $achievementDistribution = Record::where('is_deleted', false)
                ->when($startDate && $endDate, function ($q) use ($startDate, $endDate) {
                    return $q->whereBetween('event_date', [$startDate, $endDate]);
                })
                ->when($sport && $sport !== 'all', function ($q) use ($sport) {
                    return $q->where('sport', $sport);
                })
                ->whereNotNull('achievement')
                ->select('achievement', DB::raw('COUNT(*) as count'))
                ->groupBy('achievement')
                ->orderBy('count', 'desc')
                ->get()
                ->map(function ($item) {
                    return [
                        'achievement' => $item->achievement ?? 'Unknown',
                        'count' => $item->count ?? 0
                    ];
                });

            return response()->json([
                'overall' => [
                    'total_events' => $totalEvents,
                    'events_with_records' => $eventsWithRecords,
                    'events_without_records' => $eventsWithoutRecords,
                    'upcoming' => $upcomingEvents,
                    'ongoing' => $ongoingEvents,
                    'completed' => $completedEvents,
                    'cancelled' => $cancelledEvents,
                    'total_records' => $totalRecords,
                    'unique_participants' => $uniqueParticipants,
                    'avg_participants_per_event' => $totalEvents > 0 ? round($uniqueParticipants / $totalEvents, 2) : 0
                ],
                'events' => $detailedEvents,
                'by_sport' => $bySport,
                'by_month' => $byMonth,
                'by_type' => $byType,
                'top_athletes' => $athleteParticipation,
                'achievement_distribution' => $achievementDistribution
            ], 200);
        } catch (\Exception $e) {
            Log::error('Event Participation Report Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to generate event participation report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available sports for filtering
     */
    public function getAvailableSports()
    {
        try {
            $sports = Sport::where('is_deleted', false)->pluck('sport');

            return response()->json([
                'sports' => $sports
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to load sports',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available athletes for filtering
     */
    public function getAvailableAthletes(Request $request)
    {
        try {
            $sport = $request->query('sport');

            $query = Athlete::where('is_deleted', false)
                ->select('athlete_id', 'first_name', 'last_name', 'sport');

            if ($sport) {
                $query->where('sport', $sport);
            }

            $athletes = $query->get()->map(function ($athlete) {
                return [
                    'athlete_id' => $athlete->athlete_id,
                    'name' => $athlete->first_name . ' ' . $athlete->last_name,
                    'sport' => $athlete->sport
                ];
            });

            return response()->json([
                'athletes' => $athletes
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to load athletes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

/**
 * Export Report to PDF
 */
public function exportReportPDF(Request $request, $reportType)
{
    try {
        $pdf = new \TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);

        // Set document information
        $pdf->SetCreator('FAMS');
        $pdf->SetAuthor('FAMS System');
        $pdf->SetTitle(ucfirst(str_replace('-', ' ', $reportType)) . ' Report');

        // Set margins and auto page breaks
        $pdf->SetMargins(15, 15, 15);
        $pdf->SetAutoPageBreak(TRUE, 15);

        // Remove header/footer
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);

        // Add a page
        $pdf->AddPage();

        // Set font
        $pdf->SetFont('helvetica', '', 10);

        // Get report data based on type
        $html = '';

        if ($reportType === 'athlete-demographics') {
            $response = $this->getAthleteDemographicsReport($request);
            $data = json_decode($response->getContent(), true);
            $html = $this->generateDemographicsPDFHTML($data);
        } elseif ($reportType === 'attendance-analytics') {
            $response = $this->getAttendanceAnalyticsReport($request);
            $data = json_decode($response->getContent(), true);
            $html = $this->generateAttendancePDFHTML($data);
        } elseif ($reportType === 'event-participation') {
            $response = $this->getEventParticipationReport($request);
            $data = json_decode($response->getContent(), true);
            $html = $this->generateEventParticipationPDFHTML($data);
        }

        // Write HTML content
        $pdf->writeHTML($html, true, false, true, false, '');

        // Output PDF
        return response($pdf->Output('report.pdf', 'S'), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $reportType . '-' . date('Y-m-d') . '.pdf"'
        ]);

    } catch (\Exception $e) {
        Log::error('PDF Export Error: ' . $e->getMessage());
        return response()->json([
            'message' => 'Failed to export PDF',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * Export Report to Excel
 */
public function exportReportExcel(Request $request, $reportType)
{
    try {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // Style for headers
        $headerStyle = [
            'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'startColor' => ['rgb' => '396B99']],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER]
        ];

        if ($reportType === 'athlete-demographics') {
            $response = $this->getAthleteDemographicsReport($request);
            $data = json_decode($response->getContent(), true);
            $this->generateDemographicsExcel($sheet, $data, $headerStyle);
        } elseif ($reportType === 'attendance-analytics') {
            $response = $this->getAttendanceAnalyticsReport($request);
            $data = json_decode($response->getContent(), true);
            $this->generateAttendanceExcel($sheet, $data, $headerStyle);
        } elseif ($reportType === 'event-participation') {
            $response = $this->getEventParticipationReport($request);
            $data = json_decode($response->getContent(), true);
            $this->generateEventParticipationExcel($sheet, $data, $headerStyle);
        }

        // Create writer and output
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);

        $filename = $reportType . '-' . date('Y-m-d') . '.xlsx';
        $temp_file = tempnam(sys_get_temp_dir(), $filename);

        $writer->save($temp_file);

        return response()->download($temp_file, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);

    } catch (\Exception $e) {
        Log::error('Excel Export Error: ' . $e->getMessage());
        return response()->json([
            'message' => 'Failed to export Excel',
            'error' => $e->getMessage()
        ], 500);
    }
}

// ==================== PDF GENERATION HELPERS ====================

private function generateDemographicsPDFHTML($data)
{
    $html = '<h1 style="color: #396B99; text-align: center;">Athlete Demographics Report</h1>';
    $html .= '<p style="text-align: center; color: #666;">Generated on ' . date('F d, Y') . '</p>';
    $html .= '<hr style="border: 1px solid #396B99;">';

    // Overall Statistics
    $html .= '<h2 style="color: #396B99;">Overall Statistics</h2>';
    $html .= '<table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse;">';
    $html .= '<tr style="background-color: #396B99; color: white;">';
    $html .= '<th>Total Athletes</th><th>Male</th><th>Female</th><th>Eligible</th><th>With Coach</th>';
    $html .= '</tr><tr>';
    $html .= '<td align="center">' . $data['overall']['total_athletes'] . '</td>';
    $html .= '<td align="center">' . $data['overall']['male_count'] . '</td>';
    $html .= '<td align="center">' . $data['overall']['female_count'] . '</td>';
    $html .= '<td align="center">' . $data['overall']['eligible_count'] . '</td>';
    $html .= '<td align="center">' . $data['overall']['with_coach'] . '</td>';
    $html .= '</tr></table><br>';

    // By Sport
    $html .= '<h2 style="color: #396B99;">Athletes by Sport</h2>';
    $html .= '<table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse;">';
    $html .= '<tr style="background-color: #396B99; color: white;">';
    $html .= '<th>Sport</th><th>Total</th><th>Male</th><th>Female</th><th>Eligible</th><th>Ineligible</th>';
    $html .= '</tr>';

    foreach ($data['by_sport'] as $sport) {
        $html .= '<tr>';
        $html .= '<td>' . $sport['sport'] . '</td>';
        $html .= '<td align="center">' . $sport['count'] . '</td>';
        $html .= '<td align="center">' . $sport['male'] . '</td>';
        $html .= '<td align="center">' . $sport['female'] . '</td>';
        $html .= '<td align="center">' . $sport['eligible'] . '</td>';
        $html .= '<td align="center">' . $sport['ineligible'] . '</td>';
        $html .= '</tr>';
    }
    $html .= '</table><br>';

    // By Department
    $html .= '<h2 style="color: #396B99;">Athletes by Department</h2>';
    $html .= '<table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse;">';
    $html .= '<tr style="background-color: #396B99; color: white;">';
    $html .= '<th>Department</th><th>Total</th><th>Male</th><th>Female</th>';
    $html .= '</tr>';

    foreach ($data['by_department'] as $dept) {
        $html .= '<tr>';
        $html .= '<td>' . $dept['department'] . '</td>';
        $html .= '<td align="center">' . $dept['count'] . '</td>';
        $html .= '<td align="center">' . $dept['male'] . '</td>';
        $html .= '<td align="center">' . $dept['female'] . '</td>';
        $html .= '</tr>';
    }
    $html .= '</table>';

    return $html;
}

private function generateAttendancePDFHTML($data)
{
    $html = '<h1 style="color: #396B99; text-align: center;">Attendance Analytics Report</h1>';
    $html .= '<p style="text-align: center; color: #666;">Generated on ' . date('F d, Y') . '</p>';
    $html .= '<hr style="border: 1px solid #396B99;">';

    // Overall Statistics
    $html .= '<h2 style="color: #396B99;">Overall Statistics</h2>';
    $html .= '<table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse;">';
    $html .= '<tr style="background-color: #396B99; color: white;">';
    $html .= '<th>Total Records</th><th>Present</th><th>Absent</th><th>Excused</th><th>Late</th><th>Rate</th>';
    $html .= '</tr><tr>';
    $html .= '<td align="center">' . $data['overall']['total_records'] . '</td>';
    $html .= '<td align="center">' . $data['overall']['present'] . '</td>';
    $html .= '<td align="center">' . $data['overall']['absent'] . '</td>';
    $html .= '<td align="center">' . $data['overall']['excused'] . '</td>';
    $html .= '<td align="center">' . $data['overall']['late'] . '</td>';
    $html .= '<td align="center">' . $data['overall']['attendance_rate'] . '%</td>';
    $html .= '</tr></table><br>';

    // By Sport
    $html .= '<h2 style="color: #396B99;">Attendance by Sport</h2>';
    $html .= '<table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse;">';
    $html .= '<tr style="background-color: #396B99; color: white;">';
    $html .= '<th>Sport</th><th>Athletes</th><th>Records</th><th>Present</th><th>Absent</th><th>Rate</th>';
    $html .= '</tr>';

    foreach ($data['by_sport'] as $sport) {
        $html .= '<tr>';
        $html .= '<td>' . $sport['sport'] . '</td>';
        $html .= '<td align="center">' . $sport['total_athletes'] . '</td>';
        $html .= '<td align="center">' . $sport['total_records'] . '</td>';
        $html .= '<td align="center">' . $sport['present'] . '</td>';
        $html .= '<td align="center">' . $sport['absent'] . '</td>';
        $html .= '<td align="center">' . $sport['attendance_rate'] . '%</td>';
        $html .= '</tr>';
    }
    $html .= '</table>';

    return $html;
}

private function generateEventParticipationPDFHTML($data)
{
    $html = '<h1 style="color: #396B99; text-align: center;">Event Participation Report</h1>';
    $html .= '<p style="text-align: center; color: #666;">Generated on ' . date('F d, Y') . '</p>';
    $html .= '<hr style="border: 1px solid #396B99;">';

    // Overall Statistics
    $html .= '<h2 style="color: #396B99;">Overall Statistics</h2>';
    $html .= '<table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse;">';
    $html .= '<tr style="background-color: #396B99; color: white;">';
    $html .= '<th>Total Events</th><th>Upcoming</th><th>Ongoing</th><th>Completed</th><th>Cancelled</th><th>Participants</th>';
    $html .= '</tr><tr>';
    $html .= '<td align="center">' . $data['overall']['total_events'] . '</td>';
    $html .= '<td align="center">' . $data['overall']['upcoming'] . '</td>';
    $html .= '<td align="center">' . $data['overall']['ongoing'] . '</td>';
    $html .= '<td align="center">' . $data['overall']['completed'] . '</td>';
    $html .= '<td align="center">' . $data['overall']['cancelled'] . '</td>';
    $html .= '<td align="center">' . $data['overall']['unique_participants'] . '</td>';
    $html .= '</tr></table><br>';

    // Events List
    $html .= '<h2 style="color: #396B99;">Events List</h2>';
    $html .= '<table border="1" cellpadding="8" style="width: 100%; border-collapse: collapse;">';
    $html .= '<tr style="background-color: #396B99; color: white;">';
    $html .= '<th>Event Name</th><th>Sport</th><th>Date</th><th>Status</th><th>Participants</th>';
    $html .= '</tr>';

    foreach ($data['events'] as $event) {
        $html .= '<tr>';
        $html .= '<td>' . $event['event_name'] . '</td>';
        $html .= '<td>' . $event['sport'] . '</td>';
        $html .= '<td>' . $event['event_date'] . '</td>';
        $html .= '<td>' . $event['status'] . '</td>';
        $html .= '<td align="center">' . $event['participant_count'] . '</td>';
        $html .= '</tr>';
    }
    $html .= '</table>';

    return $html;
}

// ==================== EXCEL GENERATION HELPERS ====================

private function generateDemographicsExcel($sheet, $data, $headerStyle)
{
    $sheet->setTitle('Demographics');

    // Title
    $sheet->mergeCells('A1:F1');
    $sheet->setCellValue('A1', 'ATHLETE DEMOGRAPHICS REPORT');
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

    $sheet->setCellValue('A' . $row, 'Total Athletes');
    $sheet->setCellValue('B' . $row, 'Male');
    $sheet->setCellValue('C' . $row, 'Female');
    $sheet->setCellValue('D' . $row, 'Eligible');
    $sheet->setCellValue('E' . $row, 'With Coach');
    $sheet->getStyle('A' . $row . ':E' . $row)->applyFromArray($headerStyle);
    $row++;

    $sheet->setCellValue('A' . $row, $data['overall']['total_athletes']);
    $sheet->setCellValue('B' . $row, $data['overall']['male_count']);
    $sheet->setCellValue('C' . $row, $data['overall']['female_count']);
    $sheet->setCellValue('D' . $row, $data['overall']['eligible_count']);
    $sheet->setCellValue('E' . $row, $data['overall']['with_coach']);
    $row += 2;

    // By Sport
    $sheet->setCellValue('A' . $row, 'ATHLETES BY SPORT');
    $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(14);
    $row++;

    $sheet->setCellValue('A' . $row, 'Sport');
    $sheet->setCellValue('B' . $row, 'Total');
    $sheet->setCellValue('C' . $row, 'Male');
    $sheet->setCellValue('D' . $row, 'Female');
    $sheet->setCellValue('E' . $row, 'Eligible');
    $sheet->setCellValue('F' . $row, 'Ineligible');
    $sheet->getStyle('A' . $row . ':F' . $row)->applyFromArray($headerStyle);
    $row++;

    foreach ($data['by_sport'] as $sport) {
        $sheet->setCellValue('A' . $row, $sport['sport']);
        $sheet->setCellValue('B' . $row, $sport['count']);
        $sheet->setCellValue('C' . $row, $sport['male']);
        $sheet->setCellValue('D' . $row, $sport['female']);
        $sheet->setCellValue('E' . $row, $sport['eligible']);
        $sheet->setCellValue('F' . $row, $sport['ineligible']);
        $row++;
    }

    // Auto-size columns
    foreach (range('A', 'F') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }
}

private function generateAttendanceExcel($sheet, $data, $headerStyle)
{
    $sheet->setTitle('Attendance');

    // Title
    $sheet->mergeCells('A1:F1');
    $sheet->setCellValue('A1', 'ATTENDANCE ANALYTICS REPORT');
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

    $sheet->setCellValue('A' . $row, 'Total Records');
    $sheet->setCellValue('B' . $row, 'Present');
    $sheet->setCellValue('C' . $row, 'Absent');
    $sheet->setCellValue('D' . $row, 'Excused');
    $sheet->setCellValue('E' . $row, 'Late');
    $sheet->setCellValue('F' . $row, 'Rate (%)');
    $sheet->getStyle('A' . $row . ':F' . $row)->applyFromArray($headerStyle);
    $row++;

    $sheet->setCellValue('A' . $row, $data['overall']['total_records']);
    $sheet->setCellValue('B' . $row, $data['overall']['present']);
    $sheet->setCellValue('C' . $row, $data['overall']['absent']);
    $sheet->setCellValue('D' . $row, $data['overall']['excused']);
    $sheet->setCellValue('E' . $row, $data['overall']['late']);
    $sheet->setCellValue('F' . $row, $data['overall']['attendance_rate']);
    $row += 2;

    // By Sport
    $sheet->setCellValue('A' . $row, 'ATTENDANCE BY SPORT');
    $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(14);
    $row++;

    $sheet->setCellValue('A' . $row, 'Sport');
    $sheet->setCellValue('B' . $row, 'Athletes');
    $sheet->setCellValue('C' . $row, 'Records');
    $sheet->setCellValue('D' . $row, 'Present');
    $sheet->setCellValue('E' . $row, 'Absent');
    $sheet->setCellValue('F' . $row, 'Rate (%)');
    $sheet->getStyle('A' . $row . ':F' . $row)->applyFromArray($headerStyle);
    $row++;

    foreach ($data['by_sport'] as $sport) {
        $sheet->setCellValue('A' . $row, $sport['sport']);
        $sheet->setCellValue('B' . $row, $sport['total_athletes']);
        $sheet->setCellValue('C' . $row, $sport['total_records']);
        $sheet->setCellValue('D' . $row, $sport['present']);
        $sheet->setCellValue('E' . $row, $sport['absent']);
        $sheet->setCellValue('F' . $row, $sport['attendance_rate']);
        $row++;
    }

    foreach (range('A', 'F') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }
}

private function generateEventParticipationExcel($sheet, $data, $headerStyle)
{
    $sheet->setTitle('Events');

    // Title
    $sheet->mergeCells('A1:F1');
    $sheet->setCellValue('A1', 'EVENT PARTICIPATION REPORT');
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

    $sheet->setCellValue('A' . $row, 'Total Events');
    $sheet->setCellValue('B' . $row, 'Upcoming');
    $sheet->setCellValue('C' . $row, 'Ongoing');
    $sheet->setCellValue('D' . $row, 'Completed');
    $sheet->setCellValue('E' . $row, 'Cancelled');
    $sheet->setCellValue('F' . $row, 'Participants');
    $sheet->getStyle('A' . $row . ':F' . $row)->applyFromArray($headerStyle);
    $row++;

    $sheet->setCellValue('A' . $row, $data['overall']['total_events']);
    $sheet->setCellValue('B' . $row, $data['overall']['upcoming']);
    $sheet->setCellValue('C' . $row, $data['overall']['ongoing']);
    $sheet->setCellValue('D' . $row, $data['overall']['completed']);
    $sheet->setCellValue('E' . $row, $data['overall']['cancelled']);
    $sheet->setCellValue('F' . $row, $data['overall']['unique_participants']);
    $row += 2;

    // Events List
    $sheet->setCellValue('A' . $row, 'EVENTS LIST');
    $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(14);
    $row++;

    $sheet->setCellValue('A' . $row, 'Event Name');
    $sheet->setCellValue('B' . $row, 'Sport');
    $sheet->setCellValue('C' . $row, 'Date');
    $sheet->setCellValue('D' . $row, 'Status');
    $sheet->setCellValue('E' . $row, 'Venue');
    $sheet->setCellValue('F' . $row, 'Participants');
    $sheet->getStyle('A' . $row . ':F' . $row)->applyFromArray($headerStyle);
    $row++;

    foreach ($data['events'] as $event) {
        $sheet->setCellValue('A' . $row, $event['event_name']);
        $sheet->setCellValue('B' . $row, $event['sport']);
        $sheet->setCellValue('C' . $row, $event['event_date']);
        $sheet->setCellValue('D' . $row, $event['status']);
        $sheet->setCellValue('E' . $row, $event['venue']);
        $sheet->setCellValue('F' . $row, $event['participant_count']);
        $row++;
    }

    // Auto-size columns
    foreach (range('A', 'F') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }
}
}
