import { GameHeader } from './game-header';

export interface Account {
    username: string;
    email: string;
    defaultLanguage: string;
    defaultTheme: string;
    highscore: number;
    totalXP: number;
    badges: string[];
    avatarUrl: string;
    bestGames: GameHeader[];
    gamesPlayed: GameHeader[];
    gamesWon: number;
}
