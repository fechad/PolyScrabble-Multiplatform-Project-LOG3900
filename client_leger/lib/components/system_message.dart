import 'package:flutter/material.dart';

import '../config/flutter_flow/flutter_flow_theme.dart';

class SystemMessage extends StatelessWidget {
  const SystemMessage({super.key});


  @override
  Widget build(BuildContext context) {
    return (
      // Generated code for this Row Widget...
      Padding(
        padding: EdgeInsetsDirectional.fromSTEB(0, 0, 0, 16),
        child: Row(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Column(
              mainAxisSize: MainAxisSize.max,
              children: [
                Text(
                  'Hello World',
                  style: FlutterFlowTheme.of(context).bodyText1.override(
                        fontFamily: 'Poppins',
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