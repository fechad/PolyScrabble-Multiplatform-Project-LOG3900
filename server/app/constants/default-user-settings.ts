import { ClientAccountInfo } from '@app/interfaces/client-exchange/client-account-info';
import { UserSettings } from '@app/interfaces/firestoreDB/user-settings';

export const DEFAULT_BOT_IMAGE = 'https://cdn0.iconfinder.com/data/icons/robot-avatar/512/Robot_Avatars_25-256.png';
export const DEFAULT_USER_IMAGE = 'https://res.cloudinary.com/dejrgre8q/image/upload/v1678661515/EinsteinAvatar_n2h25k.png';

export const DEFAULT_USER_SETTINGS: UserSettings = {
    defaultLanguage: 'french',
    defaultTheme: 'light',
    victoryMusic: 'WeAreTheChamps.mp3',
    avatarUrl: DEFAULT_USER_IMAGE,
};

export const DEFAULT_BOT_SETTINGS: UserSettings = {
    defaultLanguage: 'french',
    defaultTheme: 'light',
    victoryMusic: 'WeAreTheChamps.mp3',
    avatarUrl: DEFAULT_BOT_IMAGE,
};

export const DEFAULT_ACCOUNT: ClientAccountInfo = {
    username: 'anna',
    email: 'anna@polyscrabble.ca',
    userSettings: { ...DEFAULT_USER_SETTINGS },
    highScores: {},
    progressInfo: { totalXP: 0, currentLevel: 0, xpForNextLevel: 200, currentLevelXp: 0, victoriesCount: 0 },
    badges: [],
    gamesWon: 0,
    gamesPlayed: [],
    bestGames: [],
};

export const DEFAULT_BOT_ACCOUNT: ClientAccountInfo = {
    username: 'BOT',
    email: '',
    userSettings: { ...DEFAULT_BOT_SETTINGS },
    highScores: {},
    progressInfo: { totalXP: 9999, currentLevel: 999, currentLevelXp: 999, xpForNextLevel: 1000, victoriesCount: 69 },
    badges: [],
    bestGames: [],
    gamesPlayed: [],
    gamesWon: 69,
};
