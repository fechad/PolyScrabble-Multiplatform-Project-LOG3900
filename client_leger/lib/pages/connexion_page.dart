import 'dart:async';

import 'package:client_leger/config/colors.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/forgot_password_page.dart';
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
  final TextEditingController textController = TextEditingController();
  bool isWriting = false;
  bool validUsername = false;

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
                              'Connexion',
                              style: TextStyle(
                                color: const Color(0xFF101213),
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
                              validator: (value) {
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
                              style: TextStyle(color: Colors.black),
                              decoration: const InputDecoration(
                                hintText: 'Entrez votre mot de passe',
                                labelText: 'Mot de passe',
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
                              validator: (value) {
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
                                InkWell(
                                  child: Text(
                                    'Cliquez ici',
                                    style: FlutterFlowTheme.of(context)
                                        .bodyText1
                                        .override(
                                          color: Color(0xFF7DAF6B),
                                          fontFamily: 'Nunito',
                                          fontSize: 20,
                                          fontWeight: FontWeight.bold,
                                        ),
                                  ),
                                  onTap: () {
                                    Navigator.push(context,
                                        MaterialPageRoute(builder: ((context) {
                                      return ForgotPasswordPageWidget();
                                    })));
                                  },
                                )
                              ],
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 20.0),
                            child: ElevatedButton(
                              onPressed: () async {
                                if (_formKey.currentState!.validate()) {
                                  loginUser();
                                  ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                          duration:
                                              Duration(milliseconds: 1000),
                                          backgroundColor: Colors.black,
                                          content: Text(
                                            'Vérification de la connexion ...',
                                            style:
                                                TextStyle(color: Colors.white),
                                          )));
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

  Future<void> loginUser() async {
    try {
      await authenticator.signInUser(
          emailController.text, passwordController.text);
      httpService.loginUserLogs(authenticator.getCurrentUser().email);
      navigate();
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          backgroundColor: Colors.redAccent,
          duration: Duration(milliseconds: 1000),
          content:
              Text('Error: $error', style: TextStyle(color: Colors.white))));
    }
    setState(() {
      isWriting = false;
    });
  }

  void navigate() {
    validUsername = true;
    authenticator.setStats(authenticator.getCurrentUser().email);
    chatService.joinDiscussion('General Chat');

    Navigator.push(context, MaterialPageRoute(builder: ((context) {
      return MyHomePage(title: 'PolyScrabble');
    })));
  }
}
