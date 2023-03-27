import { Injectable } from '@angular/core';
import { PlayerService } from './player.service';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    currentTheme: string;
    darkThemeSelected: boolean;

    constructor(private playerService: PlayerService) {
        this.currentTheme = this.playerService.account.userSettings.defaultTheme + '-theme';
        this.darkThemeSelected = this.currentTheme === 'dark-theme' ? true : false;
        this.setTheme();
    }
    removeCSSProperties() {
        document.documentElement.style.removeProperty('--accent');
        document.documentElement.style.removeProperty('--accent-hover');
        document.documentElement.style.removeProperty('--accent-active');
        document.documentElement.style.removeProperty('--accent-white');
        document.documentElement.style.removeProperty('--accent-disabled');
        document.documentElement.style.removeProperty('--accent-disabled-font');
        document.documentElement.style.removeProperty('--chat-button-hover');

        document.documentElement.style.removeProperty('--basic-font-color');
        document.documentElement.style.removeProperty('--nav-bar-background');
        document.documentElement.style.removeProperty('--nav-bar-icon-background');
        document.documentElement.style.removeProperty('--section-background');
        document.documentElement.style.removeProperty('--modal-background');
        document.documentElement.style.removeProperty('--app-background');

        // Board Tiles:
        document.documentElement.style.removeProperty('--their-chat-bubble-background');
        document.documentElement.style.removeProperty('--basic-board-tile-color');
        document.documentElement.style.removeProperty('--letter-2-tile-color');
        document.documentElement.style.removeProperty('--letter-3-tile-color');
        document.documentElement.style.removeProperty('--word-2-tile-color');
        document.documentElement.style.removeProperty('--word-3-tile-color');
    }

    buildLightTheme() {
        this.removeCSSProperties();
        // Buttons:
        document.documentElement.style.setProperty('--accent', '#7DAF6B');
        document.documentElement.style.setProperty('--accent-hover', '#608b50');
        document.documentElement.style.setProperty('--accent-active', '#6e9d5d');
        document.documentElement.style.setProperty('--accent-white', '#F9FFF6');
        document.documentElement.style.setProperty('--accent-disabled', 'rgba(125, 175, 107, 0.5)');
        document.documentElement.style.setProperty('--accent-disabled-font', 'white');
        document.documentElement.style.setProperty('--chat-button-hover', 'rgba(0, 0, 0, 0.05)');

        // Font:
        document.documentElement.style.setProperty('--basic-font-color', 'black');

        // Background:
        document.documentElement.style.setProperty('--their-chat-bubble-background', '#e6e6e6');
        document.documentElement.style.setProperty('--nav-bar-background', '#4b6940');
        document.documentElement.style.setProperty('--nav-bar-icon-background', '#FFFFFF');
        document.documentElement.style.setProperty('--section-background', 'white');
        document.documentElement.style.setProperty('--modal-background', '#FFFFFF');
        document.documentElement.style.setProperty('--app-background', 'white');

        // Board tiles:
        document.documentElement.style.setProperty('--basic-board-tile-font-color', '#666666');
        document.documentElement.style.setProperty('--basic-board-tile-color', '#ffebce');
        document.documentElement.style.setProperty('--letter-2-tile-color', '#bbbeca');
        document.documentElement.style.setProperty('--letter-3-tile-color', '#a8bbff');
        document.documentElement.style.setProperty('--word-2-tile-color', '#ffc7c7');
        document.documentElement.style.setProperty('--word-3-tile-color', '#e8a1a1');
    }

    buildDarkTheme() {
        this.removeCSSProperties();
        // Buttons:
        document.documentElement.style.setProperty('--accent', '#7865DC');
        document.documentElement.style.setProperty('--accent-hover', '#5848AF');
        document.documentElement.style.setProperty('--accent-active', '#7D6CD4');
        document.documentElement.style.setProperty('--accent-white', '#F4F2FF');
        document.documentElement.style.setProperty('--accent-disabled', '#403675');
        document.documentElement.style.setProperty('--accent-disabled-font', '#8C8E8B');
        document.documentElement.style.setProperty('--chat-button-hover', '#353534');

        // Font:
        document.documentElement.style.setProperty('--basic-font-color', 'white');

        // Background:
        document.documentElement.style.setProperty('--their-chat-bubble-background', '#575957');
        document.documentElement.style.setProperty('--nav-bar-background', '#5749A1');
        document.documentElement.style.setProperty('--nav-bar-icon-background', '#EEEEEE');
        document.documentElement.style.setProperty('--section-background', '#353534');
        document.documentElement.style.setProperty('--modal-background', '#575957');
        document.documentElement.style.setProperty('--app-background', '#303030');

        // Board tiles:
        document.documentElement.style.setProperty('--basic-board-tile-font-color', '#000000');
        document.documentElement.style.setProperty('--basic-board-tile-color', '#404040');
        document.documentElement.style.setProperty('--letter-2-tile-color', '#bdc0ff');
        document.documentElement.style.setProperty('--letter-3-tile-color', '#6f8aed');
        document.documentElement.style.setProperty('--word-2-tile-color', '#ff8383');
        document.documentElement.style.setProperty('--word-3-tile-color', '#ff6464');
    }

    createCSSVariables() {
        if (this.darkThemeSelected) {
            this.buildDarkTheme();
        } else this.buildLightTheme();
    }

    setTheme() {
        this.createCSSVariables();

        const body = document.getElementsByTagName('body')[0];
        body.classList.add(this.currentTheme);
    }

    switchTheme() {
        const body = document.getElementsByTagName('body')[0];
        body.classList.remove(this.currentTheme);
        this.currentTheme = this.currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme';
        this.darkThemeSelected = !this.darkThemeSelected;
        this.createCSSVariables();

        body.classList.add(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }

    verifyTheme() {
        this.currentTheme = this.playerService.account.userSettings.defaultTheme + '-theme';
        this.darkThemeSelected = this.currentTheme === 'dark-theme' ? true : false;
        this.setTheme();
    }
}
