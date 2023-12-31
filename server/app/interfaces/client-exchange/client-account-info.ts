import { Badge } from '@app/interfaces/firestoreDB/badge';
import { GameHeader } from '@app/interfaces/firestoreDB/game-header';
import { UserSettings } from '@app/interfaces/firestoreDB/user-settings';
import { ProgressInfo } from '@app/interfaces/progress-info';

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
