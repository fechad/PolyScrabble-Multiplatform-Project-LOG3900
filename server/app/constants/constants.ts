import { DictionariesFileService } from '@app/services/dictionaries-files.service';

export const DEFAULT_DICTIONARY_TITLE = 'dictionnaire par défaut';
export const GENERAL_CHAT_NAME = 'Principal';
export const DEFAULT_ROOM_NAME = 'R-';

export const ONE_SECOND_IN_MS = 1000;
export const BOT_COMMAND_TIMEOUT_SEC = 15;
export const SYSTEM_NAME = 'Maître de jeu';
export const RACK_CAPACITY = 7;
export const COUNT_PLAYER_TURN = 2;
export const TWENTY_SECONDS_IN_MS = 17000;
export const BOT_DELAY = 1500;
export const DISCONNECT_DELAY = 4000;
export const END_TIMER_VALUE = -1;
export const INVALID = -1;

export const WEIGHT_10 = 10;
export const WEIGHT_30 = 30;
export const WEIGHT_40 = 40;
export const MAX_RANDOM = 100;

export const MAX_WORD_LENGTH_REWARD = 50;
export const INITIAL_BANK_SIZE = 102;
export const RACK_LETTERS_QUANTITY = 7;
export const MAX_NBR_PLAYERS = 4;
export const DEFAULT_SCORE_MAP_NAME = './assets/dictionnaire-par-defaut.json';
export const ELABORATE_MAP_SUCCESS_MESSAGE = 'word score map built';
export const DEFAULT_DICTIONARY_PATH = new DictionariesFileService().convertTitleIntoFilename(DEFAULT_DICTIONARY_TITLE);

export const BANK_ALPHABET_SORTED = 'abcdefghijklmnopqrstuvwxyz*';

export const CHAT_WINDOW_SOCKET_CHANNEL = 'Room Chat Window';
