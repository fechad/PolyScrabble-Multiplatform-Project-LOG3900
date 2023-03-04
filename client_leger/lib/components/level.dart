import 'package:client_leger/components/sidebar.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../config/colors.dart';

class Level extends StatefulWidget {
  @override
  _LevelState createState() => _LevelState();
}

class _LevelState extends State<Level> {
  List<Widget> badges = [];
  int currentExp = 0;
  int requiredExp = 0;
  double fraction = 0;
  @override
  void initState(){
    currentExp = 300;
    requiredExp = 500;
    fraction = currentExp/requiredExp;
    for(int i=0; i<7; i++) {
        badges.add(
          Container(
            width: 40,
            height: 40,
            margin: EdgeInsets.only(left: 2.5, right: 2.5),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.grey,
            ),
          )
        );
    }
  }
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1000,
      child: Column(
        children: [
            Row(
              children: badges,
            ),
          Container(
            margin: EdgeInsets.only(top: 8, bottom: 32),
            padding: EdgeInsets.only(left: 48, right: 8),
            height: 90,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(4),
              border: Border.all(
                color: Color(0x66000000),
                width: 1,
              ),
              boxShadow: [
                BoxShadow(
            color: Colors.grey.withOpacity(0.5),
            spreadRadius: 1,
            blurRadius: 1,
            offset: Offset(1, 2), // changes position of shadow
          ),
              ],
            ),
            child: Row(
              children: [
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text("niv.", style: GoogleFonts.nunito(
                      textStyle: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold
                      ),)),
                    Text("1", style: GoogleFonts.nunito(
                      textStyle: TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold
                      ),))
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(height: 24,),
                    Container(
                      margin: EdgeInsets.only(left:56),
                      width: 800,
                      height: 10,
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(1000),
                          color: Color(0xCCCCCCCC)
                      ),
                      child: FractionallySizedBox(
                          alignment: Alignment.centerLeft,
                          widthFactor: fraction,
                          heightFactor: 1,
                          child: Container(
                            decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(1000),
                                color: Palette.mainColor
                            ),
                          )
                      ),
                    ),
                    SizedBox(height: 8,),
                    Text(currentExp.toString() + " / " + requiredExp.toString(), style: GoogleFonts.nunito(
                      textStyle: TextStyle(
                        color: Color(0xFFBBBBBB),
                          fontSize: 16,
                          fontWeight: FontWeight.bold
                      ),)),
                  ],
                )
              ],
            )
          )
        ],
      )
    );
  }
}
