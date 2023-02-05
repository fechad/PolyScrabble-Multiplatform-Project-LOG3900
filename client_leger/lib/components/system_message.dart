import 'package:flutter/material.dart';

import '../config/flutter_flow/flutter_flow_theme.dart';

class SystemMessage extends StatelessWidget {
  final String txt;
  final String time;
  SystemMessage({required this.txt, required this.time});


  @override
  Widget build(BuildContext context) {
    return (
        // Generated code for this Row Widget...
        Padding(
          padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 16),
          child: Column(
            mainAxisSize: MainAxisSize.max,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                time,
                textAlign: TextAlign.end,
                style: FlutterFlowTheme.of(context).bodyText1.override(
                  color: Colors.grey,
                  fontFamily: 'Nunito',
                  fontSize: 15,
                ),
              ),
              Column(
                mainAxisSize: MainAxisSize.max,
                children: [
                  Text(
                    txt,
                    style: FlutterFlowTheme.of(context).bodyText1.override(
                      fontFamily: 'Nunito',
                      fontSize: 20,
                    ),
                  ),
                ],
              ),
            ],
          ),
        )
    );
  }
}

