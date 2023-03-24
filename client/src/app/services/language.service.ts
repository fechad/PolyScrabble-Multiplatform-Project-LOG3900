import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PlayerService } from './player.service';

@Injectable({
    providedIn: 'root',
})
export class LanguageService {
    param = { victories: 'victoires' };
    currentLanguage: string;

    constructor(private translate: TranslateService, private playerService: PlayerService) {
        this.verifyLanguage();
        // this language will be used as a fallback when a translation isn't found in the current language
        this.translate.setDefaultLang('fr');

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        this.translate.use(this.currentLanguage);
    }
    verifyLanguage() {
        this.currentLanguage = this.playerService.account.userSettings.defaultLanguage === 'french' ? 'fr' : 'en';
        this.translate.use(this.currentLanguage);
    }

    switchLanguage() {
        this.currentLanguage = this.currentLanguage === 'fr' ? 'en' : 'fr';
        this.translate.use(this.currentLanguage);
    }
}
