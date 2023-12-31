import 'package:flutter/material.dart';

import '../config/flutter_flow/flutter_flow_theme.dart';
import '../main.dart';

class SenderMessage extends StatelessWidget {
  final String txt;
  final String time;
  SenderMessage({required this.txt, required this.time});
  @override
  Widget build(BuildContext context) {
    return (Padding(
      padding: EdgeInsetsDirectional.fromSTEB(130, 0, 0, 8),
      child: Column(
        mainAxisSize: MainAxisSize.max,
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(940, 0, 0, 0),
            child: (Text(
              time,
              textAlign: TextAlign.end,
              style: FlutterFlowTheme.of(context).bodyText1.override(
                    color: Colors.grey,
                    fontFamily: 'Nunito',
                    fontSize: 15,
                  ),
            )),
          ),
          Padding(
            padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 16),
            child: Row(
              mainAxisSize: MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Padding(
                  padding: EdgeInsetsDirectional.fromSTEB(0, 0, 24, 0),
                  child: Container(
                    width: 756.3,
                    padding: EdgeInsets.fromLTRB(0, 16, 0, 16),
                    decoration: BoxDecoration(
                      color: themeManager.themeMode == ThemeMode.light
                          ? Color.fromARGB(255, 125, 175, 107)
                          : Color.fromARGB(255, 121, 101, 220),
                      borderRadius: BorderRadius.circular(8),
                    ),

//Text box for chat
                    child: Column(
                      mainAxisSize: MainAxisSize.max,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: EdgeInsetsDirectional.fromSTEB(16, 8, 0, 0),
                          child: Text(
                            txt,
                            style:
                                FlutterFlowTheme.of(context).bodyText1.override(
                                      fontFamily: 'Nunito',
                                      fontSize: 20,
                                      fontWeight: FontWeight.normal,
                                    ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    ));
  }
}
