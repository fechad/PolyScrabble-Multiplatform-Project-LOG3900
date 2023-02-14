export interface Game {
    startDatetime: string;
    period: string;
    botIDS: string[];
    results: { playerID: string; score: number }[];
    gameType: string;
    surrender: string;
}
