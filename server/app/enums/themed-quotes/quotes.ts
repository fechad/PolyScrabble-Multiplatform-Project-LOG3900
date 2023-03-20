export interface Quotes {
    greeting: string;
    bigScore: string;
    extremeScore: string;
    angryAnnouncement: string;
    cheatAnnouncement: string;
}
export const DEFAULT_ENGLISH_QUOTES: Quotes = {
    greeting: 'Hello! 🥸',
    bigScore: 'Wow, what a move! 😤',
    extremeScore: 'Incredible! Look at my moves! 🤩',
    angryAnnouncement: 'Hey, you made me angry! 👺',
    cheatAnnouncement: 'I AM NOT A CHEATER 💩',
};

export const DEFAULT_FRENCH_QUOTES: Quotes = {
    greeting: 'Bonjour ! 🥸',
    bigScore: 'Wow, quelle coup ! 😤',
    extremeScore: "Incroyable ! C'est un coup tout bonnement incroyable ! 🤩",
    angryAnnouncement: 'Je suis en colère maintenant... 👺',
    cheatAnnouncement: 'JE NE SUIS PAS UN TRICHEUR 💩',
};
