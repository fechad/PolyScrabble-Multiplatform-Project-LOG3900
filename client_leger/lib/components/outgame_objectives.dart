import 'package:client_leger/components/achievement.dart';
import 'package:client_leger/components/sidebar.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../config/colors.dart';

class OutObj extends StatefulWidget {
  @override
  _OutObjState createState() => _OutObjState();
}

class _OutObjState extends State<OutObj> {

  @override
  void initState(){
  }
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1000,
      child: Column(
          children: [
            Row(
              children: [
                Text("Objectifs", style: GoogleFonts.nunito(
                  textStyle: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold
                  ),)),
              ],
            ),
            Container(
              width: 1000,
              height: 300,
              child: SingleChildScrollView(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Achievement(title: "Gagner 5 parties", current: 5, total: 5),
                        Achievement(title: "Gagner 5 parties", current: 4, total: 5),
                        Achievement(title: "Gagner 5 parties", current: 2, total: 5),
                        Achievement(title: "Gagner 5 parties", current: 4, total: 5),
                      ],
                    ),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Achievement(title: "Gagner 5 parties", current: 3, total: 5),
                        Achievement(title: "Gagner 5 parties", current: 5, total: 5),
                        Achievement(title: "Gagner 5 parties", current: 3, total: 5),
                        Achievement(title: "Gagner 5 parties", current: 3, total: 5),
                      ],
                    ),
                  ],
                ),
              ),
            )
          ],
      )
    );
  }
}
