import 'dart:math';

import 'package:client_leger/classes/game.dart';
import 'package:client_leger/classes/game_stats.dart';
import 'package:client_leger/main.dart';

import '../classes/objective.dart';
import '../pages/game_page.dart';

class ObjectivesService {
  List<Objective> objectives = [];
  bool isEnglish = false;
  ObjectivesService() {}
  final GAME_TARGETS = [5, 10, 25, 50, 100];
  final SCORES_OBJECTIVES = [200, 300, 500];
  int currentExp = 0;
  int requiredExp = 0;
  int currentLevel = 0;
  int highScore = 0;
  generateObjectives(Stats stats, Account player) {
    isEnglish =
        authenticator.currentUser.userSettings.defaultLanguage == 'english';
    this.objectives = [];
    this.generateThemedObjectives(player);
    this.generateLossObjectives(stats);
    this.generateTimeObjectives(stats);
    this.generatePlayedGameObjectives(stats);
    this.generateWonGameObjectives(stats);
    this.generateScoreObjectives(stats);
    this.recalculateXP(player);

  }

  generatePlayedGameObjectives(Stats stats) {
    for (var i = 0; i < 5; i++) {
      final target = GAME_TARGETS[i];
      final progression = stats.playedGamesCount! > target
          ? target
          : stats.playedGamesCount;
      final title = isEnglish
          ? 'Play ' + target.toString() + ' games'
          : 'Jouer ' + target.toString() + ' parties';
      this.objectives.add(new Objective(title, progression, target, target));
    }
  }

  generateWonGameObjectives(Stats stats) {
    for (int i = 0; i < 5; i++) {
      final target = GAME_TARGETS[i];
      final progression = stats.gamesWonCount! > target
          ? target
          : stats.gamesWonCount;
      final title = isEnglish
          ? 'Win ' + target.toString() + ' games'
          : 'Gagner ' + target.toString() + ' parties';
      this
          .objectives
          .add(new Objective(title, progression, target, target * 2));
    }
  }

  generateScoreObjectives(Stats stats) {
    stats.playedGames!.forEach((game) {
      if (game.score! > highScore) highScore = game.score!;
    });
    SCORES_OBJECTIVES.forEach((score) {
      final target = score;
      final title = isEnglish
          ? 'Score higher than ' + target.toString() + ' in Classic mode'
          : 'Scorer plus haut que ' + target.toString() + ' en mode classique';
      final progression = highScore > target ? target : highScore;
      this.objectives.add(new Objective(title, progression, target, target));
    });
  }

  generateThemedObjectives(Account player) {
    final title = isEnglish
        ? 'Beat every themed virtual players'
        : 'Battre tous les joueurs virtuels à thème';
    final progression = player.badges.length == 5 ? 1 : 0;
    const target = 1;
    this.objectives.add(new Objective(title, progression, target, 600));
  }

  generateLossObjectives(Stats stats) {
    int progression = 0;
    stats.playedGames!.forEach((game) {
      if (!(game.won ?? true)) {
        progression = 1;
      }
    });

    const target = 1;
    final title = isEnglish ? 'Lose a game' : 'Perdre une partie';
    this.objectives.add(new Objective(title, progression, target, 20));
  }

  generateTimeObjectives(Stats stats) {
    int achieved = 0;
    stats.playedGames!.forEach((game) {
      var strMinutes = game.duration!.split(' ')[0];
      int minutes = game.duration!.split(' ').length == 2
          ? int.parse(strMinutes.substring(0, strMinutes.length - 3))
          : 0;
      if (minutes > 15 && (game.won ?? false)) {
        achieved = 1;
      }
    });
    final title = isEnglish
        ? 'Win a game in more than 15 minutes'
        : 'Gagner une partie en plus de 15 minutes';
    final progression = achieved;
    const target = 1;
    this.objectives.add(new Objective(title, progression, target, 100));
  }
  recalculateXP(Account player) {
    int addedExp = 0;
    for(Objective obj in this.objectives) {
      if (obj.progression == obj.target)
        addedExp += obj.exp!;

    }
    int totalExp =  player.progressInfo.totalXP! + addedExp;
    currentLevel = getLevel(totalExp);
    currentExp = (totalExp -
        this.getTotalXpForLevel(
            currentLevel))
        .round() as int;
    requiredExp = (this.getRemainingNeededXp(
        totalExp) +
        totalExp -
        this.getTotalXpForLevel(currentLevel));
  }

  getTotalXpForLevel(targetLevel) {
    const base = 200;
    const ratio = 1.05;
    return ((base * (1 - pow(ratio, targetLevel))) / (1 - ratio)).floor();
  }

  getLevel(totalXP) {
    int left = 1;
    int right = 100;
    while (left < right) {
      final mid = ((left + right) / 2).floor();
      final seriesSum = getTotalXpForLevel(mid);
      if (seriesSum > totalXP)
        right = mid;
      else
        left = mid + 1;
    }
    return left - 1;
  }

  getRemainingNeededXp(totalXP) {
    final currentLevel = getLevel(totalXP);
    return this.getTotalXpForLevel(currentLevel + 1) - totalXP;
  }
}
