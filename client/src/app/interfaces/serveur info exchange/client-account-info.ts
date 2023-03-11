import { ProgressInfo } from '@app/interfaces/progress-info';
import { Badge } from './badge';
import { GameHeader } from './game-header';
import { UserSettings } from './user-settings';

export interface ClientAccountInfo {
    username: string;
    email: string;
    userSettings: UserSettings;
    highscores: Record<string, number>;
    progressInfo: ProgressInfo;
    badges: Badge[];
    avatarUrl: string;
    bestGames: GameHeader[];
    gamesPlayed: GameHeader[];
    gamesWon: number;
}
