import 'dart:async';

import 'package:client_leger/main.dart';
import 'package:client_leger/services/http_service.dart';
import 'package:flutter/material.dart';

import '../config/colors.dart';
import '../config/flutter_flow/flutter_flow_theme.dart';
import 'connexion_page.dart';
import 'home_page.dart';

final httpService = HttpService();

class SignupPageWidget extends StatefulWidget {
  const SignupPageWidget({Key? key}) : super(key: key);

  @override
  _SignupPageWidgetState createState() => _SignupPageWidgetState();
}

class _SignupPageWidgetState extends State<SignupPageWidget> {
  final _unfocusNode = FocusNode();
  final scaffoldKey = GlobalKey<ScaffoldState>();
  final _formKey = GlobalKey<FormState>();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmPasswordController = TextEditingController();
  final usernameController = TextEditingController();

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
        resizeToAvoidBottomInset: false,
        key: scaffoldKey,
        backgroundColor: Color(0xFFF9FFF6),
        body: SingleChildScrollView(
          padding: EdgeInsets.symmetric(vertical: 80.0),
          child: SafeArea(
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
                    height: MediaQuery.of(context).size.height * 0.60,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFFFFF),
                      boxShadow: const [
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
                                  'Signup',
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
                                width: 400,
                                child: TextFormField(
                                  controller: usernameController,
                                  maxLength: 10,
                                  style: TextStyle(color: Colors.black),
                                  decoration: const InputDecoration(
                                    hintText: 'Choose a username',
                                    labelText: 'username',
                                    hintStyle: TextStyle(
                                      color: const Color(0xFF101213),
                                      fontFamily: 'Nunito',
                                    ),
                                    labelStyle: TextStyle(
                                      color: const Color(0xFF101213),
                                      fontFamily: 'Nunito',
                                    ),
                                    enabledBorder: UnderlineInputBorder(
                                      borderSide:
                                          BorderSide(color: Colors.black54),
                                    ),
                                    focusedBorder: UnderlineInputBorder(
                                      borderSide:
                                          BorderSide(color: Colors.black54),
                                    ),
                                  ),
                                  // The validator receives the text that the user has entered.
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'Please enter a valid email address';
                                    }
                                  },
                                ),
                              ),
                              SizedBox(
                                width: 400,
                                child: TextFormField(
                                  controller: emailController,
                                  style: TextStyle(color: Colors.black),
                                  decoration: const InputDecoration(
                                    hintText: 'Enter your email address',
                                    labelText: 'Email address',
                                    hintStyle: TextStyle(
                                      color: const Color(0xFF101213),
                                      fontFamily: 'Nunito',
                                    ),
                                    labelStyle: TextStyle(
                                      color: const Color(0xFF101213),
                                      fontFamily: 'Nunito',
                                    ),
                                    enabledBorder: UnderlineInputBorder(
                                      borderSide:
                                          BorderSide(color: Colors.black54),
                                    ),
                                    focusedBorder: UnderlineInputBorder(
                                      borderSide:
                                          BorderSide(color: Colors.black54),
                                    ),
                                  ),
                                  // The validator receives the text that the user has entered.
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'Please enter a valid email address';
                                    }
                                    return null;
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
                                    hintText: 'Enter your password',
                                    labelText: 'Password',
                                    hintStyle: TextStyle(
                                      color: const Color(0xFF101213),
                                      fontFamily: 'Nunito',
                                    ),
                                    labelStyle: TextStyle(
                                      color: const Color(0xFF101213),
                                      fontFamily: 'Nunito',
                                    ),
                                    enabledBorder: UnderlineInputBorder(
                                      borderSide:
                                          BorderSide(color: Colors.black54),
                                    ),
                                    focusedBorder: UnderlineInputBorder(
                                      borderSide:
                                          BorderSide(color: Colors.black54),
                                    ),
                                  ),
                                  // The validator receives the text that the user has entered.
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'Please enter a valid password';
                                    }
                                    return null;
                                  },
                                ),
                              ),
                              //if (passwordController.text.isNotEmpty)
                              SizedBox(
                                width: 400,
                                child: TextFormField(
                                  obscureText: true,
                                  controller: confirmPasswordController,
                                  style: TextStyle(color: Colors.black),
                                  decoration: const InputDecoration(
                                    hintText: 'Enter your password',
                                    labelText: 'Confirm Password',
                                    hintStyle: TextStyle(
                                      color: const Color(0xFF101213),
                                      fontFamily: 'Nunito',
                                    ),
                                    labelStyle: TextStyle(
                                      color: const Color(0xFF101213),
                                      fontFamily: 'Nunito',
                                    ),
                                    enabledBorder: UnderlineInputBorder(
                                      borderSide:
                                          BorderSide(color: Colors.black54),
                                    ),
                                    focusedBorder: UnderlineInputBorder(
                                      borderSide:
                                          BorderSide(color: Colors.black54),
                                    ),
                                  ),
                                  // The validator receives the text that the user has entered.
                                  validator: (value) {
                                    if (value == null ||
                                        value.isEmpty ||
                                        value != passwordController.text) {
                                      return 'The passwords do not match';
                                    }
                                    return null;
                                  },
                                ),
                              ),
                              Padding(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 20.0),
                                child: ElevatedButton(
                                  // statesController: () => {

                                  // },
                                  onPressed: () {
                                    // Validate returns true if the form is valid, or false otherwise.
                                    if (_formKey.currentState!.validate()) {
                                      //loginUser(textController.text);
                                      authenticator
                                          .signUpUser(
                                              emailController.text,
                                              passwordController.text,
                                              usernameController.text
                                                  .toLowerCase())
                                          .then((value) => Navigator.of(context)
                                              .push(MaterialPageRoute(
                                                  builder: (context) => MyHomePage(
                                                      title: 'PolyScrabble'))))
                                          .catchError((error) =>
                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(SnackBar(
                                                      backgroundColor:
                                                          Colors.redAccent,
                                                      duration: const Duration(
                                                          milliseconds: 1000),
                                                      content: Text(
                                                          'Error: $error'))));

                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(const SnackBar(
                                              duration:
                                                  Duration(milliseconds: 1000),
                                              content: Text(
                                                  'Vérification de la connexion ...')));
                                      Timer(const Duration(milliseconds: 1000),
                                          (() => {}));
                                    } else {
                                      return;
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
                                    'Signup',
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
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    children: [
                                      Text(
                                        'Already registered?',
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
                                      GestureDetector(
                                        onTap: () {
                                          Navigator.of(context).push(
                                              MaterialPageRoute(
                                                  builder: (context) =>
                                                      const ConnexionPageWidget()));
                                        },
                                        child: Text(
                                          'Login',
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
        ));
  }
}
