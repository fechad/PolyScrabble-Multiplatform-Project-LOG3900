import 'package:client_leger/pages/game_page.dart';

class BackgroundService {
  late String currentVP;
  late String currentBackground;
  late Map backgroundList;

  BackgroundService() {
    currentVP = '';
    currentBackground = '';
    backgroundList = {
      "santa": [
        'assets/images/theme-backgrounds/santa-happy.png',
        'assets/images/theme-backgrounds/santa-angry.jpg'
      ],
      "einstein": [
        'assets/images/theme-backgrounds/einstein-happy.jpg',
        'assets/images/theme-backgrounds/einstein-angry.jpg'
      ],
      "mozart": [
        'assets/images/theme-backgrounds/mozart-happy.jpg',
        'assets/images/theme-backgrounds/mozart-angry.jpg'
      ],
      "serena": [
        'assets/images/theme-backgrounds/serena-happy.jpg',
        'assets/images/theme-backgrounds/serena-angry.jpg'
      ],
      "trump": [
        'assets/images/theme-backgrounds/trump-happy.jpg',
        'assets/images/theme-backgrounds/trump-angry.webp'
      ],
    };
  }

  setBackground(String bot) {
    currentVP = bot.toLowerCase();
    if (currentVP.isEmpty) {
      currentBackground = '';
      return;
    }
    currentBackground = backgroundList[currentVP][0] as String;
    linkService.setCurrentBackground(currentBackground);
    print(currentBackground);
  }

  switchToAngry() {
    currentBackground = currentBackground == backgroundList[currentVP][0]
        ? backgroundList[currentVP][1]
        : backgroundList[currentVP][0];

    linkService.switchBackground(currentBackground);
  }
}
