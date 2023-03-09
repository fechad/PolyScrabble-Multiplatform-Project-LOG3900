import 'dart:async';

import 'package:client_leger/config/colors.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/connexion_page.dart';
import 'package:client_leger/pages/home_page.dart';
import 'package:flutter/material.dart';

import '../config/flutter_flow/flutter_flow_theme.dart';
import '../services/http_service.dart';

final httpService = HttpService();

class ChangePasswordPageWidget extends StatefulWidget {
  final String email;
  const ChangePasswordPageWidget({Key? key, required this.email})
      : super(key: key);

  @override
  _ChangePasswordPageWidgetState createState() =>
      _ChangePasswordPageWidgetState();
}

class _ChangePasswordPageWidgetState extends State<ChangePasswordPageWidget> {
  final _unfocusNode = FocusNode();
  final scaffoldKey = GlobalKey<ScaffoldState>();
  final temporaryPasswordController = TextEditingController();
  final newPasswordController = TextEditingController();
  final confirmNewPasswordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool isWriting = false;

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    _unfocusNode.dispose();
    super.dispose();
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
                              'Changement de mot de passe',
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
                              controller: temporaryPasswordController,
                              decoration: const InputDecoration(
                                hintText:
                                    'Entrez le mot de passe envoyé à votre courriel',
                                labelText: 'Email temporaire',
                              ),
                              // The validator receives the text that the user has entered.
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return "Mot de passe temporaire requis";
                                }
                              },
                            ),
                          ),
                          SizedBox(
                            width: 400,
                            child: TextFormField(
                              obscureText: true,
                              controller: newPasswordController,
                              decoration: const InputDecoration(
                                hintText: 'Entrez votre nouveau mot de passe',
                                labelText: 'Nouveau mot de passe',
                              ),
                              // The validator receives the text that the user has entered.
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Entrez un mot de passe valide';
                                }
                              },
                            ),
                          ),
                          SizedBox(
                            width: 400,
                            child: TextFormField(
                              obscureText: true,
                              controller: confirmNewPasswordController,
                              decoration: const InputDecoration(
                                hintText:
                                    'Confirmez votre nouveau mot de passe',
                                labelText: 'Confirmet le nouveau mot de passe',
                              ),
                              // The validator receives the text that the user has entered.
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Entrez un mot de passe valide';
                                }
                                if (newPasswordController.text !=
                                    confirmNewPasswordController.text) {
                                  return 'Les mots de passe ne corespondent pas';
                                }
                              },
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 20.0),
                            child: ElevatedButton(
                              onPressed: () {
                                // Validate returns true if the form is valid, or false otherwise.
                                if (_formKey.currentState!.validate()) {
                                  //loginUser(textController.text);
                                  // TODO: authenticator modify user passoword
                                  authenticator
                                      .changeUserPassword(
                                          widget.email,
                                          temporaryPasswordController.text,
                                          newPasswordController.text)
                                      .then((value) => Navigator.of(context)
                                          .push(MaterialPageRoute(
                                              builder: (context) =>
                                                  //authenticator.setValidate();
                                                  ConnexionPageWidget())))
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
                                              'Changement réussi, reconnexion en cours ...')));
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
  }

  void navigate() {
    chatService.joinDiscussion('General Chat');

    Navigator.push(context, MaterialPageRoute(builder: ((context) {
      return MyHomePage(title: 'PolyScrabble');
    })));
  }
}
