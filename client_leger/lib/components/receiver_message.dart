import 'package:client_leger/components/avatar.dart';
import 'package:flutter/material.dart';

import '../classes/game.dart';
import '../config/flutter_flow/flutter_flow_theme.dart';
import '../main.dart';

class OtherMessage extends StatelessWidget {
  final String txt;
  final String time;
  final String username;
  final String? avatarUrl;
  final Account? account;
  OtherMessage(
      {required this.username,
      required this.txt,
      required this.time,
      this.account,
      this.avatarUrl});

  @override
  Widget build(BuildContext context) {
    return (Padding(
      padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 16),
      child: Column(
        mainAxisSize: MainAxisSize.max,
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(0, 0, 940, 0),
            child: (Text(
              time,
              textAlign: TextAlign.start,
              style: FlutterFlowTheme.of(context).bodyText1.override(
                    color: Colors.grey,
                    fontFamily: 'Nunito',
                    fontSize: 15,
                  ),
            )),
          ),
          Row(
            children: [
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(24, 0, 0, 0),
                child: Avatar(
                    insideChat: true,
                    url: avatarUrl ?? account!.userSettings.avatarUrl,
                    previewData: avatarUrl != null ? null : account),
              ),
              Padding(
                padding: EdgeInsetsDirectional.fromSTEB(24, 0, 0, 0),
                child: Container(
                  width: 756.3,
                  padding: EdgeInsets.fromLTRB(0, 16, 0, 16),
                  decoration: BoxDecoration(
                    color: themeManager.themeMode == ThemeMode.light
                        ? Color.fromARGB(255, 230, 230, 230)
                        : Color.fromARGB(255, 87, 89, 87),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.max,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(16, 8, 0, 0),
                        child: Text(
                          username,
                          style:
                              FlutterFlowTheme.of(context).bodyText1.override(
                                    fontFamily: 'Nunito',
                                    fontSize: 20,
                                  ),
                        ),
                      ),
                      Padding(
                        padding: EdgeInsetsDirectional.fromSTEB(16, 0, 0, 0),
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
        ],
      ),
    ));
  }
}
