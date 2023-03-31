class Stats {
  int? playedGamesCount;
  int? gamesWonCount;
  double? averagePointsByGame;
  String? averageGameDuration;
  List<PlayedGame>? playedGames;
  List<Log>? logs;

  Stats({
    this.playedGamesCount,
    this.gamesWonCount,
    this.averagePointsByGame,
    this.averageGameDuration,
    this.playedGames,
    this.logs,
  });

  Map<String, dynamic> toJson() => {
        'playedGamesCount': playedGamesCount,
        'gamesWonCount': gamesWonCount,
        'averagePointsByGame': averagePointsByGame,
        'averageGameDuration': averageGameDuration,
        'playedGames': playedGames,
      };
}

class PlayedGame {
  bool? won;
  int? score;
  String? startDateTime;
  String? duration;

  PlayedGame({
    this.won,
    this.score,
    this.startDateTime,
    this.duration,
  });

  factory PlayedGame.fromJson(Map<String, dynamic> json) {
    return PlayedGame(
      score: json['score'],
      startDateTime: json['startDateTime'],
      duration: json['duration'],
      won: json['won'],
    );
  }

  Map<String, dynamic> toJson() => {
        'won': won,
        'score': score,
        'startDateTime': startDateTime,
        'duration': duration,
      };
}

class Log {
  String? time;
  String? message;
  Log({this.time, this.message});

  factory Log.fromJson(Map<String, dynamic> json) {
    return Log(
      time: json['time'],
      message: json['message'],
    );
  }
}
