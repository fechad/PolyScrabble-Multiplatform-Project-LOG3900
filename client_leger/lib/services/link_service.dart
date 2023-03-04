import 'package:client_leger/classes/placement.dart';
import 'package:client_leger/components/tile.dart';
import 'package:flutter/material.dart';
import 'package:mobx/mobx.dart';

import '../main.dart';

part 'link_service.g.dart';

final RebuildController controller = RebuildController();
final RebuildController boardController = RebuildController();

// ignore: library_private_types_in_public_api
class LinkService = _LinkService with _$LinkService;

abstract class _LinkService with Store {
  final List<Tile> rack = [
    Tile(letter: 'A', index: 0, rebuildController: controller),
    Tile(letter: 'N', index: 1, rebuildController: controller),
    Tile(letter: 'N', index: 2, rebuildController: controller),
    Tile(letter: 'A', index: 3, rebuildController: controller),
    Tile(letter: 'G', index: 4, rebuildController: controller),
    Tile(letter: 'U', index: 5, rebuildController: controller),
    Tile(letter: 'O', index: 6, rebuildController: controller),
  ];

  @observable
  ObservableList<Tile> tempRack = ObservableList<Tile>.of([
    Tile(letter: 'A', index: 0, rebuildController: controller),
    Tile(letter: 'N', index: 1, rebuildController: controller),
    Tile(letter: 'N', index: 2, rebuildController: controller),
    Tile(letter: 'A', index: 3, rebuildController: controller),
    Tile(letter: 'G', index: 4, rebuildController: controller),
    Tile(letter: 'U', index: 5, rebuildController: controller),
    Tile(letter: 'O', index: 6, rebuildController: controller),
  ]);

  @observable
  Observable<int> letterBankCount = Observable(0);

  @observable
  ObservableList<Widget> rows = ObservableList<Widget>.of([]);

  List<Placement> placementStack = [];

  ObservableList<Tile> getRack() {
    return tempRack;
  }

  List<Widget> getRows() {
    print('enteres');
    return rows;
  }

  int getLetterBankCount() {
    return letterBankCount.value;
  }

  @action
  setRows(int x, int y, Container square) {
    print(((rows[y] as Row).children[x]).runtimeType);
    Placement placement = Placement(
        x: x,
        y: y,
        currentSquare: square,
        previousSquare:
            (rows[y] as Row).children[x] as DragTarget<Map<dynamic, dynamic>>);
    placementStack.add(placement);
    (rows[y] as Row).children[x] = placement.currentSquare;
  }

  @action
  confirm() {
    placementStack.clear();
  }

  @action
  cancelPlacements() {
    for (Placement placement in placementStack) {
      (rows[placement.y] as Row).children[placement.x] =
          placement.previousSquare;
    }
    placementStack.clear();
  }

  @action
  setLetterBankCount(int newValue) {
    letterBankCount.value = newValue;
  }

  @action
  removeLetter(Tile tile) {
    //TODO: remove corect letter not the first one
    for (Tile letter in tempRack) {
      if (letter.letter == tile.letter) {
        tempRack.remove(letter);
        break;
      }
    }
  }

  @action
  resetRack() {
    print('resetting rack');
    tempRack.clear();
    for (Tile letter in rack) {
      final deepCopy = Tile(
          letter: letter.letter,
          index: letter.index,
          rebuildController: letter.rebuildController);
      tempRack.add(deepCopy);
    }
  }

  //TODO: S'assurer qu'on ne peut pas faire apparaitre le menu d'échange pendant que le serveur confirme le placement
  @action
  updateRack(String data) {
    int index = 0;
    rack.clear();
    for (String letter in data.split("")) {
      Tile newTile = Tile(letter: letter, index: index);
      rack.add(newTile);
    }
    print("updated rack");
    resetRack();
  }
}
