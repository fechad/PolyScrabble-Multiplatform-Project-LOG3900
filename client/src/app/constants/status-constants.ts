import { MAX_LENGTH_PSEUDO, MIN_LENGTH_PSEUDO } from '@app/constants/constants';
export const WAITING_FOR_CONFIRMATION = 'Vous êtes dans une salle en attente de la confirmation du joueur adverse';
export const GAME_REJECTION_BY_ADVERSARY = 'Vous avez été rejeté par le joueur adverse';
export const INVALID_PSEUDO_LENGTH = `Votre pseudo doit contenir entre ${MIN_LENGTH_PSEUDO} et ${MAX_LENGTH_PSEUDO} caractères`;
export const INVALID_PSEUDO = 'Votre nom est invalide ou vous avez le même nom que votre adversaire';
export const ROOM_ERROR = 'Vous ne pouvez pas rejoindre cette salle, car elle est inexistante ou pleine';
