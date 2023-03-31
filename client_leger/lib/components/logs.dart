import 'package:client_leger/main.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class Logs extends StatefulWidget {
  const Logs({Key? key}) : super(key: key);

  @override
  _LogsState createState() => _LogsState();
}

class _LogsState extends State<Logs> {
  var BDlogs = authenticator.stats.logs;
  List<Widget> logs = [];

  @override
  void initState() {
    super.initState();
    for (var log in BDlogs!) {
      logs.add(Container(
        margin: EdgeInsets.only(bottom: 8),
        child: Text(log.time! + " , " + log.message!,
            style: GoogleFonts.nunito(
              textStyle:
                  const TextStyle(fontSize: 20, fontStyle: FontStyle.italic),
            )),
      ));
    }
    if (BDlogs!.length == 0)
      logs.add(Container(
        margin: EdgeInsets.only(bottom: 8),
        child: Text("Aucune information pour le moment",
            style: GoogleFonts.nunito(
              textStyle:
                  const TextStyle(fontSize: 20, fontStyle: FontStyle.italic),
            )),
      ));
  }

  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return Container(
        padding: EdgeInsets.only(top: 16),
        child: SingleChildScrollView(
          child: Column(
            children: logs,
          ),
        ));
  }
}
