import { UserSettings } from '@app/interfaces/serveur info exchange/user-settings';
import { DEFAULT_IMG_URL } from '@app/pages/settings-page/settings-page.component';

export const DEFAULT_USER_SETTINGS: UserSettings = {
    defaultLanguage: 'french',
    defaultTheme: 'light',
    victoryMusic: 'WeAreTheChamps.mp3',
    avatarUrl: DEFAULT_IMG_URL,
};
