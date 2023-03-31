import 'package:audioplayers/audioplayers.dart';
import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/services/link_service.dart';
import 'package:client_leger/services/multiplayer_game_service.dart';

import '../classes/command.dart';
import '../classes/game.dart';
import '../pages/home_page.dart';

class InGameService extends MultiplayerGameService {
  final String msgEvent = 'message';
  late Player receivedPlayer;
  int bankCount = 88;
  List<Player> players = gameService.room.players;
  late String hints;
  String winnerPseudo = '';

  InGameService({required super.gameData});

  configure() {
    startGame();
    socketService.on(
        "drawRack",
        (letters) => {
              linkService.updateRack(letters),
            });

    socketService.on(
        "updatePlayerScore",
        (sender) => {
              scorePlayer = Player.fromJson(sender),
              for (Player p in gameService.room.players)
                {
                  if (p.clientAccountInfo!.username == scorePlayer.clientAccountInfo!.username)
                    {p.points = scorePlayer.points}
                }
            });

    socketService.on(
        "lettersBankCountUpdated",
        (count) => {
              bankCount = count,
              if (bankCount < 7) gameService.room.isBankUsable = false
            });

    socketService.on(
        "botJoinedRoom",
        (players) => {
              players = decodePlayers(players),
              gameService.room.players = players,
            });
  }

  startGame() {
    socketService.send('startGame');
  }

  changePlayerTurn() {
    final command = SkipTurnCommand();
    gameCommandService.constructSkipTurnCommand(command);
  }

  confirmLeaving() {
    gameService.goals = [];
    gameService.leave();
    socketService.send("leaveGame");
  }

  helpCommand() {
    //hint
    final command = HelpCommand();
    gameCommandService.constructHelpCommand(command);
  }

  letterBankCommand() {
    final command = ReserveCommand();
    gameCommandService.constructReserveCommand(command);
  }

  handleBadPlacement() {
    socketService.send("changeTurn", gameService.room.roomInfo.name);
  }

  findWinner(List<Player> winnerArray) {
    if (winnerArray.isEmpty) return;
    if (winnerArray.length == 1) winnerPseudo = winnerArray[0].clientAccountInfo!.username;
    for (Player p in gameService.room.players) {
      if (p.clientAccountInfo!.username == winnerArray[0].clientAccountInfo!.username) {
        Player firstWinner = p;
      } else
        return;
    }
    //TODO play firstWinner 's victory music from settings
  }

  getPlayer(String pseudo) {
    for (player in gameService.room.players) {
      if (pseudo == player.clientAccountInfo!.username) return player;
    }
    return null;
  }
}
