import { Badge } from './badge';
import { GameHeader } from './game-header';
import { UserSettings } from './user-settings';

export interface Account {
    username: string;
    email: string;
    userSettings: UserSettings;
    totalXP: number;
    highScores: Record<string, number>;
    badges: Badge[];
    bestGames: GameHeader[];
    gamesPlayed: GameHeader[];
    gamesWon: number;
}
