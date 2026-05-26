<?php
// server/app/Http/Controllers/Api/GameReportController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Record;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class GameReportController extends Controller
{
    /**
     * Get Game Reports with wins, losses, and player details
     */
    public function getGameReport(Request $request)
    {
        try {
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');
            $sport = $request->query('sport');
            $venue = $request->query('venue');
            $team = $request->query('team');

            // Query events that are games
            $eventsQuery = Event::where('is_deleted', 0);

            if ($startDate && $endDate) {
                $eventsQuery->whereBetween('event_date', [$startDate, $endDate]);
            }

            if ($sport && $sport !== 'all' && $sport !== '') {
                $eventsQuery->where('sport', $sport);
            }

            if ($venue) {
                $eventsQuery->where('venue', 'LIKE', '%' . $venue . '%');
            }

            $events = $eventsQuery->orderBy('event_date', 'desc')->get();

            // Initialize counters
            $games = [];
            $totalWins = 0;
            $totalLosses = 0;
            $totalDraws = 0;

            foreach ($events as $event) {
                // Get records for this event by matching event_name
                $eventRecords = Record::where('is_deleted', 0)
                    ->where('event_name', $event->event_name)
                    ->where('sport', $event->sport)
                    ->get();

                // Skip events without records
                if ($eventRecords->isEmpty()) {
                    continue;
                }

                // Initialize players arrays
                $winningPlayers = [];
                $losingPlayers = [];
                $allPlayers = [];

                // Extract team names from event description or use defaults
                $homeTeam = 'Home Team';
                $awayTeam = 'Away Team';

                if ($event->description && stripos($event->description, ' vs ') !== false) {
                    $teams = explode(' vs ', $event->description);
                    if (count($teams) >= 2) {
                        $homeTeam = trim($teams[0]);
                        $awayTeam = trim($teams[1]);
                    }
                } elseif ($event->description && stripos($event->description, 'vs.') !== false) {
                    $teams = explode('vs.', $event->description);
                    if (count($teams) >= 2) {
                        $homeTeam = trim($teams[0]);
                        $awayTeam = trim($teams[1]);
                    }
                }

                // Process records to extract player information
                foreach ($eventRecords as $record) {
                    $player = [
                        'athlete_id' => $record->athlete_id ?? 0,
                        'athlete_name' => $record->athlete_name ?? 'Unknown',
                        'team' => 'home',
                        'position' => $record->category ?? 'Player',
                        'points_scored' => $record->points_score ?? null,
                        'achievements' => $record->achievement ?? '',
                    ];

                    $allPlayers[] = $player;

                    // Determine if winner based on achievement
                    $achievement = strtolower($record->achievement ?? '');
                    if (stripos($achievement, 'winner') !== false ||
                        stripos($achievement, 'champion') !== false ||
                        stripos($achievement, '1st') !== false ||
                        stripos($achievement, 'gold') !== false ||
                        stripos($achievement, 'first') !== false) {
                        $winningPlayers[] = $player;
                    } else {
                        $losingPlayers[] = $player;
                    }
                }

                // Determine game outcome
                $homeScore = 0;
                $awayScore = 0;
                $winningTeam = 'draw';

                if (count($winningPlayers) > 0) {
                    $totalWins++;
                    $winningTeam = 'home';
                    $homeScore = 1;
                    $awayScore = 0;
                } elseif (count($losingPlayers) > 0 && count($winningPlayers) === 0) {
                    $totalLosses++;
                    $winningTeam = 'away';
                    $homeScore = 0;
                    $awayScore = 1;
                } else {
                    $totalDraws++;
                    $homeScore = 0;
                    $awayScore = 0;
                }

                // Filter by team if specified
                if ($team &&
                    stripos($homeTeam, $team) === false &&
                    stripos($awayTeam, $team) === false) {
                    continue;
                }

                $games[] = [
                    'game_id' => $event->event_id,
                    'event_id' => $event->event_id,
                    'event_name' => $event->event_name,
                    'sport' => $event->sport,
                    'game_date' => Carbon::parse($event->event_date)->format('Y-m-d'),
                    'venue' => $event->venue,
                    'home_team' => $homeTeam,
                    'away_team' => $awayTeam,
                    'home_score' => $homeScore,
                    'away_score' => $awayScore,
                    'winning_team' => $winningTeam,
                    'game_status' => $this->determineGameStatus($event),
                    'game_type' => $event->event_type,
                    'winning_players' => $winningPlayers,
                    'losing_players' => $losingPlayers,
                    'all_players' => $allPlayers,
                ];
            }

            $totalGames = count($games);
            $completedGames = collect($games)->where('game_status', 'Completed')->count();
            $scheduledGames = collect($games)->where('game_status', 'Scheduled')->count();
            $cancelledGames = collect($games)->where('game_status', 'Cancelled')->count();

            // By Sport
            $bySport = collect($games)->groupBy('sport')->map(function ($sportGames, $sport) {
                $wins = collect($sportGames)->where('winning_team', 'home')->count();
                $losses = collect($sportGames)->where('winning_team', 'away')->count();
                $draws = collect($sportGames)->where('winning_team', 'draw')->count();
                $total = count($sportGames);

                return [
                    'sport' => $sport,
                    'total_games' => $total,
                    'wins' => $wins,
                    'losses' => $losses,
                    'draws' => $draws,
                    'win_rate' => $total > 0 ? round(($wins / $total) * 100, 2) : 0,
                ];
            })->values();

            // By Venue
            $byVenue = collect($games)->groupBy('venue')->map(function ($venueGames, $venue) {
                $wins = collect($venueGames)->where('winning_team', 'home')->count();
                $losses = collect($venueGames)->where('winning_team', 'away')->count();

                return [
                    'venue' => $venue,
                    'games_count' => count($venueGames),
                    'wins' => $wins,
                    'losses' => $losses,
                ];
            })->values();

            // By Month
            $byMonth = collect($games)->groupBy(function ($game) {
                return Carbon::parse($game['game_date'])->format('Y-m');
            })->map(function ($monthGames, $month) {
                $wins = collect($monthGames)->where('winning_team', 'home')->count();
                $losses = collect($monthGames)->where('winning_team', 'away')->count();
                $draws = collect($monthGames)->where('winning_team', 'draw')->count();

                return [
                    'month' => $month,
                    'month_name' => Carbon::parse($month . '-01')->format('F Y'),
                    'total_games' => count($monthGames),
                    'wins' => $wins,
                    'losses' => $losses,
                    'draws' => $draws,
                ];
            })->values();

            // Top Performers
            $athleteStats = [];
            foreach ($games as $game) {
                foreach ($game['winning_players'] as $player) {
                    $name = $player['athlete_name'];
                    if (!isset($athleteStats[$name])) {
                        $athleteStats[$name] = [
                            'athlete_name' => $name,
                            'sport' => $game['sport'],
                            'total_games' => 0,
                            'wins' => 0,
                        ];
                    }
                    $athleteStats[$name]['total_games']++;
                    $athleteStats[$name]['wins']++;
                }
            }

            $topPerformers = collect($athleteStats)->map(function ($stats) {
                $stats['win_rate'] = $stats['total_games'] > 0
                    ? round(($stats['wins'] / $stats['total_games']) * 100, 2)
                    : 0;
                return $stats;
            })->sortByDesc('wins')->take(10)->values();

            $winRate = $totalGames > 0 ? round(($totalWins / $totalGames) * 100, 2) : 0;

            return response()->json([
                'overall' => [
                    'total_games' => $totalGames,
                    'completed_games' => $completedGames,
                    'scheduled_games' => $scheduledGames,
                    'cancelled_games' => $cancelledGames,
                    'total_wins' => $totalWins,
                    'total_losses' => $totalLosses,
                    'total_draws' => $totalDraws,
                    'win_rate' => $winRate,
                ],
                'games' => $games,
                'by_sport' => $bySport,
                'by_venue' => $byVenue,
                'by_month' => $byMonth,
                'top_performers' => $topPerformers,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Game Report Error:', [
                'message' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to generate game report',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => basename($e->getFile())
            ], 500);
        }
    }

    /**
     * Determine game status based on event
     */
    private function determineGameStatus($event)
    {
        if ($event->status === 'Cancelled') {
            return 'Cancelled';
        }

        try {
            $eventDate = Carbon::parse($event->event_date);
            $today = Carbon::today();

            if ($eventDate->isPast()) {
                return 'Completed';
            } elseif ($eventDate->isToday()) {
                return 'In Progress';
            } else {
                return 'Scheduled';
            }
        } catch (\Exception $e) {
            return 'Scheduled';
        }
    }

    /**
     * Export Game Report to Excel
     */
    public function exportGameReportExcel(Request $request)
    {
        try {
            $response = $this->getGameReport($request);
            $responseData = $response->getData();

            if ($response->getStatusCode() !== 200) {
                return $response;
            }

            $data = json_decode(json_encode($responseData), true);

            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Game Report');

            $headerStyle = [
                'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '396B99']
                ],
                'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER]
            ];

            $this->generateGameReportExcel($sheet, $data, $headerStyle);

            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
            $filename = 'game-report-' . date('Y-m-d') . '.xlsx';
            $temp_file = tempnam(sys_get_temp_dir(), $filename);
            $writer->save($temp_file);

            return response()->download($temp_file, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ])->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            Log::error('Game Report Excel Export Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to export game report Excel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate Excel for Game Report
     */
    private function generateGameReportExcel($sheet, $data, $headerStyle)
    {
        $sheet->mergeCells('A1:F1');
        $sheet->setCellValue('A1', 'GAME REPORT');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

        $sheet->mergeCells('A2:F2');
        $sheet->setCellValue('A2', 'Generated on ' . date('F d, Y'));
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

        $row = 4;

        $sheet->setCellValue('A' . $row, 'OVERALL STATISTICS');
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(14);
        $row++;

        $sheet->setCellValue('A' . $row, 'Total Games');
        $sheet->setCellValue('B' . $row, 'Completed');
        $sheet->setCellValue('C' . $row, 'Wins');
        $sheet->setCellValue('D' . $row, 'Losses');
        $sheet->setCellValue('E' . $row, 'Draws');
        $sheet->setCellValue('F' . $row, 'Win Rate (%)');
        $sheet->getStyle('A' . $row . ':F' . $row)->applyFromArray($headerStyle);
        $row++;

        $sheet->setCellValue('A' . $row, $data['overall']['total_games']);
        $sheet->setCellValue('B' . $row, $data['overall']['completed_games']);
        $sheet->setCellValue('C' . $row, $data['overall']['total_wins']);
        $sheet->setCellValue('D' . $row, $data['overall']['total_losses']);
        $sheet->setCellValue('E' . $row, $data['overall']['total_draws']);
        $sheet->setCellValue('F' . $row, $data['overall']['win_rate']);
        $row += 2;

        $sheet->setCellValue('A' . $row, 'GAMES LIST');
        $sheet->getStyle('A' . $row)->getFont()->setBold(true)->setSize(14);
        $row++;

        $sheet->setCellValue('A' . $row, 'Event Name');
        $sheet->setCellValue('B' . $row, 'Sport');
        $sheet->setCellValue('C' . $row, 'Date');
        $sheet->setCellValue('D' . $row, 'Venue');
        $sheet->setCellValue('E' . $row, 'Score');
        $sheet->setCellValue('F' . $row, 'Winner');
        $sheet->getStyle('A' . $row . ':F' . $row)->applyFromArray($headerStyle);
        $row++;

        foreach ($data['games'] as $game) {
            $winner = $game['winning_team'] === 'home' ? $game['home_team'] :
                     ($game['winning_team'] === 'away' ? $game['away_team'] : 'Draw');

            $sheet->setCellValue('A' . $row, $game['event_name']);
            $sheet->setCellValue('B' . $row, $game['sport']);
            $sheet->setCellValue('C' . $row, $game['game_date']);
            $sheet->setCellValue('D' . $row, $game['venue']);
            $sheet->setCellValue('E' . $row, $game['home_score'] . ' - ' . $game['away_score']);
            $sheet->setCellValue('F' . $row, $winner);
            $row++;
        }

        foreach (range('A', 'F') as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }
}
