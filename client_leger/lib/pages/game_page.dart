import 'package:client_leger/classes/command.dart';
import 'package:client_leger/components/objective_box.dart';
import 'package:client_leger/components/your_rack.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/services/link_service.dart';
import 'package:client_leger/services/placement_validator_service.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../components/avatar_list.dart';
import '../components/board.dart';
import '../components/sidebar.dart';
import '../config/colors.dart';
import '../services/game_command_service.dart';

final linkService = LinkService();
final gameCommandService = GameCommandService();
final placementValidator = PlacementValidatorService(gameCommandService);

class GamePageWidget extends StatefulWidget {
  const GamePageWidget({Key? key}) : super(key: key);

  @override
  _GamePageWidgetState createState() => _GamePageWidgetState();
}

class _GamePageWidgetState extends State<GamePageWidget> {
  final scaffoldKey = GlobalKey<ScaffoldState>();
  final _unfocusNode = FocusNode();
  int numberOfLettersSelected = 0;
  List<int> letterIndexesToExchange = [];
  String lettersPlaced = '';

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    _unfocusNode.dispose();
    super.dispose();
  }

  tileChange(int letterIndex) {
    setState(() {
      if (letterIndexesToExchange.contains(letterIndex)) {
        letterIndexesToExchange.remove(letterIndex);
      } else {
        letterIndexesToExchange.add(letterIndex);
      }
    });
  }

  updateLettersPlaced(String letters) {
    setState(() {
      lettersPlaced = letters;
    });
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final screenWidth = mediaQuery.size.width;
    final screenHeight = mediaQuery.size.height;
    return Scaffold(
        backgroundColor: Color.fromRGBO(249, 255, 246, 1),
        body: Row(children: [
          CollapsingNavigationDrawer(),
          Column(children: [
            Container(
              width: screenWidth * 0.65,
              height: screenHeight,
              child: RebuildWrapper(
                  controller: boardController,
                  child: Board(
                    key: scaffoldKey,
                    alertGamePage: updateLettersPlaced,
                  )),
            )
          ]),
          Column(children: [
            SizedBox(height: 10),
            Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              Icon(Icons.filter_none, size: 32),
              Text(' ${linkService.getLetterBankCount()}',
                  style: TextStyle(
                    color: Colors.black,
                    fontFamily: 'Nunito',
                    fontSize: 24,
                  )),
              SizedBox(
                width: 85,
              ),
              Container(
                decoration: BoxDecoration(
                  border: Border.all(
                    color: Colors.black,
                    width: 2,
                  ),
                ),
                child: SizedBox(
                    width: 60,
                    height: 40,
                    child: Center(
                        child: Text('1:00',
                            style:
                                TextStyle(fontSize: 24, color: Colors.black)))),
              ),
              SizedBox(
                width: 115,
              ),
              Icon(Icons.lightbulb_outline_rounded, size: 40)
            ]),
            SizedBox(height: 20),
            AvatarList(),
            SizedBox(height: 10),
            ObjectiveBox(),
            SizedBox(height: 32),
            YourRack(tileChange: tileChange),
            SizedBox(height: 16),
            if (letterIndexesToExchange.length != 0)
              Row(
                children: [
                  ElevatedButton(
                    onPressed: () => {
                      setState(() {
                        letterIndexesToExchange.clear();
                        linkService.resetRack();
                      })
                    },
                    style: ButtonStyle(
                        backgroundColor:
                            MaterialStatePropertyAll<Color>(Color(0xFFFF4C4C))),
                    child: Text('Annuler'),
                  ),
                  SizedBox(
                    width: 24,
                  ),
                  ElevatedButton(
                    onPressed: () {
                      setState(() {
                        final ExchangeCommand command = ExchangeCommand(
                            letterIndexes: letterIndexesToExchange);
                        gameCommandService.constructExchangeCommand(command);
                        linkService.resetRack();
                        letterIndexesToExchange.clear();
                      });
                    },
                    style: ButtonStyle(
                        backgroundColor: const MaterialStatePropertyAll<Color>(
                            Palette.mainColor)),
                    child: Text('Échanger'),
                  )
                ],
              ),
            if (lettersPlaced != '')
              Row(
                children: [
                  ElevatedButton(
                    onPressed: () => {
                      setState(() {
                        placementValidator.cancelPlacement();
                        lettersPlaced = '';
                        linkService.cancelPlacements();
                        boardController.rebuild();
                        linkService.resetRack();
                      })
                    },
                    style: ButtonStyle(
                        backgroundColor:
                            MaterialStatePropertyAll<Color>(Color(0xFFFF4C4C))),
                    child: Text('Annuler'),
                  ),
                  SizedBox(
                    width: 24,
                  ),
                  ElevatedButton(
                    onPressed: () {
                      setState(() {
                        final PlacementCommand command = PlacementCommand(
                            position:
                                '${placementValidator.firstLetterPosition[0]}${placementValidator.firstLetterPosition[1]}',
                            direction:
                                placementValidator.isHorizontal ? 'h' : 'v',
                            letter: placementValidator.letters);
                        gameCommandService.constructPlacementCommand(command);
                        linkService.resetRack();
                        lettersPlaced = '';
                        placementValidator.cancelPlacement();
                        linkService.confirm();
                      });
                    },
                    style: ButtonStyle(
                        backgroundColor: const MaterialStatePropertyAll<Color>(
                            Palette.mainColor)),
                    child: Text('Confirmer le placement'),
                  )
                ],
              )
          ])
        ]));
  }
}
