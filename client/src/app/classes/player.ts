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
        this.isCreator = false; // Remove this from here, obsolete
        this.isItsTurn = false;
    }

    // tested on game-page.component.spec.ts
    setPlayerGameAttributes(player: Player) {
        this.pseudo = player.pseudo;
        this.socketId = player.socketId;
        this.points = player.points;
        this.isCreator = player.isCreator;
        this.isItsTurn = player.isItsTurn;
    }
}
