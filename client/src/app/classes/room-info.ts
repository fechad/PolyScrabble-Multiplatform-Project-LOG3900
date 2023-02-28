export interface RoomInfo {
    name: string;
    creatorName: string;
    timerPerTurn: string;
    dictionary: string;
    gameType: string;
    maxPlayers: number;
    isSolo?: boolean;
    isGameOver?: boolean;
    isPublic: boolean;
    password: string;
}
