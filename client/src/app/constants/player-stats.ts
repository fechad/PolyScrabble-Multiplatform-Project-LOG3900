export interface Log {
    time: string;
    message: string;
}
export interface PlayerGameSummary {
    won: boolean;
    score: number;
    startDateTime: string;
    duration: string;
}
export interface PlayerGameStats {
    playedGamesCount: number;
    gamesWonCount: number;
    averagePointsByGame: number;
    averageGameDuration: string;
    playedGames: PlayerGameSummary[];
    logs: Log[];
}
