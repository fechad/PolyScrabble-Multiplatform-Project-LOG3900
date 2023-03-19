import 'game.dart';

const List<String> virtualPlayers = <String>[
  'Simon',
  'Lucie',
  'Jojo',
];
const List<String> difficulty = <String>['Débutant', 'Expert'];
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
const List<String> music = <String>[
  'We are the champions',
  'Never gonna give you up'
];

final UserSettings DEFAULT_USER_SETTINGS = UserSettings(
    avatarUrl:
        'https://pbs.twimg.com/media/FS646o-UcAE3luS?format=jpg&name=large',
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
