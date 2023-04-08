import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';

import '../classes/constants.dart';
import '../classes/game.dart';
import '../components/sidebar.dart';
import '../config/flutter_flow/flutter_flow_theme.dart';
import '../services/link_service.dart';
import '../services/solo_game_service.dart';
import 'game_page.dart';

final soloGameService = SoloGameService(
    gameData: GameData(
        pseudo: authenticator.currentUser.username,
        dictionary: 'français',
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
  String virtualValue = 'Simon';
  int difficultyValue = 2;
  List<String> language = <String>['Français', 'English'];
  int langValue = languageService.currentLanguage.languageCode == 'en' ? 1:0;
  String timeValue = '60';
  List<String> difficulty = languageService.currentLanguage.languageCode == 'en'
      ? <String>['Beginner', 'Expert', 'Adaptable']
      : <String>['Débutant', 'Expert', 'Adaptatif'];
  @override
  void initState() {
    super.initState();
    soloGameService.configureBaseSocketFeatures();
    gameService.gameData.timerPerTurn = timeValue.toString();
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
                SizedBox(height: 20),
                SafeArea(
                  child: Material(
                    color: Colors.transparent,
                    elevation: 2,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Container(
                      width: MediaQuery.of(context).size.width * 0.30,
                      height: MediaQuery.of(context).size.height * 0.65,
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
                                AppLocalizations.of(context)!
                                    .classicCreateSoloTitle,
                                style: FlutterFlowTheme.of(context)
                                    .bodyText1
                                    .override(
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
                                decoration: InputDecoration(
                                    labelText: AppLocalizations.of(context)!
                                        .classicCreateSoloVpName),
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
                                value: difficulty[difficultyValue],
                                icon: const Icon(Icons.keyboard_arrow_down),
                                elevation: 16,
                                decoration: InputDecoration(
                                    labelText: AppLocalizations.of(context)!
                                        .classicCreateSoloVpDifficultyLabel),
                                onChanged: (String? value) {
                                  // This is called when the user selects an item.
                                  setState(() {
                                    difficultyValue =
                                        difficulty.indexOf(value!);
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
                                value: language[langValue],
                                icon: const Icon(Icons.keyboard_arrow_down),
                                elevation: 16,
                                decoration: InputDecoration(
                                    labelText: AppLocalizations.of(context)!
                                        .classicCreateSoloVpLanguageLabel),
                                onChanged: (String? value) {
                                  setState(() {
                                    //TODO change difficulty to language to send
                                    langValue = language.indexOf(value!);
                                  });
                                },
                                items: language.map<DropdownMenuItem<String>>(
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
                                value: timeValue.toString(),
                                icon: const Icon(Icons.keyboard_arrow_down),
                                elevation: 16,
                                decoration: InputDecoration(
                                    labelText: AppLocalizations.of(context)!
                                        .classicCreateSoloTime),
                                onChanged: (String? value) {
                                  // This is called when the user selects an item.
                                  setState(() {
                                    timeValue = value!;
                                    gameService.gameData.timerPerTurn = value;
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
                                  const EdgeInsets.symmetric(vertical: 25.0),
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
                                    backgroundColor: MaterialStatePropertyAll<
                                        Color>(themeManager.themeMode ==
                                            ThemeMode.light
                                        ? Color.fromARGB(255, 125, 175, 107)
                                        : Color.fromARGB(255, 121, 101, 220))),
                                child: Text(
                                  AppLocalizations.of(context)!
                                      .createGameButton,
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
    if (virtualValue == null || difficultyValue == null || langValue == null || timeValue == null)
      return 'Erreur';
    String level = 'débutant';
    String language = 'french';
    if (langValue == 0) {
      language = 'french';
    }
    else if (langValue == 1) {
      language = 'english';
    }
    if (difficultyValue == 0) {
      level = 'débutant';
    } else if (difficultyValue == 1) {
      level = 'expert';
    } else if (difficultyValue == 2) {
      level = 'adaptatif';
    }
    soloGameService.joinRoom(virtualValue, level, language);
    Navigator.push(context, MaterialPageRoute(builder: ((context) {
      return GamePageWidget();
    })));
  }
}
