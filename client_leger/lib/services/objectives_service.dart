import 'package:client_leger/main.dart';

import '../classes/objective.dart';

class ObjectivesService {
  List<Objective> objectives = [];
  bool isEnglish = false;
  ObjectivesService() {}
  final GAME_TARGETS = [5, 10, 25, 50, 100];
  final SCORES_OBJECTIVES = [200, 300, 500];
  generateObjectives() {
    isEnglish = authenticator.currentUser.userSettings.defaultLanguage == 'english';
    print(authenticator.currentUser.userSettings.defaultLanguage);
    this.objectives = [];
    this.generateThemedObjectives();
    this.generateLevelObjectives();
    this.generateLossObjectives();
    this.generateTimeObjectives();
    this.generatePlayedGameObjectives();
    this.generateWonGameObjectives();
    this.generateScoreObjectives();
    return this.objectives;
  }
  generatePlayedGameObjectives() {
    for (var i = 0; i < 5; i++) {
      final target = GAME_TARGETS[i];
      final progression = authenticator.stats.playedGamesCount! > target ? target : authenticator.stats.playedGamesCount;
      final title = isEnglish ? 'Play ' + target.toString() + ' games' : 'Jouer ' + target.toString() + ' parties';
      this.objectives.add(new Objective(title, progression, target, target));
    }
  }

  generateWonGameObjectives() {
    for (int i = 0; i < 5; i++) {
      final target = GAME_TARGETS[i];
      final progression = authenticator.stats.gamesWonCount! > target ? target : authenticator.stats.gamesWonCount;
      final title = isEnglish ? 'Win ' + target.toString() + ' games' : 'Gagner ' + target.toString() + ' parties';
      this.objectives.add(new Objective(title, progression, target, target * 2));
    }
  }

  generateScoreObjectives() {
    int highestScore = 0;
    authenticator.stats.playedGames!.forEach((game) { if (game.score! > highestScore) highestScore = game.score!; });
    SCORES_OBJECTIVES.forEach((score) {
      final target = score;
      final title = isEnglish ? 'Score higher than ' + target.toString() + ' in Classic mode' : 'Scorer plus haut que ' + target.toString() + ' en mode classique';
      final progression = highestScore > target ? target : highestScore;
      this.objectives.add(new Objective(title, progression, target, target));
    });
  }

  generateThemedObjectives() {
    final title = isEnglish ? 'Beat every themed virtual players' : 'Battre tous les joueurs virtuels à thème';
    final progression = authenticator.currentUser.badges.length == 5 ? 1 : 0;
    const target = 1;
    this.objectives.add(new Objective(title, progression, target, 600));
  }

  generateLevelObjectives() {
    GAME_TARGETS.forEach((level) {
      final currentLevel = authenticator.currentUser.progressInfo.currentLevel;
      final target = level;
      final title = (isEnglish ? 'Reach level ' : 'Atteindre le niveau ') + target.toString();
      final progression = currentLevel! > target ? target : currentLevel;
      this.objectives.add(new Objective(title, progression, target, target * 10));
    });
  }

  generateLossObjectives() {
    int progression = 0;
    authenticator.stats.playedGames!.forEach((game) {
      if (!(game.won ?? true)) {
      progression = 1;
    } });

    const target = 1;
    final title = isEnglish ? 'Lose a game' : 'Perdre une partie';
    this.objectives.add(new Objective(title, progression, target, 20));
  }

  generateTimeObjectives() {
    int achieved = 0;
    authenticator.stats.playedGames!.forEach((game) {
      print(game.duration);
      var strMinutes = game.duration!.split(' ')[0];
      int minutes = game.duration!.split(' ').length == 2 ? int.parse(strMinutes.substring(0, strMinutes.length - 3)) : 0;
      if (minutes > 15 && (game.won ?? false)) {
        achieved = 1;
      }
    });
    final title = isEnglish ? 'Win a game in more than 15 minutes' : 'Gagner une partie en plus de 15 minutes';
    final progression = achieved;
    const target = 1;
    this.objectives.add(new Objective(title, progression, target, 100));
  }

}
