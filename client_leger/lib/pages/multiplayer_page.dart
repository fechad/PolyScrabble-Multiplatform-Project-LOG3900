import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/pages/waiting_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';

import '../classes/constants.dart';
import '../components/sidebar.dart';
import '../config/flutter_flow/flutter_flow_theme.dart';
import '../main.dart';
import '../services/link_service.dart';

class MultiplayerPage extends StatefulWidget {
  const MultiplayerPage({super.key});

  @override
  State<MultiplayerPage> createState() => _MultiplayerPageState();
}

class _MultiplayerPageState extends State<MultiplayerPage> {
  FocusNode _focusNode = FocusNode();
  final scaffoldKey = GlobalKey<ScaffoldState>();
  final _formKey = GlobalKey<FormState>();
  String timeValue = '60';
  bool gameIsPublic = true;
  int difficultyValue = 2;
  List<String> difficulty = languageService.currentLanguage.languageCode == 'en'
      ? <String>['Beginner', 'Expert', 'Adaptable']
      : <String>['Débutant', 'Expert', 'Adaptatif'];
  List<String> language = <String>['Français', 'English'];
  int langValue = languageService.currentLanguage.languageCode == 'en' ? 1:0;
  String gameTypeValue = languageService.currentLanguage.languageCode == 'en'
      ? 'Public'
      : 'Publique';
  final TextEditingController _gamePasswordController = TextEditingController();
  bool _passwordVisible = false;
  List<String> gameType = languageService.currentLanguage.languageCode == 'en'
      ? <String>['Private', 'Public', 'Public with password']
      : <String>['Privée', 'Publique', 'Publique avec mot de passe'];

  @override
  void initState() {
    super.initState();
    gameService.gameData.timerPerTurn = timeValue;
    gameService.gameData.isExpertLevel = false;
    gameService.room.botsLevel = 'débutant';
    gameService.room.roomInfo.isPublic = gameIsPublic;
  }

  @override
  dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      key: scaffoldKey,
      drawer: const ChatDrawer(),
      body: Stack(
        children: <Widget>[
          Center(
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
                      height: MediaQuery.of(context).size.height * 0.70,
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
                                    .classicCreateMultiTitle,
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
                                        .classicCreateMultiVpDifficultyLabel),
                                onChanged: (String? value) {
                                  setState(() {
                                    //TODO change difficulty to language to send
                                    difficultyValue = difficulty.indexOf(value!);
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
                              height: 10,
                            ),
                            SizedBox(
                              width: 280,
                              child: DropdownButtonFormField<String>(
                                value: language[langValue],
                                icon: const Icon(Icons.keyboard_arrow_down),
                                elevation: 16,
                                decoration: InputDecoration(
                                    labelText: AppLocalizations.of(context)!
                                        .classicCreateMultiVpLanguageLabel),
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
                              height: 10,
                            ),
                            SizedBox(
                              width: 280,
                              child: DropdownButtonFormField<String>(
                                value: timeValue,
                                icon: const Icon(Icons.keyboard_arrow_down),
                                elevation: 16,
                                decoration: InputDecoration(
                                    labelText: AppLocalizations.of(context)!
                                        .classicCreateMultiTime),
                                onChanged: (String? value) {
                                  // This is called when the user selects an item.
                                  setState(() {
                                    timeValue = value!;
                                    gameService.gameData.timerPerTurn =
                                        timeValue;
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
                            SizedBox(height: 16),
                            SizedBox(
                              width: 280,
                              child: Column(children: [
                                DropdownButtonFormField<String>(
                                  value: gameTypeValue,
                                  icon: const Icon(Icons.keyboard_arrow_down),
                                  elevation: 16,
                                  decoration: InputDecoration(
                                      labelText: AppLocalizations.of(context)!
                                          .classicCreateMultiGameTypeLabel),
                                  onChanged: (String? value) {
                                    setState(() {
                                      gameTypeValue = value!;
                                      gameIsPublic = gameType.indexOf(value) > 0
                                          ? true
                                          : false;
                                    });
                                  },
                                  items: gameType.map<DropdownMenuItem<String>>(
                                      (String value) {
                                    return DropdownMenuItem<String>(
                                      value: value,
                                      child: Text(value),
                                    );
                                  }).toList(),
                                ),
                                SizedBox(height: 5),
                                gameType.indexOf(gameTypeValue) == 2
                                    ? TextFormField(
                                        focusNode: _focusNode,
                                        keyboardType: TextInputType.text,
                                        autofocus: true,
                                        controller: _gamePasswordController,
                                        obscureText:
                                            !_passwordVisible, //This will obscure text dynamically
                                        decoration: InputDecoration(
                                          hintText:
                                              AppLocalizations.of(context)!
                                                  .classicJoinMultiPopupInput,
                                          contentPadding:
                                              const EdgeInsets.symmetric(
                                                  vertical: 0.0,
                                                  horizontal: 10.0),
                                          enabledBorder:
                                              const OutlineInputBorder(
                                            borderSide: BorderSide(width: 1),
                                          ),
                                          focusedBorder:
                                              const OutlineInputBorder(
                                            borderSide: BorderSide(
                                                width: 1, color: Colors.black),
                                          ),
                                          suffixIcon: IconButton(
                                            icon: Icon(
                                              _passwordVisible
                                                  ? Icons.visibility
                                                  : Icons.visibility_off,
                                            ),
                                            onPressed: () {
                                              // Update the state i.e. toogle the state of passwordVisible variable
                                              setState(() {
                                                _passwordVisible =
                                                    !_passwordVisible;
                                              });
                                            },
                                          ),
                                        ),
                                      )
                                    : SizedBox(height: 50),
                              ]),
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
          CollapsingNavigationDrawer(),
        ],
      ),
    );
  }

  checkFormValues() {
    if (langValue == null || difficultyValue == null || timeValue == null) return 'Erreur';
    String language = 'french';
    String level = 'débutant';
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
    gameService.joinRoomMultiplayer(
        gameIsPublic, _gamePasswordController.text, level, language);
    Navigator.push(context, MaterialPageRoute(builder: ((context) {
      return WaitingPage(
          isObserver: false,
          roomName: gameService.room.roomInfo.name,
          timer: gameService.gameData.timerPerTurn,
          botsLevel: gameService.room.botsLevel!,
          players: gameService.room.players);
    })));
  }
}
