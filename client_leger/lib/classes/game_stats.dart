class Stats {
  int playedGamesCount;
  int gamesWonCount;
  double averagePointsByGame;
  String averageGameDuration;
  List<PlayedGame> playedGames;
  List<Log> logs;

  Stats(
      {required this.playedGamesCount,
        required this.gamesWonCount,
        required this.averagePointsByGame,
        required this.averageGameDuration,
        required this.playedGames,
        required this.logs,
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
  bool won;
  int score;
  String startDateTime;
  String duration;

  PlayedGame(
      {required this.won,
        required this.score,
        required this.startDateTime,
        required this.duration,
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
  String time;
  String message;
  Log({
    required this.time,
    required this.message
  });

  factory Log.fromJson(Map<String, dynamic> json) {
    return Log(
      time: json['time'],
      message: json['message'],
    );
  }
}
