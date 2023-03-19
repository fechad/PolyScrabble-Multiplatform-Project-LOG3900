import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/main.dart';
import 'package:flutter/material.dart';

import '../classes/constants.dart';
import '../classes/game.dart';
import '../components/sidebar.dart';
import '../config/colors.dart';
import '../config/flutter_flow/flutter_flow_theme.dart';
import '../services/link_service.dart';
import '../services/solo_game_service.dart';
import 'game_page.dart';

final soloGameService = SoloGameService(
    gameData: GameData(
        pseudo: authenticator.currentUser.username,
        dictionary: 'dictionnaire par défaut',
        timerPerTurn: '',
        botName: '',
        isExpertLevel: false));

class SoloPage extends StatefulWidget {
  const SoloPage({super.key});

  @override
  State<SoloPage> createState() => _SoloPageState();
}

class _SoloPageState extends State<SoloPage> {
  final scaffoldKey = GlobalKey<ScaffoldState>();
  final _formKey = GlobalKey<FormState>();
  String virtualValue = 'A';
  String difficultyValue = 'Débutant';
  String timeValue = '30';

  @override
  void initState() {
    super.initState();
    soloGameService.configureBaseSocketFeatures();
    gameService.gameData.timerPerTurn = timeValue;
    gameService.room.roomInfo.timerPerTurn = timeValue;
    gameService.gameData.isExpertLevel = false;
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: Colors.white,
      drawer: const ChatDrawer(),
      body: Stack(children: <Widget>[
        Container(
          child: Center(
            // Center is a layout widget. It takes a single child and positions it
            // in the middle of the parent.
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: <Widget>[
                Align(
                  alignment: Alignment.topCenter,
                  child: Image.asset(
                    "assets/images/scrabble_hero.png",
                  ),
                ),
                SizedBox(height: 60),
                SafeArea(
                  child: Material(
                    color: Colors.transparent,
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Container(
                      width: MediaQuery.of(context).size.width * 0.30,
                      height: MediaQuery.of(context).size.height * 0.55,
                      decoration: BoxDecoration(
                        color: FlutterFlowTheme.of(context).secondaryBackground,
                        boxShadow: [
                          BoxShadow(
                            blurRadius: 4,
                            color: Color(0x33000000),
                            offset: Offset(0, 2),
                          )
                        ],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: Color(0x40404040),
                        ),
                      ),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            SizedBox(
                              height: 24,
                            ),
                            Center(
                              child: Text(
                                'Partie Solo',
                                style: FlutterFlowTheme.of(context)
                                    .bodyText1
                                    .override(
                                  color: Colors.black,
                                  fontFamily: 'Nunito',
                                  fontSize: 24,
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ),
                            SizedBox(
                              height: 6,
                            ),
                            SizedBox(
                              width: 280,
                              child: DropdownButtonFormField<String>(
                                value: virtualValue,
                                icon: const Icon(Icons.keyboard_arrow_down),
                                elevation: 16,
                                style: const TextStyle(color: Colors.black),
                                decoration: InputDecoration(labelText: "Nom du joueur virtuel"),
                                onChanged: (String? value) {
                                  // This is called when the user selects an item.
                                  setState(() {
                                    virtualValue = value!;
                                    gameService.gameData.botName = value;
                                  });
                                },
                                items: virtualPlayers
                                    .map<DropdownMenuItem<String>>(
                                        (String value) {
                                      return DropdownMenuItem<String>(
                                        value: value,
                                        child: Text(value),
                                      );
                                    }).toList(),
                              ),
                            ),
                            SizedBox(
                              height: 20,
                            ),
                            SizedBox(
                              width: 280,
                              child: DropdownButtonFormField<String>(
                                value: difficultyValue,
                                icon: const Icon(Icons.keyboard_arrow_down),
                                elevation: 16,
                                style: const TextStyle(color: Colors.black),
                                decoration: InputDecoration(labelText: "Difficulté du joueur virtuel"),
                                onChanged: (String? value) {
                                  // This is called when the user selects an item.
                                  setState(() {
                                    difficultyValue = value!;
                                    bool val = value == "Expert" ? true : false;
                                    gameService.gameData.isExpertLevel =
                                        val;
                                  });
                                },
                                items: difficulty.map<DropdownMenuItem<String>>(
                                        (String value) {
                                      return DropdownMenuItem<String>(
                                        value: value,
                                        child: Text(value),
                                      );
                                    }).toList(),
                              ),
                            ),
                            SizedBox(
                              height: 20,
                            ),
                            SizedBox(
                              width: 280,
                              child: DropdownButtonFormField<String>(
                                value: timeValue,
                                icon: const Icon(Icons.keyboard_arrow_down),
                                elevation: 16,
                                style: const TextStyle(color: Colors.black),
                                decoration: InputDecoration(labelText: "Temps par tour (en secondes)"),
                                onChanged: (String? value) {
                                  // This is called when the user selects an item.
                                  setState(() {
                                    timeValue = value!;
                                    gameService.gameData.timerPerTurn =
                                        value;
                                    gameService.room.roomInfo.timerPerTurn =
                                        value;
                                  });
                                },
                                items: time.map<DropdownMenuItem<String>>(
                                        (String value) {
                                      return DropdownMenuItem<String>(
                                        value: value,
                                        child: Text(value),
                                      );
                                    }).toList(),
                              ),
                            ),
                            Padding(
                              padding:
                              const EdgeInsets.symmetric(vertical: 30.0),
                              child: ElevatedButton(
                                onPressed: () {
                                  checkFormValues();
                                },
                                style: ButtonStyle(
                                    shape: MaterialStatePropertyAll<
                                        RoundedRectangleBorder>(
                                        RoundedRectangleBorder(
                                            borderRadius:
                                            BorderRadius.circular(8))),
                                    minimumSize: MaterialStateProperty.all(
                                        const Size(300, 50)),
                                    backgroundColor:
                                    const MaterialStatePropertyAll<Color>(
                                        Palette.mainColor)),
                                child: Text(
                                  'Créer la partie',
                                  style: FlutterFlowTheme.of(context)
                                      .bodyText1
                                      .override(
                                    color: Colors.white,
                                    fontFamily: 'Nunito',
                                    fontSize: 24,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        CollapsingNavigationDrawer(),
      ]),
    );
  }

  checkFormValues() {
    if (virtualValue == null || difficultyValue == null || timeValue == null)
      return 'Erreur';
    soloGameService.joinRoom(virtualValue, difficultyValue);
    Navigator.push(context, MaterialPageRoute(builder: ((context) {
      return GamePageWidget();
    })));
  }
}

