import 'package:client_leger/classes/command.dart';
import 'package:client_leger/pages/game_page.dart';

import 'game_command_service.dart';

class PlacementValidatorService {
  bool validPlacement = false;
  bool isHorizontal = false;
  bool secondPlacement = false;
  List<int> firstLetterPosition = [];

  String letters = '';

  PlacementValidatorService(GameCommandService gameCommandService);

  addLetter(String letter, int x, int y) {
    if (firstLetterPosition.isEmpty) {
      firstLetterPosition.addAll([x, y]);
      validPlacement = true;
      letters += letter;
      return;
    }
    if (firstLetterPosition[0] == x &&
        firstLetterPosition[1] != y &&
        !secondPlacement) {
      isHorizontal = false;
      validPlacement = true;
      secondPlacement = true;
    } else if (firstLetterPosition[1] == y &&
        firstLetterPosition[0] != x &&
        !secondPlacement) {
      isHorizontal = true;
      validPlacement = true;
      secondPlacement = true;
    } else if (firstLetterPosition[0] == x &&
        firstLetterPosition[1] != y &&
        !isHorizontal) {
      validPlacement = true;
    } else if (firstLetterPosition[1] == y &&
        firstLetterPosition[0] != x &&
        isHorizontal) {
      validPlacement = true;
    } else {
      validPlacement = false;
      return;
    }

    letters += letter;
  }

  cancelPlacement() {
    validPlacement = false;
    isHorizontal = false;
    secondPlacement = false;
    firstLetterPosition.clear();
    letters = '';
  }

  executeCommand(position) {
    if (validPlacement) {
      PlacementCommand command = PlacementCommand(
          position: position,
          direction: isHorizontal ? 'h' : 'v',
          letter: letters);
      gameCommandService.constructPlacementCommand(command);
      letters = '';
      firstLetterPosition.clear();
    }
  }
}
