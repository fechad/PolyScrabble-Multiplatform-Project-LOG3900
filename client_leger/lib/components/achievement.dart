import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_fonts/google_fonts.dart';

import '../main.dart';

class Achievement extends StatefulWidget {
  final String? title;
  final int? current;
  final int? total;
  const Achievement(
      {required this.title, required this.current, required this.total});
  @override
  _AchievementState createState() => _AchievementState();
}

class _AchievementState extends State<Achievement> {
  @override
  Widget build(BuildContext context) {
    if (widget.current == widget.total)
      return Container(
          padding: EdgeInsets.only(top: 8, left: 15, right: 15, bottom: 8),
          margin: EdgeInsets.all(8),
          width: 484,
          height: 96,
          decoration: BoxDecoration(
            color: themeManager.themeMode == ThemeMode.light
                ? Colors.white
                : Color.fromARGB(255, 53, 53, 52),
            borderRadius: BorderRadius.circular(4),
            border: Border.all(
              color: themeManager.themeMode == ThemeMode.light
                  ? Color.fromARGB(255, 125, 175, 107)
                  : Color.fromARGB(255, 121, 101, 220),
              width: 3,
            ),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    alignment: Alignment.centerLeft,
                    child: Text(widget.title ?? "",
                        style: GoogleFonts.nunito(
                          textStyle: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.w700),
                        )),
                  ),
                  Container(
                    child: FaIcon(
                      FontAwesomeIcons.check,
                      color: themeManager.themeMode == ThemeMode.light
                          ? Color.fromARGB(255, 125, 175, 107)
                          : Color.fromARGB(255, 121, 101, 220),
                    ),
                  )
                ],
              ),
              SizedBox(
                height: 8,
              ),
              Container(
                alignment: Alignment.centerLeft,
                width: 1000,
                height: 10,
                decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(1000),
                    color: Color(0xCCCCCCCC)),
                child: FractionallySizedBox(
                    alignment: Alignment.centerLeft,
                    widthFactor: widget.current! / (widget.total ?? 1),
                    heightFactor: 1,
                    child: Container(
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(1000),
                          color: themeManager.themeMode == ThemeMode.light
                              ? Color.fromARGB(255, 125, 175, 107)
                              : Color.fromARGB(255, 121, 101, 220)),
                    )),
              ),
              SizedBox(
                height: 8,
              ),
              Container(
                alignment: Alignment.centerRight,
                child: Text(
                    widget.current.toString() + " / " + widget.total.toString(),
                    style: GoogleFonts.nunito(
                      textStyle: TextStyle(
                          color: themeManager.themeMode == ThemeMode.light
                              ? Color.fromARGB(255, 125, 175, 107)
                              : Color.fromARGB(255, 121, 101, 220),
                          fontSize: 16,
                          fontWeight: FontWeight.bold),
                    )),
              )
            ],
          ));
    else
      return Container(
          padding: EdgeInsets.only(top: 8, left: 15, right: 15, bottom: 8),
          margin: EdgeInsets.all(8),
          width: 484,
          height: 96,
          decoration: BoxDecoration(
            color: themeManager.themeMode == ThemeMode.light
                ? Colors.white
                : Color.fromARGB(255, 53, 53, 52),
            borderRadius: BorderRadius.circular(4),
            border: Border.all(
              color: Color(0x66000000),
              width: 1,
            ),
          ),
          child: Column(
            children: [
              Container(
                alignment: Alignment.centerLeft,
                child: Text(widget.title ?? "",
                    style: GoogleFonts.nunito(
                      textStyle:
                          TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                    )),
              ),
              SizedBox(
                height: 8,
              ),
              Container(
                alignment: Alignment.centerLeft,
                width: 1000,
                height: 10,
                decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(1000),
                    color: Color(0xCCCCCCCC)),
                child: FractionallySizedBox(
                    alignment: Alignment.centerLeft,
                    widthFactor: widget.current! / (widget.total ?? 1),
                    heightFactor: 1,
                    child: Container(
                      decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(1000),
                          color: themeManager.themeMode == ThemeMode.light
                              ? Color.fromARGB(255, 125, 175, 107)
                              : Color.fromARGB(255, 121, 101, 220)),
                    )),
              ),
              SizedBox(
                height: 8,
              ),
              Container(
                alignment: Alignment.centerRight,
                child: Text(
                    widget.current.toString() + " / " + widget.total.toString(),
                    style: GoogleFonts.nunito(
                      textStyle: TextStyle(
                          color: Color(0xFFBBBBBB),
                          fontSize: 16,
                          fontWeight: FontWeight.bold),
                    )),
              )
            ],
          ));
  }
}
