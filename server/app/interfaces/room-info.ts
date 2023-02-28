export interface RoomInfo {
    name: string;
    creatorName: string;
    timerPerTurn: string;
    dictionary: string;
    gameType: string;
    maxPlayers: number;
    isSolo?: boolean;
    surrender: string;
    isPublic: boolean;
    password: string;
}
