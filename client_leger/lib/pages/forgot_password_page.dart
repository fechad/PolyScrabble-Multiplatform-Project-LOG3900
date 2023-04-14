import 'dart:async';

import 'package:client_leger/config/colors.dart';
import 'package:client_leger/pages/change_password_page.dart';
import 'package:flutter/material.dart';

import '../config/flutter_flow/flutter_flow_theme.dart';
import '../services/http_service.dart';
import 'connexion_page.dart';

final httpService = HttpService();

class ForgotPasswordPageWidget extends StatefulWidget {
  const ForgotPasswordPageWidget({Key? key}) : super(key: key);

  @override
  _ForgotPasswordPagePageWidgetState createState() =>
      _ForgotPasswordPagePageWidgetState();
}

class _ForgotPasswordPagePageWidgetState
    extends State<ForgotPasswordPageWidget> {
  final _unfocusNode = FocusNode();
  final scaffoldKey = GlobalKey<ScaffoldState>();
  final emailController = TextEditingController();
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
                  color: const Color(0xFFFFFFFF),
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
                              'Reinitialisation du mot de passe',
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
                              style: TextStyle(color: Colors.black),
                              decoration: const InputDecoration(
                                hintText: 'Entrez votre adresse courriel',
                                labelText: 'Adresse courriel',
                                hintStyle: TextStyle(
                                  color: const Color(0xFF101213),
                                  fontFamily: 'Nunito',
                                ),
                                labelStyle: TextStyle(
                                  color: const Color(0xFF101213),
                                  fontFamily: 'Nunito',
                                ),
                                enabledBorder: UnderlineInputBorder(
                                  borderSide: BorderSide(color: Colors.black54),
                                ),
                                focusedBorder: UnderlineInputBorder(
                                  borderSide: BorderSide(color: Colors.black54),
                                ),
                              ),
                              // The validator receives the text that the user has entered.
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return "Entrez une addresse valide";
                                }
                              },
                            ),
                          ),
                          SizedBox(height: 20),
                          Padding(
                            padding: const EdgeInsets.fromLTRB(0, 40, 0, 0),
                            child: ElevatedButton(
                              onPressed: () {
                                // Validate returns true if the form is valid, or false otherwise.
                                if (_formKey.currentState!.validate()) {
                                  resetUserPassword();
                                  ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                          duration:
                                              Duration(milliseconds: 1000),
                                          content: Text(
                                              'Vérification des renseignements...')));
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
                                'Reinitialiser',
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
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 20.0),
                            child: ElevatedButton(
                              onPressed: () {
                                // Validate returns true if the form is valid, or false otherwise.
                                Navigator.push(context,
                                    MaterialPageRoute(builder: ((context) {
                                  return ConnexionPageWidget();
                                })));
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
                                          Color.fromARGB(255, 236, 186, 140))),
                              child: Text(
                                'Retour',
                                style: FlutterFlowTheme.of(context)
                                    .bodyText1
                                    .override(
                                      color: Colors.white,
                                      fontFamily: 'Nunito',
                                      fontSize: 24,
                                    ),
                              ),
                            ),
                          )
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

  void resetUserPassword() {
    if (emailController.text.isEmpty) return;
    //textController.clear();

    httpService.resetUserPassword(emailController.text).then((value) => value
                .statusCode ==
            202
        ? navigate()
        : ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            backgroundColor: Colors.red[300],
            duration: const Duration(milliseconds: 1000),
            content:
                Text('Une erreur est survenue: ${value.body.toString()}'))));
  }

  void navigate() {
    Navigator.push(context, MaterialPageRoute(builder: ((context) {
      return ChangePasswordPageWidget(email: emailController.text);
    })));
  }
}
