import 'package:flutter/material.dart';
import '../config/colors.dart';
import '../config/flutter_flow/flutter_flow_theme.dart';
import 'avatar.dart';

class GameCard extends StatelessWidget {


  @override
  Widget build(BuildContext context) {
    return
                Container(
                  width: 500,
                  padding: EdgeInsets.fromLTRB(0, 8, 0, 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.grey.withOpacity(0.5),
                        spreadRadius: 5,
                        blurRadius: 7,
                        offset: Offset(0, 3), // changes position of shadow
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.max,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                      Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(16, 0, 0, 0),
                        child: Text(
                        "[Difficulte]",
                          style:
                          FlutterFlowTheme.of(context).bodyText1.override(
                            fontFamily: 'Nunito',
                            fontSize: 20,
                          ),
                          textAlign: TextAlign.start,
                        ),
                      ),
                          Spacer(),
                          Padding(
                            padding: EdgeInsetsDirectional.fromSTEB(16, 0, 16, 0),
                            child: Text(
                              "[Temps]",
                              style:
                              FlutterFlowTheme.of(context).bodyText1.override(
                                fontFamily: 'Nunito',
                                fontSize: 20,
                              ),
                              textAlign: TextAlign.end,
                            ),
                          ),
                        ]
                      ),
                      Spacer(),
                      Row(
                        children: [
                      Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 0),
                        child: Row(
                          children: [
                            Avatar(),
                            Avatar(),
                            Avatar(),
                            Avatar(),
                            Padding(
                              padding: EdgeInsetsDirectional.fromSTEB(40, 0, 16, 0),
                              child:
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Palette.mainColor,
                                  minimumSize: Size(50, 40),
                                  textStyle: const TextStyle(fontSize: 20),
                                ),
                                child: const Text('Joindre 🔑'),
                                onPressed: () {
                                  // Navigator.push(context,
                                  //     MaterialPageRoute(builder: ((context) {
                                  //       return const MultiplayerPage();
                                  //     })));
                                },
                              ),
                            ),
                      ],

                      ),
                      ),
                     ],
                    )
                  ],),
                );
  }
}
