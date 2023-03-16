import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/services/init_service.dart';
import 'package:client_leger/services/link_service.dart';
import 'package:client_leger/services/multiplayer_game_service.dart';

import '../classes/game.dart';
import '../main.dart';
import '../classes/command.dart';

class InGameService extends MultiplayerGameService {

  final String msgEvent = 'message';
  late Player receivedPlayer;
  int bankCount = 88;
  List<Player> players = gameService.room.players;

  InGameService({required super.gameData});


  configure() {
    // player = getPlayer(authenticator
    //     .getCurrentUser()
    //     .username);
    startGame();
    onFirstSocketConnection();
    socketService.on("drawRack", (letters) =>
    {
      print('receiving rack'),
      linkService.updateRack(letters),
    });

    socketService.on("updatePlayerScore", (player) =>
    {
      receivedPlayer = gameService.decodePlayer(player),
      getPlayer(receivedPlayer.pseudo).points = receivedPlayer.points,
    });

    //determine if event is needed
    socketService.on("drawBoard", (data) => {

    });

    socketService.on("lettersBankCountUpdated", (count) => {
      //TODO update bank count
      bankCount = count,
      if (bankCount < 7) gameService.room.isBankUsable = false
    });

    socketService.on("gameIsOver", (players) => {
      gameService.room.roomInfo.isGameOver = true,
      linkService.setTurn(false),
      //TODO find winner ? see players-infos.components.ts in heavy client
    });

    socketService.on("botJoinedRoom", (players) => {
      players = decodePlayers(players),
      gameService.room.players = players,
    });
  }

  onFirstSocketConnection() {
    socketService.send("getRackInfos", gameService.room.roomInfo.name);
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
    //indice
    final command = HelpCommand();
    gameCommandService.constructHelpCommand(command);
  }

  letterBankCommand() {
    final command = ReserveCommand();
    gameCommandService.constructReserveCommand(command);
  }

  handleBadPlacement() {
    socketService.send("changeTurn", room.roomInfo.name);
  }

  getPlayer(String pseudo) {
    for (player in gameService.room.players) {
      if (pseudo == player.pseudo) return player;
    }
    return null;
  }
}

