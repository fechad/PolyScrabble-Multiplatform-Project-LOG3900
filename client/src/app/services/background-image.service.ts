import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class BackgroundService {
    currentVP: string;
    currentBackground: string;
    backgroundList;

    constructor() {
        this.currentVP = '';
        this.currentBackground = '';
        this.backgroundList = {
            santa: ['assets/images/theme-backgrounds/santa-happy.png', 'assets/images/theme-backgrounds/santa-angry.jpg'],
            einstein: ['assets/images/theme-backgrounds/einstein-happy.jpg', 'assets/images/theme-backgrounds/einstein-angry.jpg'],
            mozart: ['assets/images/theme-backgrounds/mozart-happy.jpg', 'assets/images/theme-backgrounds/mozart-angry.jpg'],
            serena: ['assets/images/theme-backgrounds/serena-happy.jpg', 'assets/images/theme-backgrounds/serena-angry.jpg'],
            trump: ['assets/images/theme-backgrounds/trump-happy.jpg', 'assets/images/theme-backgrounds/trump-angry.webp'],
        };
    }

    setProperty() {
        document.documentElement.style.removeProperty('--theme-background');
        document.documentElement.style.setProperty('--theme-background', `url(${this.currentBackground})`);
    }

    setBackground(bot: string) {
        this.currentVP = bot;
        switch (bot) {
            case 'santa':
                this.currentBackground = this.backgroundList.santa[0];
                break;
            case 'einstein':
                this.currentBackground = this.backgroundList.einstein[0];
                break;
            case 'mozart':
                this.currentBackground = this.backgroundList.mozart[0];
                break;
            case 'serena':
                this.currentBackground = this.backgroundList.serena[0];
                break;
            case 'trump':
                this.currentBackground = this.backgroundList.trump[0];
                break;
            default:
                this.currentBackground = '';
        }
        this.setProperty();
    }

    switchToAngry() {
        switch (this.currentVP) {
            case 'santa':
                this.currentBackground =
                    this.currentBackground === this.backgroundList.santa[0] ? this.backgroundList.santa[1] : this.backgroundList.santa[0];
                break;
            case 'einstein':
                this.currentBackground =
                    this.currentBackground === this.backgroundList.einstein[0] ? this.backgroundList.einstein[1] : this.backgroundList.einstein[0];
                break;
            case 'mozart':
                this.currentBackground =
                    this.currentBackground === this.backgroundList.mozart[0] ? this.backgroundList.mozart[1] : this.backgroundList.mozart[0];
                break;
            case 'serena':
                this.currentBackground =
                    this.currentBackground === this.backgroundList.serena[0] ? this.backgroundList.serena[1] : this.backgroundList.serena[0];
                break;
            case 'trump':
                this.currentBackground =
                    this.currentBackground === this.backgroundList.trump[0] ? this.backgroundList.trump[1] : this.backgroundList.trump[0];
                break;
        }
        this.setProperty();
    }
}
