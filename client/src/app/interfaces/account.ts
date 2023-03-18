import { Badge } from './serveur info exchange/badge';
import { GameHeader } from './serveur info exchange/game-header';
import { UserSettings } from './serveur info exchange/user-settings';

export interface Account {
    username: string;
    email: string;
    userSettings: UserSettings;
    totalXP: number;
    badges: Badge[];
    bestGames: GameHeader[];
    gamesPlayed: GameHeader[];
    gamesWon: number;
}
