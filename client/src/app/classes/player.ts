import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class Player {
    email: string;
    pseudo: string;
    socketId: string;
    points: number;
    isCreator: boolean;
    isItsTurn: boolean;

    constructor() {
        this.email = '';
        this.socketId = '';
        this.points = 0;
        this.isCreator = false;
        this.isItsTurn = false;
    }
}
