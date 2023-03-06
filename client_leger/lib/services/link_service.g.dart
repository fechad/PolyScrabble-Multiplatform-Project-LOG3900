part of 'link_service.dart';

// ignore_for_file: non_constant_identifier_names, unnecessary_brace_in_string_interps, unnecessary_lambdas, prefer_expression_function_bodies, lines_longer_than_80_chars, avoid_as, avoid_annotating_with_dynamic, no_leading_underscores_for_local_identifiers

mixin _$LinkService on _LinkService, Store {
  late final _$valueAtom = Atom(name: '_LinkService.value');

  @override
  ObservableList<Tile> get tempRack {
    _$valueAtom.reportRead();
    return super.tempRack;
  }

  @override
  ObservableList<Widget> get rows {
    _$valueAtom.reportRead();
    return super.rows;
  }

  @override
  Observable<int> get letterBankCount {
    _$valueAtom.reportRead();
    return super.letterBankCount;
  }

  @override
  Observable<bool> get joinButtonPressed {
    _$valueAtom.reportRead();
    return super.joinButtonPressed;
  }

  @override
  Observable<bool> get newMessage {
    _$valueAtom.reportRead();
    return super.newMessage;
  }

  @override
  ObservableList<String> get channelWithNewMessages {
    _$valueAtom.reportRead();
    return super.channelWithNewMessages;
  }

  @override
  Observable<String> get currentOpenedChat {
    _$valueAtom.reportRead();
    return super.currentOpenedChat;
  }

  @override
  set value(ObservableList<Tile> rack) {
    _$valueAtom.reportWrite(rack, super.tempRack, () {
      super.tempRack = rack;
    });
  }

  late final _$_LinkServiceActionController =
      ActionController(name: '_LinkService');

  @override
  void buttonChange() {
    final _$actionInfo = _$_LinkServiceActionController.startAction(
        name: '_LinkService.buttonChange');
    try {
      return super.buttonChange();
    } finally {
      _$_LinkServiceActionController.endAction(_$actionInfo);
    }
  }

  @override
  void newMessageChange() {
    final _$actionInfo = _$_LinkServiceActionController.startAction(
        name: '_LinkService.newMessageChange');
    try {
      return super.newMessageChange();
    } finally {
      _$_LinkServiceActionController.endAction(_$actionInfo);
    }
  }

  @override
  void setRows(x, y, square) {
    final _$actionInfo = _$_LinkServiceActionController.startAction(
        name: '_LinkService.setTempRows');
    try {
      return super.setRows(x, y, square);
    } finally {
      _$_LinkServiceActionController.endAction(_$actionInfo);
    }
  }

  @override
  void setCurrentOpenedChat(value) {
    final _$actionInfo = _$_LinkServiceActionController.startAction(
        name: '_LinkService.setCurrentOpenedChat');
    try {
      return super.setCurrentOpenedChat(value);
    } finally {
      _$_LinkServiceActionController.endAction(_$actionInfo);
    }
  }

  @override
  void pushNewChannel(name) {
    final _$actionInfo = _$_LinkServiceActionController.startAction(
        name: '_LinkService.pushNewChannel');
    try {
      return super.pushNewChannel(name);
    } finally {
      _$_LinkServiceActionController.endAction(_$actionInfo);
    }
  }

  @override
  void popChannel(name) {
    final _$actionInfo = _$_LinkServiceActionController.startAction(
        name: '_LinkService.popChannel');
    try {
      return super.popChannel(name);
    } finally {
      _$_LinkServiceActionController.endAction(_$actionInfo);
    }
  }

  @override
  void confirm() {
    final _$actionInfo = _$_LinkServiceActionController.startAction(
        name: '_LinkService.confirm');
    try {
      return super.confirm();
    } finally {
      _$_LinkServiceActionController.endAction(_$actionInfo);
    }
  }

  @override
  void cancelPlacements() {
    final _$actionInfo = _$_LinkServiceActionController.startAction(
        name: '_LinkService.cancelPlacements');
    try {
      return super.cancelPlacements();
    } finally {
      _$_LinkServiceActionController.endAction(_$actionInfo);
    }
  }

  @override
  void setLetterBankCount(value) {
    final _$actionInfo = _$_LinkServiceActionController.startAction(
        name: '_LinkService.setLetterBankCount');
    try {
      return super.setLetterBankCount(value);
    } finally {
      _$_LinkServiceActionController.endAction(_$actionInfo);
    }
  }

  @override
  void removeLetter(tile) {
    final _$actionInfo = _$_LinkServiceActionController.startAction(
        name: '_LinkService.removeLetter');
    try {
      return super.removeLetter(tile);
    } finally {
      _$_LinkServiceActionController.endAction(_$actionInfo);
    }
  }

  @override
  void resetRack() {
    final _$actionInfo = _$_LinkServiceActionController.startAction(
        name: '_LinkService.resetRack');
    try {
      return super.resetRack();
    } finally {
      _$_LinkServiceActionController.endAction(_$actionInfo);
    }
  }

  @override
  void updateRack(data) {
    final _$actionInfo = _$_LinkServiceActionController.startAction(
        name: '_LinkService.updateRack');
    try {
      return super.updateRack(data);
    } finally {
      _$_LinkServiceActionController.endAction(_$actionInfo);
    }
  }

  @override
  String toString() {
    return ''' rack: ${tempRack} ''';
  }
}
