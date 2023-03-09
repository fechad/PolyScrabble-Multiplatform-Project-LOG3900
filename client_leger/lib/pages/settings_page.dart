import 'package:client_leger/classes/constants.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../components/drawer.dart';
import '../components/sidebar.dart';
import '../config/colors.dart';

enum TheColor { dark, light }

enum Language { french, english }

class SettingsPage extends StatefulWidget {
  @override
  _SettingsPageState createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  TheColor? theme = TheColor.light;
  Language? language = Language.french;
  String? victoryMusic;
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController newPasswordController = TextEditingController();
  final TextEditingController confirmNewPasswordController =
      TextEditingController();
  @override
  void initState() {
    super.initState();
    //TODO: call database / get user data
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      drawer: const ChatDrawer(),
      body: Row(children: <Widget>[
        CollapsingNavigationDrawer(),
        Container(
            width: MediaQuery.of(context).size.width * 0.937,
            height: MediaQuery.of(context).size.height,
            child: Column(
              children: [
                const SizedBox(height: 50),
                Text('Settings',
                    style: GoogleFonts.nunito(
                      textStyle: const TextStyle(
                          fontSize: 40, fontWeight: FontWeight.bold),
                    )),
                Stack(
                  children: [
                    const CircleAvatar(
                      // TODO: Insérer l'url de l'avatar du joueur
                      backgroundImage: NetworkImage(
                          'https://www.woolha.com/media/2020/03/eevee.png'),
                      radius: 50,
                    ),
                    Positioned(
                        // draw a red marble
                        top: 0.0,
                        left: 40.0,
                        child: MaterialButton(
                          onPressed: () {
                            print('Avatar button pressed ');
                          },
                          color: Colors.grey,
                          textColor: Colors.white,
                          child: const Icon(
                            Icons.edit,
                            size: 24,
                          ),
                          padding: const EdgeInsets.all(0),
                          shape: const CircleBorder(),
                        )),
                  ],
                ),
                const SizedBox(height: 50),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    const Text('Thème de couleur'),
                    Radio(
                      value: TheColor.dark,
                      groupValue: theme,
                      onChanged: (TheColor? value) {
                        setState(() {
                          theme = value;
                        });
                      },
                    ),
                    const Text('Sombre'),
                    Radio(
                      value: TheColor.light,
                      groupValue: theme,
                      onChanged: (TheColor? value) {
                        setState(() {
                          theme = value;
                        });
                      },
                    ),
                    const Text('Clair')
                  ],
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    const SizedBox(width: 25),
                    const Text('Language'),
                    const SizedBox(width: 42),
                    Radio(
                      value: Language.french,
                      groupValue: language,
                      onChanged: (Language? value) {
                        setState(() {
                          language = value;
                        });
                      },
                    ),
                    const Text('Français'),
                    Radio(
                      value: Language.english,
                      groupValue: language,
                      onChanged: (Language? value) {
                        setState(() {
                          language = value;
                        });
                      },
                    ),
                    const Text('English'),
                  ],
                ),
                Container(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(width: 30),
                      const Text('Musique de victoire'),
                      const SizedBox(width: 10),
                      DropdownButton<String>(
                        hint: Container(
                          width: 150,
                          child: const Text(
                            " Choisir de musique",
                            style: TextStyle(
                                color: Palette.mainColor, fontSize: 16),
                            textAlign: TextAlign.start,
                          ),
                        ),
                        value: victoryMusic,
                        icon: const Icon(Icons.keyboard_arrow_down),
                        elevation: 16,
                        style: const TextStyle(color: Colors.black),
                        underline: Container(
                          height: 1,
                          color: Colors.black,
                        ),
                        onChanged: (String? value) {
                          // This is called when the user selects an item.
                          setState(() {
                            victoryMusic = value!;
                            // TODO: Set victory music to selected choice
                            //gameService.gameData.timerPerTurn = value;
                          });
                        },
                        items:
                            music.map<DropdownMenuItem<String>>((String value) {
                          return DropdownMenuItem<String>(
                            value: value,
                            child: Text(value),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 50),
                ElevatedButton(
                  onPressed: () => {
                    showDialog(
                        context: context,
                        builder: (context) {
                          return AlertDialog(
                              title: const Text('Changement de mot de passe'),
                              content: Container(
                                  height: 250,
                                  width: 400,
                                  child: Column(children: [
                                    TextFormField(
                                      controller: passwordController,
                                      obscureText: true,
                                      decoration: const InputDecoration(
                                        hintText: '',
                                        labelText: 'Ancien mot de passe',
                                      ),
                                    ),
                                    TextFormField(
                                      controller: passwordController,
                                      obscureText: true,
                                      decoration: const InputDecoration(
                                        hintText: '',
                                        labelText: 'Nouveau mot de passe',
                                      ),
                                    ),
                                    TextFormField(
                                      controller: passwordController,
                                      obscureText: true,
                                      decoration: const InputDecoration(
                                        hintText: '',
                                        labelText:
                                            'Confirmez votre nouveau mot de passe',
                                      ),
                                    ),
                                    SizedBox(
                                      height: 20,
                                    ),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        TextButton(
                                          onPressed: () => {
                                            setState(() {
                                              //letterIndexesToExchange.clear();
                                              //linkService.resetRack();
                                            })
                                          },
                                          style: TextButton.styleFrom(
                                              foregroundColor: Colors.red),
                                          child: Text('Annuler',
                                              style: TextStyle(fontSize: 20)),
                                        ),
                                        TextButton(
                                          onPressed: () => {
                                            setState(() {
                                              //letterIndexesToExchange.clear();
                                              //linkService.resetRack();
                                            })
                                          },
                                          style: TextButton.styleFrom(
                                              foregroundColor:
                                                  Palette.mainColor),
                                          child: Text(
                                            'Sauvegarder',
                                            style: TextStyle(fontSize: 20),
                                          ),
                                        )
                                      ],
                                    )
                                  ])));
                        })
                  },
                  style: const ButtonStyle(
                      backgroundColor: MaterialStatePropertyAll<Color>(
                          Color.fromARGB(255, 73, 132, 241))),
                  child: const Text('Modifier le mot de passe'),
                ),
                const SizedBox(
                  height: 100,
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(
                      width: 600,
                    ),
                    ElevatedButton(
                      onPressed: () => {
                        setState(() {
                          //letterIndexesToExchange.clear();
                          //linkService.resetRack();
                        })
                      },
                      style: const ButtonStyle(
                          backgroundColor: MaterialStatePropertyAll<Color>(
                              Palette.mainColor)),
                      child: const Text('Sauvegarder'),
                    ),
                  ],
                )
              ],
            )),
      ]),
    );
  }
}
