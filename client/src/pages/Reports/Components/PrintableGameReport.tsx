// client/src/pages/Reports/Components/PrintableGameReport.tsx

import { forwardRef } from "react";
import type { GameReportData } from "../../../interfaces/GameReportInterface";
import filamerLogo from "../../../assets/filamerlogo.png";

interface PrintableGameReportProps {
  data: GameReportData;
  filters?: {
    sport?: string;
    start_date?: string;
    end_date?: string;
    venue?: string;
    team?: string;
  };
}

const PrintableGameReport = forwardRef<HTMLDivElement, PrintableGameReportProps>(
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
              Game Report
            </h2>
            {filters?.sport && (
              <p className="text-sm text-gray-600 mt-1">Sport: {filters.sport}</p>
            )}
            {filters?.start_date && filters?.end_date && (
              <p className="text-sm text-gray-600 mt-1">
                Period: {formatDate(filters.start_date)} -{" "}
                {formatDate(filters.end_date)}
              </p>
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
            Overall Game Statistics
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 border-2 border-blue-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Total Games</p>
              <p className="text-2xl font-bold text-blue-600">
                {data.overall.total_games}
              </p>
            </div>
            <div className="p-3 border-2 border-green-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Wins</p>
              <p className="text-2xl font-bold text-green-600">
                {data.overall.total_wins}
              </p>
            </div>
            <div className="p-3 border-2 border-red-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Losses</p>
              <p className="text-2xl font-bold text-red-600">
                {data.overall.total_losses}
              </p>
            </div>
            <div className="p-3 border-2 border-purple-200 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Win Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {data.overall.win_rate}%
              </p>
            </div>
          </div>
        </div>

        {/* Games List */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Games List
          </h3>
          <div className="space-y-3">
            {data.games.map((game, index) => (
              <div key={index} className="p-3 border-2 border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-base font-bold text-gray-800">
                    {game.event_name}
                  </h4>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-bold">
                    {game.sport}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-bold text-gray-800">
                      {formatDate(game.game_date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Venue</p>
                    <p className="font-bold text-gray-800">{game.venue}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Score</p>
                    <p className="font-bold text-gray-800">
                      {game.home_score} - {game.away_score}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Winner</p>
                    <p className="font-bold text-green-600">
                      {game.winning_team === 'home' ? game.home_team : 
                       game.winning_team === 'away' ? game.away_team : 'Draw'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Sport */}
        <div className="mb-8 page-break">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Games by Sport
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {data.by_sport.map((sport, index) => (
              <div key={index} className="p-3 border-2 border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{sport.sport}</p>
                <p className="text-2xl font-bold text-purple-600">
                  {sport.total_games}
                </p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="text-green-600 font-semibold">
                    W: {sport.wins}
                  </span>
                  <span className="text-red-600 font-semibold">
                    L: {sport.losses}
                  </span>
                  <span className="text-gray-600 font-semibold">
                    D: {sport.draws}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b-2 border-gray-300 pb-2">
            Top Performers
          </h3>
          <div className="space-y-2">
            {data.top_performers.map((performer, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">
                      {performer.athlete_name}
                    </p>
                    <p className="text-sm text-gray-600">{performer.sport}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-600">
                    {performer.wins}
                  </p>
                  <p className="text-xs text-gray-500">
                    {performer.win_rate}% win rate
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

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

PrintableGameReport.displayName = "PrintableGameReport";

export default PrintableGameReport;