import 'dart:math';

import 'package:client_leger/components/highscores.dart';
import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/pages/user_profile_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';
import 'package:google_fonts/google_fonts.dart';

import '../main.dart';

class UserResume extends StatefulWidget {
  @override
  _UserResumeState createState() => _UserResumeState();
}

class _UserResumeState extends State<UserResume> {
  List<Widget> badges = [];
  int currentExp = 0;
  int requiredExp = 0;
  double fraction = 0;
  @override
  void initState() {
    /*
      value="{{ progressInfo.totalXP - progressInfo.currentLevelXp }}"
      max="{{ progressInfo.xpForNextLevel + progressInfo.totalXP - progressInfo.currentLevelXp }}"
    */

    if (linkService.getPlayerToShow().toString().isNotEmpty) {
      recalculateXP();
    } else {
      currentExp = 500;
      requiredExp = 500;
    }

    fraction = currentExp / requiredExp;

    if (linkService.getPlayerToShow().badges.isNotEmpty) {
      for (int i = 0; i < linkService.getPlayerToShow().badges.length; i++) {
        badges.add(CircleAvatar(
            radius: 18,
            backgroundImage: AssetImage(
                'assets/images/avatars/${linkService.getPlayerToShow().badges[i].id}Avatar.png')));
        badges.add(SizedBox(
          width: 5,
        ));
        if (i == 5) break;
      }
    }
  }

  recalculateXP() {
    currentExp = (linkService.getPlayerToShow().progressInfo.totalXP! -
            this.getTotalXpForLevel(
                linkService.getPlayerToShow().progressInfo.currentLevel))
        .round() as int;
    requiredExp = (this.getRemainingNeededXp(
            linkService.getPlayerToShow().progressInfo.totalXP!) +
        linkService.getPlayerToShow().progressInfo.totalXP! -
        this.getTotalXpForLevel(
            linkService.getPlayerToShow().progressInfo.currentLevel));
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

  Widget rightImageFormat() {
    if (linkService
        .getPlayerToShow()
        .userSettings
        .avatarUrl
        .startsWith("assets"))
      return Container(
        width: 120,
        height: 120,
        decoration: BoxDecoration(
            image: DecorationImage(
              image: AssetImage(
                      linkService.getPlayerToShow().userSettings.avatarUrl)
                  as ImageProvider,
              fit: BoxFit.fill,
            ),
            shape: BoxShape.circle),
      );
    else
      return CircleAvatar(
          radius: 60,
          backgroundImage: NetworkImage(
            linkService.getPlayerToShow().userSettings.avatarUrl,
          ));
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Column(
        children: [
          rightImageFormat(),
          Text(
              linkService.getPlayerToShow().toString().isNotEmpty
                  ? linkService.getPlayerToShow().username
                  : 'Top G',
              style: GoogleFonts.nunito(
                textStyle: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
              )),
          SizedBox(
            height: 16,
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              SizedBox(
                width: 10,
              ),
              Row(children: badges)
            ],
          ),
          Container(
              margin: EdgeInsets.only(right: 8, left: 8, top: 32, bottom: 32),
              padding: EdgeInsets.only(left: 16, right: 8),
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
                      Text(AppLocalizations.of(context)!.userPageLevel,
                          style: GoogleFonts.nunito(
                            textStyle: TextStyle(
                                fontSize: 12, fontWeight: FontWeight.bold),
                          )),
                      Text(
                          linkService.getPlayerToShow().toString().isNotEmpty
                              ? linkService
                                  .getPlayerToShow()
                                  .progressInfo
                                  .currentLevel
                                  .toString()
                              : "1",
                          style: GoogleFonts.nunito(
                            textStyle: TextStyle(
                                fontSize: 24, fontWeight: FontWeight.bold),
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
                        margin: EdgeInsets.only(left: 16),
                        width: 200,
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
                                  color:
                                      themeManager.themeMode == ThemeMode.light
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
              )),
          SizedBox(
            height: 32,
          ),
          HighScores(),
          SizedBox(
            height: 32,
          ),
          // Container(
          //   child: Text(
          //       '${languageService.currentLanguage.languageCode == 'en' ? 'High Score : ' : 'Meilleur score: '} ${linkService.getPlayerToShow().highScores}',
          //       style: GoogleFonts.nunito(
          //         textStyle: TextStyle(
          //             fontSize: 20,
          //             fontWeight: FontWeight.bold),
          //       )),
          // ),
          SizedBox(
            height: 96,
          ),
          if (linkService.getInsideChatBoolean())
            Container(
                width: 250,
                height: 48,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.push(context,
                        MaterialPageRoute(builder: ((context) {
                      return OtherUserPage();
                    })));
                  },
                  style: ButtonStyle(
                      backgroundColor: MaterialStatePropertyAll<Color>(
                          themeManager.themeMode == ThemeMode.light
                              ? Color.fromARGB(255, 125, 175, 107)
                              : Color.fromARGB(255, 121, 101, 220))),
                  child: Text(
                      languageService.currentLanguage.languageCode == 'en'
                          ? 'Complete profile'
                          : "Profil complet",
                      style: GoogleFonts.nunito(
                        textStyle: TextStyle(
                            color: Color(0xFFFFFFFF),
                            fontSize: 24,
                            fontWeight: FontWeight.bold),
                      )),
                ))
        ],
      ),
    );
  }
}
