import 'package:flutter/material.dart';

import '../config/flutter_flow/flutter_flow_theme.dart';
import '../main.dart';

class OtherMessage extends StatelessWidget {
  final String txt;
  final String time;
  final String username;
  OtherMessage({required this.username, required this.txt, required this.time});

  @override
  Widget build(BuildContext context) {
    return (Padding(
      padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 16),
      child: Column(
        mainAxisSize: MainAxisSize.max,
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(0, 0, 1070, 0),
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
                child: Container(
                  width: 80,
                  height: 80,
                  clipBehavior: Clip.antiAlias,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                  ),
                  child: Image.network(
                    'https://picsum.photos/seed/540/600',
                    fit: BoxFit.cover,
                  ),
                ),
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
