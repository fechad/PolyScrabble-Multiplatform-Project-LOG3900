import 'dart:async';

import 'package:client_leger/config/colors.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/home_page.dart';
import 'package:client_leger/pages/signup_page.dart';
import 'package:flutter/material.dart';

import '../config/flutter_flow/flutter_flow_theme.dart';
import '../services/http_service.dart';

final httpService = HttpService();

class ConnexionPageWidget extends StatefulWidget {
  const ConnexionPageWidget({Key? key}) : super(key: key);

  @override
  _ConnexionPageWidgetState createState() => _ConnexionPageWidgetState();
}

class _ConnexionPageWidgetState extends State<ConnexionPageWidget> {
  final _unfocusNode = FocusNode();
  final scaffoldKey = GlobalKey<ScaffoldState>();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  late List<String> usernames;
  final TextEditingController textController = TextEditingController();
  bool isWriting = false;
  bool validUsername = false;

  @override
  void initState() {
    super.initState();
    httpService.getUsernames().then((names) => {usernames = names});
  }

  @override
  void dispose() {
    _unfocusNode.dispose();
    super.dispose();
  }

  Future<bool> checkWithAvailableNames(String value) async {
    await httpService.getUsernames().then((names) => {usernames = names});
    if (usernames
        .toString()
        .toLowerCase()
        .contains('"${value?.toLowerCase()}"')) {
      return false;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: scaffoldKey,
      resizeToAvoidBottomInset: true,
      backgroundColor: Color(0xFFF9FFF6),
      body: SafeArea(
        child: GestureDetector(
          onTap: () => FocusScope.of(context).requestFocus(_unfocusNode),
          child: Align(
            alignment: AlignmentDirectional(0, 0),
            child: Material(
              color: Colors.transparent,
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              child: Container(
                width: MediaQuery.of(context).size.width * 0.35,
                height: MediaQuery.of(context).size.height * 0.50,
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
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Center(
                            child: Text(
                              'Connexion',
                              style: FlutterFlowTheme.of(context)
                                  .bodyText1
                                  .override(
                                    color: Colors.black,
                                    fontFamily: 'Nunito',
                                    fontSize: 24,
                                  ),
                            ),
                          ),
                          SizedBox(
                            height: 3,
                          ),
                          SizedBox(
                            width: 400,
                            child: TextFormField(
                              controller: emailController,
                              decoration: const InputDecoration(
                                hintText: 'Entrez votre adresse courriel',
                                labelText: 'Adresse courriel',
                              ),
                              // The validator receives the text that the user has entered.
                              validator: (value) {
                                checkWithAvailableNames(value!);
                                if (value == null || value.isEmpty) {
                                  return "Entrez un nom d'utilisateur valide";
                                }
                              },
                            ),
                          ),

                          SizedBox(
                            width: 400,
                            child: TextFormField(
                              obscureText: true,
                              controller: passwordController,
                              decoration: const InputDecoration(
                                hintText: 'Entrez votre mot de passe',
                                labelText: 'Mot de passe',
                              ),
                              // The validator receives the text that the user has entered.
                              validator: (value) {
                                checkWithAvailableNames(value!);
                                if (value == null || value.isEmpty) {
                                  return 'Entrez un mot de passe valide';
                                }
                              },
                            ),
                          ),
                          SizedBox(
                            width: 400,
                            height: 40,
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'Mot de passe oublié?',
                                  style: FlutterFlowTheme.of(context)
                                      .bodyText1
                                      .override(
                                        color: Color(0x80000000),
                                        fontFamily: 'Nunito',
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                      ),
                                ),
                                SizedBox(width: 4),
                                Text(
                                  'Cliquez ici',
                                  style: FlutterFlowTheme.of(context)
                                      .bodyText1
                                      .override(
                                        color: Color(0xFF7DAF6B),
                                        fontFamily: 'Nunito',
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                      ),
                                )
                              ],
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 20.0),
                            child: ElevatedButton(
                              onPressed: () {
                                // Validate returns true if the form is valid, or false otherwise.
                                if (_formKey.currentState!.validate()) {
                                  //loginUser(textController.text);
                                  authenticator
                                      .signInUser(emailController.text,
                                          passwordController.text)
                                      .then((value) => Navigator.of(context)
                                          .push(MaterialPageRoute(
                                              builder: (context) =>
                                                  //authenticator.setValidate();
                                                  MyHomePage(
                                                      title: 'PolyScrabble'))))
                                      .catchError((error) => ScaffoldMessenger
                                              .of(context)
                                          .showSnackBar(SnackBar(
                                              backgroundColor: Colors.redAccent,
                                              duration:
                                                  Duration(milliseconds: 1000),
                                              content: Text('Error: $error'))));

                                  ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                          duration:
                                              Duration(milliseconds: 1000),
                                          content: Text(
                                              'Vérification de la connexion ...')));
                                  Timer(const Duration(milliseconds: 1000),
                                      (() => {}));
                                }
                              },
                              style: ButtonStyle(
                                  shape: MaterialStatePropertyAll<
                                          RoundedRectangleBorder>(
                                      RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(48))),
                                  minimumSize: MaterialStateProperty.all(
                                      const Size(400, 50)),
                                  backgroundColor:
                                      const MaterialStatePropertyAll<Color>(
                                          Palette.mainColor)),
                              child: Text(
                                'Se connecter',
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
                          SizedBox(
                            width: 400,
                            child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  Text(
                                    'Pas encore inscrit?',
                                    style: FlutterFlowTheme.of(context)
                                        .bodyText1
                                        .override(
                                          color: Color(0x80000000),
                                          fontFamily: 'Nunito',
                                          fontSize: 20,
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                  SizedBox(width: 8),
                                  GestureDetector(
                                    onTap: () {
                                      Navigator.of(context).push(
                                          MaterialPageRoute(
                                              builder: (context) =>
                                                  SignupPageWidget()));
                                    },
                                    child: Text(
                                      "M'inscrire",
                                      style: FlutterFlowTheme.of(context)
                                          .bodyText1
                                          .override(
                                            color: Color(0xFF7DAF6B),
                                            fontFamily: 'Nunito',
                                            fontSize: 20,
                                            fontWeight: FontWeight.bold,
                                          ),
                                    ),
                                  ),
                                ]),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  void loginUser(String username) {
    if (username.isEmpty) return;
    //textController.clear();

    httpService.loginUser(username).then((value) => value.statusCode == 200
        ? navigate()
        : ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            backgroundColor: Colors.red[300],
            duration: const Duration(milliseconds: 1000),
            content: const Text('Erreur de connexion: nom déjà pris'))));

    setState(() {
      isWriting = false;
      usernames;
    });
  }

  void navigate() {
    validUsername = true;
    authenticator.setLoggedInEmail(emailController.text);
    chatService.joinDiscussion('General Chat');
    Navigator.push(context, MaterialPageRoute(builder: ((context) {
      return const MyHomePage(title: 'PolyScrabble');
    })));
  }
}
