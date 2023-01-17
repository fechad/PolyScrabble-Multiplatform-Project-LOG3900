import { Injectable } from '@angular/core';
import { GameData } from '@app/classes/game-data';

@Injectable({
    providedIn: 'root',
})
export class GameDataService {
    private gameData: GameData;

    constructor() {
        this.gameData = new GameData();
    }

    get data(): GameData {
        return this.gameData;
    }

    set data(obj: GameData) {
        this.gameData.pseudo = obj.pseudo;
        this.gameData.timerPerTurn = obj.timerPerTurn;
        this.gameData.dictionary = obj.dictionary;
        this.gameData.botName = obj.botName;
    }
}
