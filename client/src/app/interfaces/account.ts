import { Badge } from './badge';
import { GamePlayed } from './games-played';
import { Level } from './level';

export interface Account {
    username: string;
    email: string;
    avatarURL: string;
    level: Level;
    badges: Badge[];
    highScore: number;
    gamesWon: number;
    totalXp: number;
    gamesPlayed: GamePlayed[];
    bestGames: GamePlayed[];
}
