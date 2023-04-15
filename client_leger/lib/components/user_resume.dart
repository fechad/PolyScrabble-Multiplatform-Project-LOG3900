import 'dart:math';

import 'package:client_leger/components/highscores.dart';
import 'package:client_leger/pages/game_page.dart';
import 'package:client_leger/pages/user_profile_page.dart';
import 'package:client_leger/services/border_service.dart';
import 'package:client_leger/services/objectives_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';
import 'package:google_fonts/google_fonts.dart';

import '../classes/game.dart';
import '../main.dart';

class UserResume extends StatefulWidget {
  @override
  _UserResumeState createState() => _UserResumeState();
}

class _UserResumeState extends State<UserResume> {
  List<Widget> badges = [];
  @override
  void initState() {
    /*
      value="{{ progressInfo.totalXP - progressInfo.currentLevelXp }}"
      max="{{ progressInfo.xpForNextLevel + progressInfo.totalXP - progressInfo.currentLevelXp }}"
    */

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


  Widget rightImageFormat(int level) {
    BorderService borderService = new BorderService();
    String path = borderService.getBorder(level);
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
      return Stack(
        alignment: Alignment.center,
        children: [
          CircleAvatar(
            radius: 60,
            backgroundImage: NetworkImage(
              linkService.getPlayerToShow().userSettings.avatarUrl,
            )),
          borderService.border(path)
        ]
      );
  }


  @override
  Widget build(BuildContext context) {
    ObjectivesService objService = new ObjectivesService();
    Account player = linkService.getPlayerToShow();
    authenticator.getOtherStats(player.email);
    objService.generateObjectives(authenticator.otherStats, player);
    return Drawer(
      width: 400,
      child: Column(
        children: [
          rightImageFormat(objService.currentLevel),
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
              width: 360,
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
                          objService.currentLevel.toString(),
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
                        width: 280,
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
              )),
          SizedBox(
            height: 32,
          ),
          HighScores(highScore: objService.highScore, victories: authenticator.otherStats.gamesWonCount!),
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
          if (!linkService.getInsideWaitingRoomBoolean() &&
              linkService.getInsideChatBoolean())
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
