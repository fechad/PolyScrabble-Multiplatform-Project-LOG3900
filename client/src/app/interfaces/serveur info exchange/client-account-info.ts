import { ProgressInfo } from '@app/interfaces/progress-info';
import { Badge } from './badge';
import { GameHeader } from './game-header';
import { UserSettings } from './user-settings';

export interface ClientAccountInfo {
    username: string;
    email: string;
    userSettings: UserSettings;
    highScores: Record<string, number>;
    progressInfo: ProgressInfo;
    badges: Badge[];
    bestGames: GameHeader[];
    gamesPlayed: GameHeader[];
    gamesWon: number;
}
