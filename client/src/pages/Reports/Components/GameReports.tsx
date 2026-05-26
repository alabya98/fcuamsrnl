import { useState } from "react";
import type {
  GameReportData,
  GameResult,
} from "../../../interfaces/GameReportInterface";

interface GameReportsProps {
  data: GameReportData | null;
  loading: boolean;
}

const GameReports: React.FC<GameReportsProps> = ({ data, loading }) => {
  const [expandedGameId, setExpandedGameId] = useState<number | null>(null);

  const toggleGameExpand = (gameId: number) =>
    setExpandedGameId(expandedGameId === gameId ? null : gameId);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const getWinnerTeamName = (game: GameResult) => {
    if (game.winning_team === "home") return game.home_team;
    if (game.winning_team === "away") return game.away_team;
    return "Draw";
  };

  const getScoreDisplay = (game: GameResult) =>
    `${game.home_score} - ${game.away_score}`;

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-12 border-2 border-gray-100 dark:border-white/5 text-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 font-semibold">
          Loading game reports...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-12 border-2 border-gray-100 dark:border-white/5 text-center transition-colors duration-300">
        <div className="w-24 h-24 bg-gray-100 dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-12 h-12 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-semibold text-lg">
          No data available
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
          Apply filters and click "Generate Report" to view data
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-6 border-2 border-gray-100 dark:border-white/5 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Overall Game Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            {
              label: "Total Games",
              value: data.overall.total_games,
              bg: "bg-blue-50 dark:bg-blue-500/10",
              border: "border-blue-200 dark:border-blue-500/20",
              text: "text-blue-600 dark:text-blue-300",
            },
            {
              label: "Completed",
              value: data.overall.completed_games,
              bg: "bg-green-50 dark:bg-green-500/10",
              border: "border-green-200 dark:border-green-500/20",
              text: "text-green-600 dark:text-green-300",
            },
            {
              label: "Scheduled",
              value: data.overall.scheduled_games,
              bg: "bg-yellow-50 dark:bg-yellow-500/10",
              border: "border-yellow-200 dark:border-yellow-500/20",
              text: "text-yellow-600 dark:text-yellow-300",
            },
            {
              label: "Cancelled",
              value: data.overall.cancelled_games,
              bg: "bg-red-50 dark:bg-red-500/10",
              border: "border-red-200 dark:border-red-500/20",
              text: "text-red-600 dark:text-red-300",
            },
            {
              label: "Wins",
              value: data.overall.total_wins,
              bg: "bg-emerald-50 dark:bg-emerald-500/10",
              border: "border-emerald-200 dark:border-emerald-500/20",
              text: "text-emerald-600 dark:text-emerald-300",
            },
            {
              label: "Losses",
              value: data.overall.total_losses,
              bg: "bg-rose-50 dark:bg-rose-500/10",
              border: "border-rose-200 dark:border-rose-500/20",
              text: "text-rose-600 dark:text-rose-300",
            },
            {
              label: "Draws",
              value: data.overall.total_draws,
              bg: "bg-gray-50 dark:bg-white/5",
              border: "border-gray-200 dark:border-white/10",
              text: "text-gray-600 dark:text-gray-300",
            },
            {
              label: "Win Rate",
              value: `${data.overall.win_rate}%`,
              bg: "bg-purple-50 dark:bg-purple-500/10",
              border: "border-purple-200 dark:border-purple-500/20",
              text: "text-purple-600 dark:text-purple-300",
            },
          ].map(({ label, value, bg, border, text }) => (
            <div
              key={label}
              className={`p-4 ${bg} rounded-xl border-2 ${border}`}
            >
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {label}
              </p>
              <p className={`text-2xl font-bold ${text}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Games List */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-6 border-2 border-gray-100 dark:border-white/5 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Games List ({data.games.length})
        </h2>
        <div className="space-y-4">
          {data.games.map((game) => (
            <div
              key={game.game_id}
              className="border-2 border-gray-200 dark:border-white/10 rounded-xl overflow-hidden hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-200"
            >
              {/* Game Header */}
              <div
                onClick={() => toggleGameExpand(game.game_id)}
                className="p-4 bg-gradient-to-r from-blue-50 to-white dark:from-blue-500/10 dark:to-[#1e2433] cursor-pointer hover:from-blue-100 dark:hover:from-blue-500/15 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        {game.event_name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          game.game_status === "Completed"
                            ? "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300"
                            : game.game_status === "In Progress"
                              ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300"
                              : game.game_status === "Scheduled"
                                ? "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300"
                                : "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300"
                        }`}
                      >
                        {game.game_status}
                      </span>
                      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300">
                        {game.sport}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-semibold">Date:</span>{" "}
                        {formatDate(game.game_date)}
                      </div>
                      <div>
                        <span className="font-semibold">Venue:</span>{" "}
                        {game.venue}
                      </div>
                      <div>
                        <span className="font-semibold">Score:</span>{" "}
                        {getScoreDisplay(game)}
                      </div>
                      <div>
                        <span className="font-semibold">Winner:</span>{" "}
                        {getWinnerTeamName(game)}
                      </div>
                    </div>
                  </div>
                  <svg
                    className={`w-6 h-6 text-gray-400 transition-transform duration-200 ${expandedGameId === game.game_id ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Game Details (Expanded) */}
              {expandedGameId === game.game_id && (
                <div className="p-4 bg-gray-50 dark:bg-[#252b3b] border-t-2 border-gray-200 dark:border-white/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Teams */}
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white mb-3">
                        Teams
                      </h4>
                      <div className="space-y-2">
                        <div className="p-3 bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-white/10">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {game.home_team}
                            </span>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded text-xs font-semibold">
                              Home
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-700 dark:text-gray-200 mt-1">
                            {game.home_score}
                          </p>
                        </div>
                        <div className="p-3 bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-white/10">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800 dark:text-white">
                              {game.away_team}
                            </span>
                            <span className="px-2 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300 rounded text-xs font-semibold">
                              Away
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-gray-700 dark:text-gray-200 mt-1">
                            {game.away_score}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Winning Players */}
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white mb-3">
                        Winning Players ({game.winning_players.length})
                      </h4>
                      {game.winning_players.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {game.winning_players.map((player, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-white dark:bg-[#1a1f2e] rounded-lg border border-gray-200 dark:border-white/10 hover:shadow-md transition-all duration-200"
                            >
                              <p className="font-semibold text-gray-800 dark:text-white">
                                {player.athlete_name}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 rounded text-xs font-semibold">
                                  {player.position}
                                </span>
                                {player.points_scored !== undefined && (
                                  <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 rounded text-xs">
                                    {player.points_scored} pts
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No winning players recorded yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* By Sport */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-6 border-2 border-gray-100 dark:border-white/5 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Games by Sport
        </h2>
        <div className="space-y-4">
          {data.by_sport.map((sport, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-r from-gray-50 to-white dark:from-white/5 dark:to-[#1e2433] rounded-xl border-2 border-gray-200 dark:border-white/10"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  {sport.sport}
                </h3>
                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded-lg font-bold">
                  {sport.win_rate}% Win Rate
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Total Games
                  </p>
                  <p className="font-bold text-gray-800 dark:text-white">
                    {sport.total_games}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Wins</p>
                  <p className="font-bold text-green-600 dark:text-green-400">
                    {sport.wins}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Losses</p>
                  <p className="font-bold text-red-600 dark:text-red-400">
                    {sport.losses}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Draws</p>
                  <p className="font-bold text-gray-600 dark:text-gray-400">
                    {sport.draws}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Win Rate</p>
                  <p className="font-bold text-purple-600 dark:text-purple-400">
                    {sport.win_rate}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By Venue */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-6 border-2 border-gray-100 dark:border-white/5 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Games by Venue
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.by_venue.map((venue, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-br from-purple-50 to-white dark:from-purple-500/10 dark:to-[#1e2433] rounded-xl border-2 border-purple-200 dark:border-purple-500/20"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {venue.venue}
              </p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-300">
                {venue.games_count}
              </p>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="text-green-600 dark:text-green-400 font-semibold">
                  W: {venue.wins}
                </span>
                <span className="text-red-600 dark:text-red-400 font-semibold">
                  L: {venue.losses}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-6 border-2 border-gray-100 dark:border-white/5 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Monthly Game Trends
        </h2>
        <div className="space-y-3">
          {data.by_month.map((month, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-r from-blue-50 to-white dark:from-blue-500/10 dark:to-[#1e2433] rounded-xl border-2 border-blue-200 dark:border-blue-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  {month.month_name}
                </h3>
                <span className="px-4 py-2 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded-lg font-bold">
                  {month.total_games} Games
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Wins</p>
                  <p className="font-bold text-green-600 dark:text-green-400">
                    {month.wins}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Losses</p>
                  <p className="font-bold text-red-600 dark:text-red-400">
                    {month.losses}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Draws</p>
                  <p className="font-bold text-gray-600 dark:text-gray-400">
                    {month.draws}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl shadow-lg dark:shadow-black/30 p-6 border-2 border-gray-100 dark:border-white/5 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
          Top Performers
        </h2>
        <div className="space-y-3">
          {data.top_performers.map((performer, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-500/10 dark:to-[#1e2433] rounded-xl border-2 border-yellow-200 dark:border-yellow-500/20 hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-800 dark:text-white">
                    {performer.athlete_name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {performer.sport}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-300">
                  {performer.wins}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {performer.win_rate}% win rate
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameReports;
