import 'package:client_leger/main.dart';
import 'package:client_leger/pages/home_page.dart';
import 'package:client_leger/pages/signup_page.dart';

import '../config/flutter_flow/flutter_flow_theme.dart';
import '../config/flutter_flow/flutter_flow_util.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';


class ConnexionPageWidget extends StatefulWidget {
  const ConnexionPageWidget({Key? key}) : super(key: key);

  @override
  _ConnexionPageWidgetState createState() => _ConnexionPageWidgetState();
}

class _ConnexionPageWidgetState extends State<ConnexionPageWidget> {
  final _unfocusNode = FocusNode();
  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void dispose() {
    _unfocusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: scaffoldKey,
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
                height: MediaQuery.of(context).size.height * 0.62,
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
                  children: [
                    Align(
                    alignment: AlignmentDirectional(0, -1),
                      child: Text(
                        'Login',
                        style: FlutterFlowTheme.of(context).bodyText1.override(
                          fontFamily: 'Nunito',
                          fontSize: 48,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    SizedBox(height: 32),
                    SizedBox(
                      width:336,
                      child: TextField(
                        style: FlutterFlowTheme.of(context).bodyText1.override(
                          fontFamily: 'Nunito',
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                        decoration: InputDecoration(
                          labelText: 'Email adress',
                          enabledBorder: UnderlineInputBorder(
                            borderSide: BorderSide(color: Colors.black),
                          ),
                          contentPadding: EdgeInsets.symmetric(vertical: 0),
                        ),
                      )
                    ),
                    SizedBox(height: 32),
                    SizedBox(
                        width:336,
                        child: TextField(
                          style: FlutterFlowTheme.of(context).bodyText1.override(
                            fontFamily: 'Nunito',
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                          decoration: InputDecoration(
                            labelText: 'Password',
                            enabledBorder: UnderlineInputBorder(
                              borderSide: BorderSide(color: Colors.black),
                            ),
                            contentPadding: EdgeInsets.symmetric(vertical: 0),
                          ),
                        )
                    ),
                    SizedBox(height: 16),
                    Row(
                      children: [
                        SizedBox(width: 56),
                        Text(
                          'Forgot password?',
                          style: FlutterFlowTheme.of(context).bodyText1.override(
                            color: Color(0x80000000),
                            fontFamily: 'Nunito',
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(width: 4),
                        Text(
                          'Click here',
                          style: FlutterFlowTheme.of(context).bodyText1.override(
                            color: Color(0xFF7DAF6B),
                            fontFamily: 'Nunito',
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ]

                    ),
                    SizedBox(height: 32),
                    SizedBox(
                      height: 64,
                      width: 336,
                      child: TextButton(
                        style: ButtonStyle(
                          backgroundColor: MaterialStateProperty.all<Color>(Color(0xFF7DAF6B)),
                          foregroundColor: MaterialStateProperty.all<Color>(Color(0xFFFFFFFF)),
                          shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                                RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(48)
                                ),
                            ),
                        ),
                        onPressed: () { Navigator.of(context).push(MaterialPageRoute(builder: (context) => 
                          //authenticator.setValidate();
                          MyHomePage(title: 'PolyScrabble')
                          )); },
                        child: Text(
                          'Login',
                          style: GoogleFonts.nunito(fontSize: 40, fontWeight: FontWeight.w700),

                        ),
                      ),
                    ),
                    SizedBox(height: 32),
                    Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Not register yet?',
                            style: FlutterFlowTheme.of(context).bodyText1.override(
                              color: Color(0x80000000),
                              fontFamily: 'Nunito',
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(width: 4),
                          GestureDetector(
                            onTap: () { Navigator.of(context).push(MaterialPageRoute(builder: (context) => SignupPageWidget())); },
                            child: Text(
                              'Sign up',
                              style: FlutterFlowTheme.of(context).bodyText1.override(
                                color: Color(0xFF7DAF6B),
                                fontFamily: 'Nunito',
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                          ),
                          ),
                        ]

                    ),
                  ]
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
