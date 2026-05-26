// client/src/interfaces/GameReportInterface.ts

export interface GameReportFilters {
  start_date?: string;
  end_date?: string;
  sport?: string;
  venue?: string;
  team?: string;
}

export interface GameResult {
  game_id: number;
  event_id: number;
  event_name: string;
  sport: string;
  game_date: string;
  venue: string;
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  winning_team: 'home' | 'away' | 'draw';
  game_status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  game_type: string;
  winning_players: GamePlayer[];
  losing_players: GamePlayer[];
  all_players: GamePlayer[];
}

export interface GamePlayer {
  athlete_id: number;
  athlete_name: string;
  team: 'home' | 'away';
  position: string;
  points_scored?: number;
  achievements?: string;
}

export interface GameReportData {
  overall: {
    total_games: number;
    completed_games: number;
    scheduled_games: number;
    cancelled_games: number;
    total_wins: number;
    total_losses: number;
    total_draws: number;
    win_rate: number;
  };
  by_sport: {
    sport: string;
    total_games: number;
    wins: number;
    losses: number;
    draws: number;
    win_rate: number;
  }[];
  by_venue: {
    venue: string;
    games_count: number;
    wins: number;
    losses: number;
  }[];
  by_month: {
    month: string;
    month_name: string;
    total_games: number;
    wins: number;
    losses: number;
    draws: number;
  }[];
  games: GameResult[];
  top_performers: {
    athlete_name: string;
    sport: string;
    total_games: number;
    wins: number;
    win_rate: number;
  }[];
}