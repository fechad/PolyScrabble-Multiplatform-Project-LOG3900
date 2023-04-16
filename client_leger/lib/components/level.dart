import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';
import 'package:google_fonts/google_fonts.dart';

import '../classes/objective.dart';
import '../main.dart';
import '../services/objectives_service.dart';

class Level extends StatefulWidget {
  @override
  _LevelState createState() => _LevelState();
}

class _LevelState extends State<Level> {
  List<Objective> objectives = [];
  List<Widget> badges = [];

  @override
  void initState() {
    authenticator.currentUser.badges.forEach((badge) {
      badges.add(Container(
        width: 40,
        height: 40,
        margin: EdgeInsets.only(left: 2.5, right: 2.5),
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.grey,
        ),
        child: Image.asset(
          'assets/images/avatars/' +
              badge.id +
              'Avatar.png', // replace with your image file name
        ),
      ));
    });
  }

  @override
  Widget build(BuildContext context) {
    ObjectivesService objService = new ObjectivesService();
    objService.generateObjectives(authenticator.stats, authenticator.currentUser);
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
                  color: themeManager.themeMode == ThemeMode.light
                      ? Colors.white
                      : Color.fromARGB(255, 53, 53, 52),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(
                    color: Color(0x66000000),
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: themeManager.themeMode == ThemeMode.light
                          ? Colors.grey.withOpacity(0.5)
                          : Colors.black,
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
                        Text(AppLocalizations.of(context)!.userPageLevel,
                            style: GoogleFonts.nunito(
                              textStyle: TextStyle(
                                  fontSize: 16, fontWeight: FontWeight.bold),
                            )),
                        Text(objService.currentLevel.toString(),
                            style: GoogleFonts.nunito(
                              textStyle: TextStyle(
                                  fontSize: 32, fontWeight: FontWeight.bold),
                            ))
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(
                          height: 24,
                        ),
                        Container(
                          margin: EdgeInsets.only(left: 56),
                          width: 800,
                          height: 10,
                          decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(1000),
                              color: Color(0xCCCCCCCC)),
                          child: FractionallySizedBox(
                              alignment: Alignment.centerLeft,
                              widthFactor: objService.currentExp / objService.requiredExp,
                              heightFactor: 1,
                              child: Container(
                                decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(1000),
                                    color: themeManager.themeMode ==
                                            ThemeMode.light
                                        ? Color.fromARGB(255, 125, 175, 107)
                                        : Color.fromARGB(255, 121, 101, 220)),
                              )),
                        ),
                        SizedBox(
                          height: 8,
                        ),
                        Text(
                            objService.currentExp.toString() +
                                " / " +
                                objService.requiredExp.toString(),
                            style: GoogleFonts.nunito(
                              textStyle: TextStyle(
                                  color: Color(0xFFBBBBBB),
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold),
                            )),
                      ],
                    )
                  ],
                ))
          ],
        ));
  }
}
