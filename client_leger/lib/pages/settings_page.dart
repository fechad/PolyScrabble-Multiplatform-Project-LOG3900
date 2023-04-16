import 'dart:convert';
import 'dart:io';

import 'package:camera/camera.dart';
import 'package:client_leger/classes/constants.dart';
import 'package:client_leger/components/stats.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/signup_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';

import '../classes/game.dart';
import '../components/drawer.dart';
import '../components/historics.dart';
import '../components/sidebar.dart';
import '../config/colors.dart';
import '../services/link_service.dart';
import 'forgot_password_page.dart' hide httpService;

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
  // final TextEditingController passwordController = TextEditingController();
  // final TextEditingController newPasswordController = TextEditingController();
  // final TextEditingController confirmNewPasswordController =
  //     TextEditingController();
  final TextEditingController usernameController = TextEditingController();
  // final _formKey = GlobalKey<FormState>();

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
    usernameController.text = authenticator.currentUser.username;
    SchedulerBinding.instance.addPostFrameCallback((_) => {
          languageService.switchLanguage(authenticator
                  .currentUser.userSettings.defaultLanguage
                  .contains('french')
              ? 'fr'
              : 'en'),
          themeManager.setThemeMode(authenticator
              .currentUser.userSettings.defaultTheme
              .contains('dark'))
        });
    selectedUrl = authenticator.currentUser.userSettings.avatarUrl;
    getCameras();
    usernameController.addListener(() {
      if (usernameController.text != authenticator.getCurrentUser().username &&
          usernameController.text.isNotEmpty) {
        valuesChanged = true;
      }
    });
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

  uploadFile() async {
    final response = await httpService.getCloudinarySignature();
    final signature = jsonDecode(response.body);

    var data = new Map<dynamic, dynamic>();
    data['file'] = File(selectedUrl);
    data['api_key'] = signature['apiKey'];
    data['timestamp'] = signature['timestamp'].toString();
    data['signature'] = signature['signature'];

    final uploadResponse = await httpService.uploadFile(data);

    if (uploadResponse.toString().isEmpty) return;

    selectedUrl = jsonDecode(uploadResponse.body)['url'];
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
                  Text(AppLocalizations.of(context)!.settingsPageTitle,
                      style: GoogleFonts.nunito(
                        textStyle: const TextStyle(
                            fontSize: 40, fontWeight: FontWeight.bold),
                      )),
                  Stack(
                    children: [
                      selectedUrl.contains('/data/')
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
                                  '${selectedUrl.isNotEmpty ? selectedUrl : 'https://pbs.twimg.com/media/FS646o-UcAE3luS?format=jpg&name=large'}'),
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
                                        title: Text(
                                          AppLocalizations.of(context)!
                                              .settingsPageAvatarTitle,
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
                                                                        .camera_alt,
                                                                    size: 60,
                                                                    // color: Colors
                                                                    //     .black,
                                                                  ),
                                                                  onPressed:
                                                                      () async {
                                                                    showDialog(
                                                                        context:
                                                                            context,
                                                                        builder:
                                                                            (context) {
                                                                          return AlertDialog(
                                                                              title: null,
                                                                              actions: [
                                                                                Center(
                                                                                  child: FloatingActionButton(
                                                                                    // Provide an onPressed callback.
                                                                                    onPressed: () async {
                                                                                      // Take the Picture in a try / catch block. If anything goes wrong,
                                                                                      // catch the error.
                                                                                      try {
                                                                                        // Ensure that the camera is initialized.
                                                                                        await _initializeControllerFuture;

                                                                                        // Attempt to take a picture and then get the location
                                                                                        // where the image file is saved.
                                                                                        final image = await _controller.takePicture();

                                                                                        Navigator.pop(context);
                                                                                        setState(() {
                                                                                          setDialogState(() {
                                                                                            selectedUrl = image.path;
                                                                                            tookPicture = true;
                                                                                          });
                                                                                        });
                                                                                      } catch (e) {
                                                                                        // If an error occurs, log the error to the console.
                                                                                        print(e);
                                                                                      }
                                                                                    },
                                                                                    child: const Icon(Icons.camera_alt),
                                                                                  ),
                                                                                )
                                                                              ],
                                                                              content: Container(
                                                                                  height: 300,
                                                                                  width: 400,
                                                                                  child: FutureBuilder<void>(
                                                                                    future: _initializeControllerFuture,
                                                                                    builder: (context, snapshot) {
                                                                                      if (snapshot.connectionState == ConnectionState.done) {
                                                                                        // If the Future is complete, display the preview.
                                                                                        return CameraPreview(_controller);
                                                                                      } else {
                                                                                        // Otherwise, display a loading indicator.
                                                                                        return const Center(child: CircularProgressIndicator());
                                                                                      }
                                                                                    },
                                                                                  )));
                                                                        });
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
                                            child: Text(
                                                AppLocalizations.of(context)!
                                                    .cancel,
                                                style: TextStyle(fontSize: 20)),
                                          ),
                                          TextButton(
                                            onPressed: () => {
                                              setState(() {
                                                // authenticator
                                                //     .currentUser
                                                //     .userSettings
                                                //     .avatarUrl = selectedUrl;

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
                                            child: Text(
                                              AppLocalizations.of(context)!
                                                  .save,
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
                  Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    SizedBox(
                      height: 40,
                      width: 200,
                      child: TextFormField(
                        textAlign: TextAlign.center,
                        maxLength: 10,
                        style: const TextStyle(
                            fontSize: 30, fontWeight: FontWeight.bold),
                        controller: usernameController,
                        decoration: InputDecoration(
                            hintText: authenticator.getCurrentUser().username,
                            hintStyle: const TextStyle(
                                fontSize: 30, fontWeight: FontWeight.bold)),
                      ),
                    )
                  ]),
                  const SizedBox(height: 35),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: <Widget>[
                      Text(
                          AppLocalizations.of(context)!.settingsPageThemeLabel),
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
                      Text(AppLocalizations.of(context)!.settingsPageDark),
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
                      Text(AppLocalizations.of(context)!.settingsPageLight)
                    ],
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: <Widget>[
                      const SizedBox(width: 25),
                      Text(AppLocalizations.of(context)!.languageSectionLabel),
                      const SizedBox(width: 42),
                      Radio(
                        value: Language.french,
                        groupValue: language,
                        onChanged: (Language? value) {
                          setState(() {
                            language = value!;
                            languageService.switchLanguage('fr');
                            valuesChanged = true;
                          });
                        },
                      ),
                      Text(AppLocalizations.of(context)!.languageSectionFrench),
                      Radio(
                        value: Language.english,
                        groupValue: language,
                        onChanged: (Language? value) {
                          setState(() {
                            language = value!;
                            languageService.switchLanguage('en');
                            valuesChanged = true;
                          });
                        },
                      ),
                      Text(
                          AppLocalizations.of(context)!.languageSectionEnglish),
                    ],
                  ),
                  Container(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const SizedBox(width: 30),
                        Text(AppLocalizations.of(context)!.musicSectionLabel),
                        const SizedBox(width: 10),
                        DropdownButton<String>(
                          hint: Container(
                            width: 150,
                            child: Text(
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
                                title: Text(AppLocalizations.of(context)!
                                    .settingsPagePassword),
                                content: Form(
                                    child: Container(
                                        height: 136,
                                        width: 400,
                                        child: Column(children: [
                                          Text(AppLocalizations.of(context)!
                                              .passwordMessage),
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
                                                    foregroundColor:
                                                        Colors.red),
                                                child: Text(
                                                    AppLocalizations.of(
                                                            context)!
                                                        .cancel,
                                                    style: TextStyle(
                                                        fontSize: 18)),
                                              ),
                                              TextButton(
                                                onPressed: () async {
                                                  try {
                                                    themeManager
                                                        .setThemeMode(false);

                                                    await httpService.logoutUser(
                                                        authenticator
                                                            .getCurrentUser()
                                                            .username);
                                                    socketService
                                                        .send('logOut');
                                                    Navigator.push(context,
                                                        MaterialPageRoute(
                                                            builder:
                                                                ((context) {
                                                      return ForgotPasswordPageWidget();
                                                    })));
                                                  } catch (error) {
                                                    ScaffoldMessenger.of(
                                                            context)
                                                        .showSnackBar(SnackBar(
                                                            backgroundColor:
                                                                Colors
                                                                    .redAccent,
                                                            duration: Duration(
                                                                milliseconds:
                                                                    1000),
                                                            content: Text(
                                                                'Error: $error')));
                                                  }
                                                },
                                                style: TextButton.styleFrom(
                                                    foregroundColor: themeManager
                                                                .themeMode ==
                                                            ThemeMode.light
                                                        ? Color.fromARGB(
                                                            255, 125, 175, 107)
                                                        : Color.fromARGB(255,
                                                            121, 101, 220)),
                                                child: Text(
                                                  AppLocalizations.of(context)!
                                                      .confirm,
                                                  style:
                                                      TextStyle(fontSize: 18),
                                                ),
                                              )
                                            ],
                                          )
                                        ]))));
                            ;
                          })
                    },
                    style: const ButtonStyle(
                        backgroundColor: MaterialStatePropertyAll<Color>(
                            Color.fromARGB(255, 73, 132, 241))),
                    child: Text(
                        AppLocalizations.of(context)!.settingsPagePassword),
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
                            : () async => {
                                  if (selectedUrl.contains('/data/'))
                                    {
                                      await uploadFile(),
                                    },
                                  setState(() {
                                    final settings = UserSettings(
                                        avatarUrl: selectedUrl,
                                        defaultLanguage:
                                            language.toString().split('.')[1],
                                        defaultTheme:
                                            theme.toString().split('.')[1],
                                        victoryMusic: victoryMusic);
                                    final account = Account(
                                        username: usernameController.text,
                                        email: authenticator.currentUser.email,
                                        userSettings: settings,
                                        progressInfo: authenticator
                                            .currentUser.progressInfo,
                                        highScores: authenticator
                                            .currentUser.highScores,
                                        badges:
                                            authenticator.currentUser.badges,
                                        bestGames:
                                            authenticator.currentUser.bestGames,
                                        gamesPlayed: authenticator
                                            .currentUser.gamesPlayed,
                                        gamesWon:
                                            authenticator.currentUser.gamesWon);
                                    httpService
                                        .updateUserSettings(
                                            authenticator.currentUser.email,
                                            account)
                                        .then((response) {
                                      if (response.statusCode == 200) {
                                        authenticator.currentUser.userSettings =
                                            settings;
                                        authenticator.currentUser.username =
                                            usernameController.text
                                                .toLowerCase();
                                      } else if (response.statusCode == 500) {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(SnackBar(
                                                backgroundColor:
                                                    Colors.redAccent,
                                                duration: Duration(
                                                    milliseconds: 1000),
                                                content: Text(
                                                    AppLocalizations.of(
                                                            context)!
                                                        .userNameError)));
                                        return;
                                      } else if (response.statusCode == 404) {
                                        return;
                                      }
                                      final account = Account.fromJson(
                                          jsonDecode(response.body));
                                      authenticator.currentUser = account;
                                      setState(() {
                                        valuesChanged = false;
                                        selectedUrl = authenticator
                                            .currentUser.userSettings.avatarUrl;
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
                        child: Text(AppLocalizations.of(context)!.save),
                      ),
                    ],
                  ),
                  Stats(),
                  SizedBox(
                    height: 72,
                  ),
                  Text(AppLocalizations.of(context)!.historySectionTitle,
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
