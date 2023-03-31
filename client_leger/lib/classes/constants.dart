import 'game.dart';

const List<String> virtualPlayers = <String>[
  'Simon',
  'Lucie',
  'Jojo',
];

const List<String> time = <String>[
  '30',
  '60',
  '90',
  '120',
  '150',
  '180',
  '210',
  '240',
  '270',
  '300'
];
const List<String> music = ['WeAreTheChamps.mp3', 'RickRoll.mp3', 'Better.mp3'];

final UserSettings DEFAULT_USER_SETTINGS = UserSettings(
    // avatarUrl:
    //     'https://pbs.twimg.com/media/FS646o-UcAE3luS?format=jpg&name=large',
    avatarUrl: '',
    defaultLanguage: 'french',
    defaultTheme: 'light',
    victoryMusic: 'We are the champions');

List<String> predefinedAvatarsUrl = [
  'https://res.cloudinary.com/dejrgre8q/image/upload/v1678661515/EinsteinAvatar_n2h25k.png',
  'https://res.cloudinary.com/dejrgre8q/image/upload/v1678661515/SantaAvatar_vhamtv.png',
  'https://res.cloudinary.com/dejrgre8q/image/upload/v1678661515/defaultAvatar_irwvz0.png',
  'https://res.cloudinary.com/dejrgre8q/image/upload/v1678657051/hmqljwvfskx43vohldyz.jpg',
  'https://res.cloudinary.com/dejrgre8q/image/upload/v1678651607/cld-sample-5.jpg',
  'https://res.cloudinary.com/dejrgre8q/image/upload/v1678651606/cld-sample-4.jpg',
  'https://res.cloudinary.com/dejrgre8q/image/upload/v1678651606/cld-sample-3.jpg',
  'https://res.cloudinary.com/dejrgre8q/image/upload/v1678651605/cld-sample.jpg',
  'https://res.cloudinary.com/dejrgre8q/image/upload/v1678651586/samples/sheep.jpg',
  'https://res.cloudinary.com/dejrgre8q/image/upload/v1678651586/samples/people/smiling-man.jpg',
  'https://res.cloudinary.com/dejrgre8q/image/upload/v1678651584/samples/people/kitchen-bar.jpg',
  'custom'
];

final Account SANTA = new Account(
  username: "Santa",
  email: "santa@polyscrabble.ca",
  userSettings: new UserSettings(
      avatarUrl: "assets/images/avatars/SantaAvatar.png",
      defaultLanguage: "fr",
      defaultTheme: "dark",
      victoryMusic: "macarena"),
  progressInfo: new ProgressInfo(
      totalXP: 999,
      currentLevel: 999,
      currentLevelXp: 999,
      xpForNextLevel: 999,
      victoriesCount: 999),
  highScores: null,
  badges: ["Santa"],
  bestGames: ["999"],
  gamesPlayed: ["999"],
  gamesWon: 999,
);

final Account MOZART = new Account(
  username: "Mozart",
  email: "mozart@polyscrabble.ca",
  userSettings: new UserSettings(
      avatarUrl: "assets/images/avatars/MozartAvatar.png",
      defaultLanguage: "fr",
      defaultTheme: "dark",
      victoryMusic: "macarena"),
  progressInfo: new ProgressInfo(
      totalXP: 999,
      currentLevel: 999,
      currentLevelXp: 999,
      xpForNextLevel: 999,
      victoriesCount: 999),
  highScores: null,
  badges: ["Mozart"],
  bestGames: ["999"],
  gamesPlayed: ["999"],
  gamesWon: 999,
);

final Account SERENA = new Account(
  username: "Serena",
  email: "serena@polyscrabble.ca",
  userSettings: new UserSettings(
      avatarUrl: "assets/images/avatars/SerenaAvatar.png",
      defaultLanguage: "fr",
      defaultTheme: "dark",
      victoryMusic: "macarena"),
  progressInfo: new ProgressInfo(
      totalXP: 999,
      currentLevel: 999,
      currentLevelXp: 999,
      xpForNextLevel: 999,
      victoriesCount: 999),
  highScores: null,
  badges: ["Serena"],
  bestGames: ["999"],
  gamesPlayed: ["999"],
  gamesWon: 999,
);

final Account TRUMP = new Account(
  username: "Trump",
  email: "trump@polyscrabble.ca",
  userSettings: new UserSettings(
      avatarUrl: "assets/images/avatars/TrumpAvatar.png",
      defaultLanguage: "fr",
      defaultTheme: "dark",
      victoryMusic: "macarena"),
  progressInfo: new ProgressInfo(
      totalXP: 999,
      currentLevel: 999,
      currentLevelXp: 999,
      xpForNextLevel: 999,
      victoriesCount: 999),
  highScores: null,
  badges: ["Trump"],
  bestGames: ["999"],
  gamesPlayed: ["999"],
  gamesWon: 999,
);

final Account EINSTEIN = new Account(
  username: "Einstein",
  email: "einstein@polyscrabble.ca",
  userSettings: new UserSettings(
      avatarUrl: "assets/images/avatars/EinsteinAvatar.png",
      defaultLanguage: "fr",
      defaultTheme: "dark",
      victoryMusic: "macarena"),
  progressInfo: new ProgressInfo(
      totalXP: 999,
      currentLevel: 999,
      currentLevelXp: 999,
      xpForNextLevel: 999,
      victoriesCount: 999),
  highScores: null,
  badges: ["Einstein"],
  bestGames: ["999"],
  gamesPlayed: ["999"],
  gamesWon: 999,
);

final Map<String, Account> JVS = {
  "Santa": SANTA,
  "Mozart": MOZART,
  "Serena": SERENA,
  "Trump": TRUMP,
  "Einstein": EINSTEIN,
};
