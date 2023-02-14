export interface Bot {
    name: string;
    gameType: string;
    avatarURLS: {
        happy: string;
        neutral: string;
        angry: string;
    };
    quotes: {
        taunts: string[];
        cheers: string[];
        celebrations: string[];
        specials: string[];
        rage: string[];
    };
}
