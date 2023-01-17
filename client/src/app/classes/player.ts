import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class Player {
    pseudo: string;
    socketId: string;
    points: number;
    isCreator: boolean;
    isItsTurn: boolean;

    constructor() {
        this.pseudo = 'defaultUser';
        this.socketId = '';
        this.points = 0;
        this.isCreator = false;
        this.isItsTurn = false;
    }
}
