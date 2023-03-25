export interface Game {
    startDatetime: string;
    period: string;
    botIDS: string[];
    results: { playerID: string; score: number; unfairQuit: boolean }[];
    gameType: string;
    surrender: string;
}
