import 'package:flutter/material.dart';

import '../config/flutter_flow/flutter_flow_theme.dart';

class SenderMessage extends StatelessWidget {
  final String txt;
  final String time;
  SenderMessage({required this.txt, required this.time});
  @override
  Widget build(BuildContext context) {
    return (
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
                height: 88,
                decoration: BoxDecoration(
                  color: Color(0xFF7DAF6B),
                  borderRadius: BorderRadius.circular(8),
                ),

                child: Column(
                  mainAxisSize: MainAxisSize.max,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: EdgeInsetsDirectional.fromSTEB(16, 8, 0, 0),
                      child: Text(
                        txt,
                        style: FlutterFlowTheme.of(context).bodyText1.override(
                              fontFamily: 'Poppins',
                              fontSize: 24,
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
    );
  }
}
