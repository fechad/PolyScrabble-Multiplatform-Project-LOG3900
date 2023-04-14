import 'package:client_leger/classes/command.dart';
import 'package:client_leger/pages/game_page.dart';
import 'package:flutter/cupertino.dart';
import '../classes/game.dart';
import 'game_command_service.dart';
import 'link_service.dart';

class PlacementValidatorService {
  bool validPlacement = false;
  bool isHorizontal = false;
  bool secondPlacement = false;
  List<int> firstLetterPosition = [];

  List<Letter> lettersDict = [];
  List<Letter> toBeRemoved = [];
  String letters = '';

  PlacementValidatorService(GameCommandService gameCommandService);

  addLetter(String letter, int x, int y) {
    if (lettersDict.isEmpty || firstLetterPosition.isEmpty) {
      firstLetterPosition.addAll([x, y]);
      socketService.send('firstTilePlaced', {'x': firstLetterPosition[0]+1, 'y': firstLetterPosition[1]+1});
      validPlacement = true;
      lettersDict.add(new Letter(letter: letter, x: x, y: y));
    } else {
      confirmValidity(letter, x, y);
      if (!validPlacement) return;
    }

    letters += lettersDict.last.letter;
    validPlacement = true;
    return;
  }

  removeLetter(int x, int y){
    late Letter toRemove;
    for(Letter l in lettersDict){
      if (l.x == x && l.y == y) {
        toRemove = l;
        break;
      }
    }
    lettersDict.remove(toRemove);
  }

  doubleCheckWord(String newLetter, int x, int y){
    bool changed = false;
    if (lettersDict.isNotEmpty){
   for(Letter l in lettersDict){
     if(x == l.x && y == l.y){
       if(l.letter == ' '){
         l.letter = newLetter;
         changed = true;
       }
     }
     }
   if (changed) lettersDict.removeLast();
   }
  }

  confirmValidity(String letter, int x, int y) {
    lettersDict.add(Letter(letter: letter, x: x, y: y));
    isHorizontal = lettersDict[0].y == lettersDict[1].y;
    Widget previous = Container();
    Widget after = Container();
    doubleCheckWord(letter, x, y);
    if (isHorizontal) {
      if(x > 1) {
        previous = (linkService.getRows()[y] as Row).children[x-1];
      }
      if (x < 14) {
          after = (linkService.getRows()[y] as Row).children[x+1];
        }
        if (!(previous.runtimeType.toString().contains('Container')) &&
            !(after.runtimeType.toString().contains('Container'))) {
          lettersDict.removeLast();
          lettersDict.add(Letter(letter:' ', x: x-1, y: y));
          lettersDict.add(Letter(letter: letter, x: x, y: y));
        }

        lettersDict.forEach((letter) {
          if (letter.y != firstLetterPosition[1]) validPlacement = false;
        });
        if (!validPlacement) lettersDict.removeLast();
    } else {
      if(y > 1) {
        previous = (linkService.getRows()[y-1] as Row).children[x];
      }
      if (y < 14) {
        after = (linkService.getRows()[y+1] as Row).children[x];
      }

      if (!(previous.runtimeType.toString().contains('Container')) &&
          !(after.runtimeType.toString().contains('Container'))) {
        lettersDict.removeLast();
        lettersDict.add(Letter(letter:' ', x: x, y: y-1));
        lettersDict.add(Letter(letter: letter, x: x, y: y));
      }
        lettersDict.forEach((letter) {
          if (letter.x != firstLetterPosition[0]) validPlacement = false;
        });
        if (!validPlacement) lettersDict.removeLast();
      }
    }


  cancelPlacement() {
    validPlacement = false;
    isHorizontal = false;
    secondPlacement = false;
    firstLetterPosition.clear();
    letters = '';
    lettersDict.clear();
  }

  executeCommand() {
    if (validPlacement) {
      if (isHorizontal) {
        lettersDict.sort((a, b) => a.x.compareTo(b.x));
      }
      else {
        lettersDict.sort((a, b) => a.y.compareTo(b.y));
      }
      letters = '';
      lettersDict.forEach((elem) {
        letters += elem.letter;
      });
      firstLetterPosition = [lettersDict[0].x, lettersDict[0].y];
      PlacementCommand command = PlacementCommand(
        position:
            '${placementValidator.getRowLetter(placementValidator.firstLetterPosition[1])}${placementValidator.firstLetterPosition[0] + 1}',
        direction: isHorizontal ? 'h' : 'v',
        letter: letters,
      );
      gameCommandService.constructPlacementCommand(command);
      letters = '';
      lettersDict.clear();
      firstLetterPosition.clear();
    }
  }

  getRowLetter(int row) {
    //row + 97 is ASCII code
    //return the actual string corresponding to ASCII code
    return String.fromCharCode(row + 97);
  }

  convertPlacement(String position) {
    final row = (position[0].codeUnitAt(0) - 97);
    final column = int.parse(position[1]) - 1;
    return "$row$column";
  }
}
