export const DEFAULT_JSON_TYPE = 'application/json';
export const INVALID_FILE_TYPE_ERROR = 'Le fichier choisi doit etre de type json';
export const FILE_QUANTITY_ERROR = 'Vous devez choisir 1 seul fichier';
export const NO_FILE_ERROR = 'Vous devez choisir 1 seul fichier';
export const JSON_PARSING_ERROR = 'Une erreur est survenue en parsant votre JSON';
export const INVALID_FORMAT_ERROR = 'Votre dictionnaire ne possède pas un format valide';
export const DUPLICATED_DICTIONARY = 'Ce dictionnaire ne peut pas être ajouté car il existe déjà un dictionnaire ayant le titre';
export const MAX_FILE_LENGTH = 8000000;
export const ONE_MB = 1000000;
export const FILE_TOO_BIG = `La taille de votre fichier ne doit pas dépasser ${MAX_FILE_LENGTH / ONE_MB}MB`;

export const SUCCESSFUL_EDIT_MESSAGE = 'Votre dictionnaire a été mis à jour';
export const SUCCESSFUL_UPLOAD_MESSAGE = 'Votre dictionnaire a été ajouté';
export const SUCCESSFUL_DELETE_MESSAGE = 'Votre dictionnaire a été effacé';
export const SUCCESSFUL_DELETE_ALL_MESSAGE = 'Vos dictionnaires ont tous a été effacés';

// Custom constraints not imposed by the teacher
export const TITLE_MAX_LENGTH = 64;
export const TITLE_MIN_LENGTH = 1;
export const DESCRIPTION_MAX_LENGTH = 64;
export const ACCEPTED_TITLE_SPECIAL_CHARACTERS = [' ', "'"];

// For the dictionary validator
export const TITLE_NOT_FOUND = 'Votre dictionnaire ne contient pas une clé "title" \nPar exemple: { "title": "joual" }';
export const DESCRIPTION_NOT_FOUND = 'Votre dictionnaire ne contient pas une clé description"\nPar exemple: { "description": "1800s slangs" }';
export const WORDS_NOT_FOUND = 'Votre dictionnaire ne contient pas une clé "words" \nPar exemple : { "words": ["toi", "moi"] }';

// Invalid title messages
// max line is disabled because spliting the message on multiple line will not display it correctly on the UI
// eslint-disable-next-line max-len
export const INVALID_TITLE_LENGTH = `Le titre de votre dictionnaire doit avoir entre ${TITLE_MIN_LENGTH} et ${TITLE_MAX_LENGTH} caractères (excluant les espaces au début et à la fin)`;
export const INVALID_TITLE_CONTENT = 'Le titre de votre dictionnaire doit contenir uniquement des lettres, des espaces et des apostrophes';
export const INVALID_TITLE_TYPE = 'Le titre de votre dictionnaire doit être une string \nPar exemple: { "title": "mot" }';

// Invalid description messages
export const INVALID_DESCRIPTION_LENGTH = `La description de votre dictionnaire doit avoir moins de ${DESCRIPTION_MAX_LENGTH + 1} caractères`;
export const INVALID_DESCRIPTION_TYPE = 'La description de votre dictionnaire doit être une string\nPar exemple : { "description" : "mot" }';

// Invalid words messages
export const INVALID_NUMBER_OF_WORDS = 'Votre dictionnaire doit contenir au moins 1 mot';
export const INVALID_WORD_CONTENT = 'Vos mots doivent contenir UNIQUEMENT des lettres (minimalement une)';
export const INVALID_WORDS_TYPE = 'Les mots de votre dictionnaire doivent être une liste de string \nPar exemple: { "words" : ["mot1", "mot2"] }';
export const INVALID_WORD_TYPE = 'Au moins 1 de vos mots n"est pas une string (ex de string : "mot")';
