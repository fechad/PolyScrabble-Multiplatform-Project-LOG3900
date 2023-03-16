import 'package:client_leger/pages/game_page.dart';

import '../components/tile.dart';
import '../services/link_service.dart';

class PlacementCommand {
  String letter;
  String position;
  String direction;
  PlacementCommand(
      {required this.position, required this.direction, required this.letter});

  execute() {
    String command = '!placer $position$direction $letter';
    socketService.send('message', command);
  }
}

class ExchangeCommand {
  List<int> letterIndexes;
  ExchangeCommand({required this.letterIndexes});

  execute() {
    final rack = linkService.getRack();
    String lettersToExchange = '';
    for (Tile tile in rack) {
      if (letterIndexes.contains(tile.index)) {
        lettersToExchange += tile.letter;
      }
    }

    String command = '!échanger $lettersToExchange';

    socketService.send('message', command);
  }
}

class HelpCommand {
  String letter = '!indice';
  HelpCommand();
  execute() {
    socketService.send('message', letter);
  }
}

class ReserveCommand {
  String letter = '!réserve';
  ReserveCommand();
  execute(){
    socketService.send('message', letter);
  }
}

class SkipTurnCommand {
  String letter = '!passer';
  SkipTurnCommand();
  execute() {
    socketService.send('message', letter);
  }
}




