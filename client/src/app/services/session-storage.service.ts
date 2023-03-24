import { Injectable } from '@angular/core';
import { PlayerData } from '@app/interfaces/player-data';
@Injectable({
    providedIn: 'root',
})
export class SessionStorageService {
    setItem(key: string, data: string) {
        sessionStorage.setItem(key, data);
    }

    getPlayerData(key: string): PlayerData {
        const item = sessionStorage.getItem(key);
        if (!item) {
            return { socketId: '', roomName: '' };
        }
        return JSON.parse(item as string);
    }

    removeItem(key: string) {
        sessionStorage.removeItem(key);
    }

    clear() {
        sessionStorage.clear();
    }
}
