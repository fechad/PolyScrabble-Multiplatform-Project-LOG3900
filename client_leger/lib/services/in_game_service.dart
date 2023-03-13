import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/services/link_service.dart';
import 'package:client_leger/services/multiplayer_game_service.dart';

import '../classes/game.dart';
import '../main.dart';
import '../classes/command.dart';

class InGameService extends MultiplayerGameService {

  final String msgEvent = 'message';
  late Player receivedPlayer;
  bool alreadyChanged = false;

  InGameService({required super.gameData});


  configure() {
    player = getPlayer(authenticator
        .getCurrentUser()
        .username);
    startGame();
    onFirstSocketConnection();
    socketService.on("drawRack", (letters) =>
    {
      linkService.updateRack(letters),
    });

    socketService.on("updatePlayerScore", (player) =>
    {
      receivedPlayer = gameService.decodePlayer(player),
      getPlayer(receivedPlayer.pseudo).points = receivedPlayer.points,
    });
  }

  onFirstSocketConnection() {
    socketService.send("getRackInfos", gameService.room.roomInfo.name);
  }


  changePlayerTurn() {
    socketService.send(msgEvent, "!passer");
  }

  //TODO get the position and letters to send to server
  // confirmPlacement(){
  //   socketService.send(msgEvent, )
  // }

  confirmLeaving() {
    gameService.leave();
    socketService.disconnect();
  }

  helpCommand() {
    //indice
    HelpCommand help = HelpCommand();
    help.execute();
  }

  letterBankCommand() {
    ReserveCommand reserve = ReserveCommand();
    reserve.execute();
  }

  startGame() {
    socketService.send('startGame');
  }

  getPlayer(String pseudo) {
    for (player in gameService.room.players) {
      if (pseudo == player.pseudo) return player;
    }
    return null;
  }
}
