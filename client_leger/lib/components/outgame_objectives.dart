import 'package:client_leger/components/achievement.dart';
import 'package:client_leger/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';
import 'package:google_fonts/google_fonts.dart';

import '../classes/objective.dart';
import '../services/objectives_service.dart';

class OutObj extends StatefulWidget {
  List<Objective> objectives;
  OutObj({required this.objectives});
  @override
  _OutObjState createState() => _OutObjState();
}

class _OutObjState extends State<OutObj> {
  @override
  List<Widget> firstColumn = [];
  List<Widget> secondColumn = [];
  int center = 0;
  void initState() {
    super.initState();
    widget.objectives.forEach((objective) {
      if(widget.objectives.indexOf(objective) % 2 == 0)
      firstColumn.add(
          Achievement(title: objective.name, current: objective.progression, total: objective.target)
      );
      else
        secondColumn.add(
            Achievement(title: objective.name, current: objective.progression, total: objective.target)
        );
    });
  }
  @override
  Widget build(BuildContext context) {
    return Container(
        width: 1000,
        child: Column(
          children: [
            Row(
              children: [
                Text(AppLocalizations.of(context)!.gamePageObjectives,
                    style: GoogleFonts.nunito(
                      textStyle:
                          TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                    )),
              ],
            ),
            Container(
              width: 1000,
              height: 900,
              child:  Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: firstColumn,
                    ),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: secondColumn,
                    ),
                  ],
                ),
              ),
          ],
        ));
  }
}
