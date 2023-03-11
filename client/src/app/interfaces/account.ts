import { GamePlayed } from './games-played';
import { Level } from './level';
import { Badge } from './serveur info exchange/badge';

export interface Account {
    username: string;
    email: string;
    avatarUrl: string;
    level: Level;
    badges: Badge[];
    highScore: number;
    gamesWon: number;
    totalXp: number;
    gamesPlayed: GamePlayed[];
    bestGames: GamePlayed[];
}
