export enum BoardMessageContent {
    // The user will see these, so they are in french
    OutOfBounds = 'Une ligne ou une colonne du placement ne fait pas partie du plateau de jeu!',
    NotValidLetter = 'Une des lettres n est pas un charactère valide!',
    NoLetters = 'Pas de lettres fournies, rien à placer!',
    NoDirection = 'Pas de direction fournie pour le placement de plusieurs lettres!',
    CenterCaseEmpty = 'Un placement lors du premier tour doit couvrir la case centrale!',
    NotConnected = 'Les lettres placées n etaient pas connectées à d anciennes lettres sur le plateau!',
    InvalidWord = 'Un des mots formés est invalide!',

    // The user will not see these, so we keep them in english
    OccupiedCase = 'Can not place on occupied case',
    InternalLogicError = 'Internal logic error',
    NoRulesBroken = 'Letters placed did not break any rules',
}
