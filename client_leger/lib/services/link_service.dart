import 'package:client_leger/classes/placement.dart';
import 'package:client_leger/components/tile.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:flutter/material.dart';
import 'package:mobx/mobx.dart';

import '../classes/game.dart';
import '../main.dart';
import 'multiplayer_game_service.dart';

part 'link_service.g.dart';

final RebuildController controller = RebuildController();
final RebuildController boardController = RebuildController();
SocketService socketService = SocketService.instance;
SocketService socketServiceBot = SocketService.instance;
final gameService = MultiplayerGameService(
    gameData: GameData(
        pseudo: authenticator.currentUser.username,
        dictionary: 'dictionnaire par défaut',
        timerPerTurn: '',
        botName: '',
        isExpertLevel: false));

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
  Observable<bool> isInAGame = Observable(false);

  @observable
  Observable<int> currentSelectedIndex = Observable(-1);

  @observable
  Observable<bool> wantToExchange = Observable(false);

  @observable
  Observable<bool> myTurn = Observable(false);

  @observable
  Observable<bool> joinButtonPressed = Observable(false);

  @observable
  Observable<bool> newMessage = Observable(false);

  @observable
  Observable<String> currentOpenedChat = Observable('');

  @observable
  ObservableList<String> channelWithNewMessages = ObservableList.of([]);

  @observable
  Observable<int> letterBankCount = Observable(0);

  @observable
  ObservableList<Widget> rows = ObservableList<Widget>.of([]);

  List<Placement> placementStack = [];

  bool getIsInAGame() {
    return isInAGame.value;
  }


  int getCurrentSelectedIndex() {
    return currentSelectedIndex.value;
  }

  ObservableList<Tile> getRack() {
    return tempRack;
  }

  String getCurrentOpenedChat() {
    return currentOpenedChat.value;
  }

  List<String> getChannelWithNewMessages() {
    return channelWithNewMessages;
  }

  List<Widget> getRows() {
    return rows;
  }

  bool getWantToExchange() {
    return wantToExchange.value;
  }

  bool getMyTurn() {
    return myTurn.value;
  }

  bool getJoinButtonPressed() {
    return joinButtonPressed.value;
  }

  bool getNewMessageBoolean() {
    return newMessage.value;
  }

  int getLetterBankCount() {
    return letterBankCount.value;
  }

  @action
  changeTurn() {
    myTurn.value = !myTurn.value;
  }

  @action
  buttonChange() {
    joinButtonPressed.value = !joinButtonPressed.value;
  }

  @action
  newMessageChange() {
    newMessage.value = !newMessage.value;
  }

  @action
  setIsInAGame(bool value) {
    isInAGame.value = value;
  }

  @action
  setCurrentSelectedIndex(int index) {
    currentSelectedIndex.value = index;
  }

  @action
  setWantToExchange(bool value) {
    wantToExchange.value = value;
  }


  @action
  setTurn(bool value) {
    myTurn.value = value;
  }

  @action
  setCurrentOpenedChat(String data) {
    currentOpenedChat.value = data;
  }

  @action
  setRows(int x, int y, Container square) {
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
  pushNewChannel(String name) {
    if (channelWithNewMessages.contains(name)) return;
    channelWithNewMessages.add(name);
  }

  @action
  popChannel(String name) {
    if (!channelWithNewMessages.contains(name)) return;
    channelWithNewMessages.remove(name);
    if (channelWithNewMessages.length == 0) newMessage.value = false;
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
    for (String letter in data.toUpperCase().split("")) {
      Tile newTile = Tile(letter: letter, index: index++, rebuildController: controller);
      rack.add(newTile);
    }
    resetRack();
  }
}

