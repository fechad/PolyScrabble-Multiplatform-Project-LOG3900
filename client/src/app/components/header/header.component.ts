import { Component } from '@angular/core';
import { LanguageService } from '@app/services/language.service';
import { ThemeService } from '@app/services/theme.service';

@Component({
    selector: 'app-hearder',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    constructor(protected themeService: ThemeService, protected languageService: LanguageService) {}
}
