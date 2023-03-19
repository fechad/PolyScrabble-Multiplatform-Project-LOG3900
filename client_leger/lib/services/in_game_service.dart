import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/services/link_service.dart';
import 'package:client_leger/services/multiplayer_game_service.dart';

import '../classes/command.dart';
import '../classes/game.dart';

class InGameService extends MultiplayerGameService {
  final String msgEvent = 'message';
  late Player receivedPlayer;
  int bankCount = 88;
  List<Player> players = gameService.room.players;
  late String hints;

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
                  if (p.pseudo == scorePlayer.pseudo)
                    {p.points = scorePlayer.points}
                }
            });

    socketService.on(
        "lettersBankCountUpdated",
        (count) => {
              //TODO update bank count
              bankCount = count,
              if (bankCount < 7) gameService.room.isBankUsable = false
            });

    socketService.on(
        "gameIsOver",
        (players) => {
              gameService.room.roomInfo.isGameOver = true,
              linkService.setTurn(false),
              //TODO find winner ? see players-infos.components.ts in heavy client
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
    gameService.leave();
    socketService.disconnect();
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

  getPlayer(String pseudo) {
    for (player in gameService.room.players) {
      if (pseudo == player.pseudo) return player;
    }
    return null;
  }
}
