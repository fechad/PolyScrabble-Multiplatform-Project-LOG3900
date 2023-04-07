import 'dart:math';

import 'package:client_leger/pages/game_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';
import 'package:google_fonts/google_fonts.dart';

import '../classes/objective.dart';
import '../main.dart';

class UserLevel extends StatefulWidget {
  @override
  _UserLevelState createState() => _UserLevelState();
}

class _UserLevelState extends State<UserLevel> {
  List<Objective> objectives = [];
  List<Widget> badges = [];
  int currentExp = 0;
  int requiredExp = 0;
  double fraction = 0;
  int level = 0;
  @override
  void initState() {
    recalculateExp();
    fraction = currentExp / requiredExp;
    linkService.getPlayerToShow().badges.forEach((badge) {
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

  recalculateExp() {
    int addedExp = 0;
    objectives.forEach((objective) {
      if (objective.progression == objective.target) addedExp += objective.exp!;
    });
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    final totalXP =
        linkService.getPlayerToShow().progressInfo.totalXP! + addedExp;
    level = this.getLevel(totalXP);
    currentExp = (totalXP - this.getTotalXpForLevel(level)).round() as int;
    requiredExp = (this.getRemainingNeededXp(totalXP) +
            totalXP -
            this.getTotalXpForLevel(level))
        .round();
  }

  getTotalXpForLevel(targetLevel) {
    const base = 200;
    const ratio = 1.05;
    return ((base * (1 - pow(ratio, targetLevel))) / (1 - ratio)).floor();
  }

  getLevel(totalXP) {
    int left = 1;
    int right = 100;
    while (left < right) {
      final mid = ((left + right) / 2).floor();
      final seriesSum = getTotalXpForLevel(mid);
      if (seriesSum > totalXP)
        right = mid;
      else
        left = mid + 1;
    }
    return left - 1;
  }

  getRemainingNeededXp(totalXP) {
    final currentLevel = getLevel(totalXP);
    return this.getTotalXpForLevel(currentLevel + 1) - totalXP;
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
                        Text(
                            linkService
                                .getPlayerToShow()
                                .progressInfo
                                .currentLevel
                                .toString(),
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
                              widthFactor: fraction,
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
                            currentExp.toString() +
                                " / " +
                                requiredExp.toString(),
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
