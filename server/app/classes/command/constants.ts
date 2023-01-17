export const COMMAND_STARTING_SYMBOL = '!';
export const PLACER_COMMAND_LENGTH = 3;
export const ECHANGER_COMMAND_LENGTH = 2;
export const PASSER_COMMAND_LENGTH = 1;
export const LETTER_BANK_COMMAND_LENGTH = 1;
export const HINT_COMMAND_LENGTH = 1;
export const HELP_COMMAND_LENGTH = 1;

// Command specifications
export const MINIMUM_WORD_LENGTH = 1;
export const MINIMUM_WORD_LENGTH_WITHOUT_DIRECTION = 1;
export const DEFAULT_PLACEMENT_DIRECTION = 'h';
export const MINIMUM_BANK_LETTERS_FOR_EXCHANGE = 7;

// Commands error messages
export const WAIT_TURN_ERROR = "Vous devez attendre que le tour de votre adversaire se termine avant d'executer cette commande";
export const SYNTAX_ERROR_MESSAGE = 'Erreur de syntaxe';
export const INVALID_ERROR_MESSAGE = 'Entrée invalide';
export const ALMOST_EMPTY_BANK_ERROR = 'La reserve ne possede pas suffisament de lettres pour executer cette commande';

export const HELP_MESSAGE =
    // this is the message we send when we enter help command.
    // eslint-disable-next-line max-len
    "aide:\n- Les commandes disponibles:\n1) !aide : permet d'expliquer le fonctionnement du jeu brievement.\n2) !indice : permet de vous donner des placement possibles.\n3) !réserve : permet d'afficher le contenu de la réserve.\n4) !passer : permet de passer votre tour.\n5) !échanger [lettres à échanger] : permet d'échanger des lettres dans votre chevalet.\n6) !placer [colonne][ligne][direction(optionnel)] [lettres à placer] : permet de placer des lettres dans la grille.";
