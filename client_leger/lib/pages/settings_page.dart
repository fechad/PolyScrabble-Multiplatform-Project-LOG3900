import 'dart:convert';
import 'dart:io';

import 'package:camera/camera.dart';
import 'package:client_leger/classes/constants.dart';
import 'package:client_leger/classes/game.dart';
import 'package:client_leger/components/stats.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/signup_page.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';

import '../components/drawer.dart';
import '../components/historics.dart';
import '../components/sidebar.dart';
import '../config/colors.dart';

enum TheColor { dark, light }

enum Language { french, english }

class SettingsPage extends StatefulWidget {
  @override
  _SettingsPageState createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  TheColor? theme;
  Language? language;
  String victoryMusic = authenticator.currentUser.userSettings.victoryMusic;
  bool valuesChanged = false;
  String selectedUrl = authenticator.currentUser.userSettings.avatarUrl;
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController newPasswordController = TextEditingController();
  final TextEditingController confirmNewPasswordController =
      TextEditingController();

  late CameraDescription firstCamera;
  late CameraController _controller;
  late Future<void> _initializeControllerFuture;
  late AsyncSnapshot<void> snap;
  final ImagePicker _picker = ImagePicker();

  bool takingPicture = false;
  bool tookPicture = false;

  @override
  void initState() {
    super.initState();
    theme =
        authenticator.currentUser.userSettings.defaultTheme.contains('light')
            ? TheColor.light
            : TheColor.dark;
    language = authenticator.currentUser.userSettings.defaultLanguage
            .contains('french')
        ? Language.french
        : Language.english;
    getCameras();
  }

  @override
  void dispose() {
    super.dispose();
    _controller.dispose();
  }

  getCameras() async {
    // Obtain a list of the available cameras on the device.

    // Get a specific camera from the list of available cameras.
    if (cameras.isEmpty) return;
    firstCamera = cameras.first;
    _controller = CameraController(
      // Get a specific camera from the list of available cameras.
      firstCamera,
      // Define the resolution to use.
      ResolutionPreset.medium,
    );

    _initializeControllerFuture = _controller.initialize();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      drawer: const ChatDrawer(),
      body: Row(children: <Widget>[
        CollapsingNavigationDrawer(),
        SingleChildScrollView(
          child: Container(
              width: MediaQuery.of(context).size.width * 0.937,
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
                      authenticator.currentUser.userSettings.avatarUrl
                              .contains('/data/')
                          ? Container(
                              width: 78,
                              height: 78,
                              decoration: BoxDecoration(
                                  image: DecorationImage(
                                    image: FileImage(File(selectedUrl))
                                        as ImageProvider,
                                    fit: BoxFit.fill,
                                  ),
                                  shape: BoxShape.circle),
                            )
                          : CircleAvatar(
                              // TODO: Insérer l'url de l'avatar du joueur
                              backgroundImage: NetworkImage(
                                  '${authenticator.currentUser.userSettings.avatarUrl.isNotEmpty ? authenticator.currentUser.userSettings.avatarUrl : 'https://pbs.twimg.com/media/FS646o-UcAE3luS?format=jpg&name=large'}'),
                              radius: 50,
                            ),
                      Positioned(
                          // draw a red marble
                          top: 0.0,
                          left: 40.0,
                          child: MaterialButton(
                            onPressed: () => {
                              showDialog(
                                  context: context,
                                  builder: (context) {
                                    return StatefulBuilder(
                                        builder: ((context, setDialogState) {
                                      return AlertDialog(
                                        title: const Text(
                                          'Choisissez votre avatar',
                                          style: TextStyle(fontSize: 24),
                                        ),
                                        content: Container(
                                            height: 800,
                                            width: 600,
                                            child: Column(
                                              children: [
                                                tookPicture
                                                    ? Container(
                                                        width: 150,
                                                        height: 150,
                                                        decoration:
                                                            BoxDecoration(
                                                                image:
                                                                    DecorationImage(
                                                                  image: FileImage(
                                                                          File(
                                                                              selectedUrl))
                                                                      as ImageProvider,
                                                                  fit: BoxFit
                                                                      .fill,
                                                                ),
                                                                shape: BoxShape
                                                                    .circle),
                                                      )
                                                    : CircleAvatar(
                                                        // TODO: Insérer l'url de l'avatar du joueur
                                                        backgroundImage:
                                                            NetworkImage(
                                                                selectedUrl),
                                                        radius: 78,
                                                      ),
                                                GridView.builder(
                                                    shrinkWrap: true,
                                                    gridDelegate:
                                                        const SliverGridDelegateWithFixedCrossAxisCount(
                                                            crossAxisCount: 5,
                                                            mainAxisSpacing: 10,
                                                            crossAxisSpacing:
                                                                30,
                                                            mainAxisExtent:
                                                                130),
                                                    itemCount:
                                                        predefinedAvatarsUrl
                                                            .length,
                                                    itemBuilder: (_, index) {
                                                      return predefinedAvatarsUrl[
                                                                  index] ==
                                                              'custom'
                                                          ? GestureDetector(
                                                              onTap: () {},
                                                              child: Container(
                                                                width: 30,
                                                                height: 30,
                                                                decoration:
                                                                    const BoxDecoration(
                                                                  shape: BoxShape
                                                                      .circle,
                                                                  color: Colors
                                                                      .grey,
                                                                ),
                                                                child:
                                                                    IconButton(
                                                                  icon:
                                                                      const Icon(
                                                                    Icons
                                                                        .download,
                                                                    // color: Colors
                                                                    //     .black,
                                                                  ),
                                                                  onPressed:
                                                                      () async {
                                                                    // Take the Picture in a try / catch block. If anything goes wrong,
                                                                    // catch the error.
                                                                    try {
                                                                      // Ensure that the camera is initialized.
                                                                      await _initializeControllerFuture;

                                                                      // Attempt to take a picture and then get the location
                                                                      // where the image file is saved.

                                                                      final image =
                                                                          await _picker.pickImage(
                                                                              source: ImageSource.camera);
                                                                      setState(
                                                                          () {
                                                                        setDialogState(
                                                                            () {
                                                                          selectedUrl =
                                                                              image!.path;
                                                                          tookPicture =
                                                                              true;
                                                                        });
                                                                      });
                                                                    } catch (e) {
                                                                      // If an error occurs, log the error to the console.
                                                                      print(e);
                                                                    }
                                                                  },
                                                                ),
                                                              ),
                                                            )
                                                          : GestureDetector(
                                                              onTap: () {
                                                                setDialogState(
                                                                    () {
                                                                  selectedUrl =
                                                                      predefinedAvatarsUrl[
                                                                          index];
                                                                });
                                                              },
                                                              child:
                                                                  CircleAvatar(
                                                                // TODO: Insérer l'url de l'avatar du joueur
                                                                backgroundImage:
                                                                    NetworkImage(
                                                                        predefinedAvatarsUrl[
                                                                            index]),
                                                                radius: 5,
                                                              ));
                                                    }),
                                              ],
                                            )),
                                        actions: [
                                          TextButton(
                                            onPressed: () => {
                                              setState(() {
                                                selectedUrl = authenticator
                                                    .currentUser
                                                    .userSettings
                                                    .avatarUrl;
                                                takingPicture = false;
                                                tookPicture = false;
                                                Navigator.pop(context);
                                              })
                                            },
                                            style: TextButton.styleFrom(
                                                foregroundColor: Colors.red),
                                            child: const Text('Annuler',
                                                style: TextStyle(fontSize: 20)),
                                          ),
                                          TextButton(
                                            onPressed: () => {
                                              setState(() {
                                                authenticator
                                                    .currentUser
                                                    .userSettings
                                                    .avatarUrl = selectedUrl;

                                                valuesChanged = true;
                                                Navigator.pop(context);
                                                tookPicture = false;
                                              })
                                            },
                                            style: TextButton.styleFrom(
                                                foregroundColor: themeManager
                                                            .themeMode ==
                                                        ThemeMode.light
                                                    ? Color.fromARGB(
                                                        255, 125, 175, 107)
                                                    : Color.fromARGB(
                                                        255, 121, 101, 220)),
                                            child: const Text(
                                              'Sauvegarder',
                                              style: TextStyle(fontSize: 20),
                                            ),
                                          )
                                        ],
                                      );
                                    }));
                                  })
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
                            theme = value!;
                            themeManager.switchThemeMode();
                            valuesChanged = true;
                          });
                        },
                      ),
                      const Text('Sombre'),
                      Radio(
                        value: TheColor.light,
                        groupValue: theme,
                        onChanged: (TheColor? value) {
                          setState(() {
                            theme = value!;
                            themeManager.switchThemeMode();
                            valuesChanged = true;
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
                            language = value!;
                            valuesChanged = true;
                          });
                        },
                      ),
                      const Text('Français'),
                      Radio(
                        value: Language.english,
                        groupValue: language,
                        onChanged: (Language? value) {
                          setState(() {
                            language = value!;
                            valuesChanged = true;
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
                          icon: const Icon(Icons.keyboard_arrow_down),
                          elevation: 16,
                          underline: Container(
                            height: 1,
                            color: Colors.black,
                          ),
                          onChanged: (String? value) {
                            // This is called when the user selects an item.
                            setState(() {
                              // TODO: Set victory music to selected choice
                              victoryMusic = value!;
                              valuesChanged = true;
                            });
                          },
                          value: victoryMusic,
                          items: music
                              .map<DropdownMenuItem<String>>((String value) {
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
                                    height: 300,
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
                                      const SizedBox(
                                        height: 50,
                                      ),
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.end,
                                        children: [
                                          TextButton(
                                            onPressed: () => {
                                              setState(() {
                                                //letterIndexesToExchange.clear();
                                                //linkService.resetRack();
                                                Navigator.pop(context);
                                              })
                                            },
                                            style: TextButton.styleFrom(
                                                foregroundColor: Colors.red),
                                            child: const Text('Annuler',
                                                style: TextStyle(fontSize: 14)),
                                          ),
                                          TextButton(
                                            onPressed: () => {
                                              setState(() {
                                                //TODO: change password
                                                Navigator.pop(context);
                                              })
                                            },
                                            style: TextButton.styleFrom(
                                                foregroundColor: themeManager
                                                            .themeMode ==
                                                        ThemeMode.light
                                                    ? Color.fromARGB(
                                                        255, 125, 175, 107)
                                                    : Color.fromARGB(
                                                        255, 121, 101, 220)),
                                            child: const Text(
                                              'Sauvegarder',
                                              style: TextStyle(fontSize: 14),
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
                        onPressed: !valuesChanged
                            ? null
                            : () => {
                                  setState(() {
                                    authenticator.currentUser.userSettings =
                                        UserSettings(
                                            avatarUrl: selectedUrl,
                                            defaultLanguage: language
                                                .toString()
                                                .split('.')[1],
                                            defaultTheme:
                                                theme.toString().split('.')[1],
                                            victoryMusic: victoryMusic);

                                    httpService
                                        .updateUserSettings(
                                            authenticator.currentUser.email,
                                            authenticator.currentUser)
                                        .then((response) {
                                      if (response.statusCode == 500) {
                                        return;
                                      } else if (response.statusCode == 404) {
                                        return;
                                      }
                                      final account = Account.fromJson(
                                          jsonDecode(response.body));
                                      authenticator.currentUser = account;
                                      setState(() {
                                        valuesChanged = false;
                                      });
                                    }).catchError((error) => {print(error)});
                                  })
                                },
                        style: ButtonStyle(backgroundColor:
                            MaterialStateProperty.resolveWith<Color>(
                                (Set<MaterialState> states) {
                          if (valuesChanged)
                            return themeManager.themeMode == ThemeMode.light
                                ? Color.fromARGB(255, 125, 175, 107)
                                : Color.fromARGB(255, 121, 101, 220);
                          else
                            return themeManager.themeMode == ThemeMode.light
                                ? Colors.grey
                                : Color.fromARGB(255, 70, 38, 117);
                        })),
                        child: const Text('Sauvegarder'),
                      ),
                    ],
                  ),
                  Stats(),
                  SizedBox(
                    height: 72,
                  ),
                  Text("Historiques",
                      style: GoogleFonts.nunito(
                        textStyle: const TextStyle(
                            fontSize: 32, fontWeight: FontWeight.bold),
                      )),
                  SizedBox(
                    height: 30,
                  ),
                  Historics(),
                  SizedBox(
                    height: 64,
                  )
                ],
              )),
        )
      ]),
    );
  }
}
