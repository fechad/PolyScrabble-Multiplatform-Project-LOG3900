import 'package:client_leger/main.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';
import 'package:google_fonts/google_fonts.dart';

class Stats extends StatefulWidget {
  const Stats({Key? key}) : super(key: key);

  @override
  _StatsState createState() => _StatsState();
}

class _StatsState extends State<Stats> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return Container(
      child: Column(children: [
        Text(AppLocalizations.of(context)!.statisticSectionTitle,
            style: GoogleFonts.nunito(
              textStyle:
                  const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            )),
        SizedBox(
          height: 30,
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
                width: 272,
                height: 64,
                margin: EdgeInsets.all(8),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(AppLocalizations.of(context)!.statisticSectionOne,
                        style: GoogleFonts.nunito(
                          textStyle: const TextStyle(
                              fontSize: 24, fontWeight: FontWeight.w600),
                        )),
                    Text(authenticator.stats.playedGamesCount.toString(),
                        style: GoogleFonts.nunito(
                          textStyle: const TextStyle(
                              fontSize: 20, fontWeight: FontWeight.bold),
                        ))
                  ],
                )),
            Container(
                width: 272,
                height: 64,
                margin: EdgeInsets.all(8),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(AppLocalizations.of(context)!.statisticSectionTwo,
                        style: GoogleFonts.nunito(
                          textStyle: const TextStyle(
                              fontSize: 24, fontWeight: FontWeight.w600),
                        )),
                    Text(authenticator.stats.gamesWonCount.toString(),
                        style: GoogleFonts.nunito(
                          textStyle: const TextStyle(
                              fontSize: 20, fontWeight: FontWeight.bold),
                        ))
                  ],
                )),
            Container(
                width: 272,
                height: 64,
                margin: EdgeInsets.all(8),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(AppLocalizations.of(context)!.statisticSectionThree,
                        style: GoogleFonts.nunito(
                          textStyle: const TextStyle(
                              fontSize: 24, fontWeight: FontWeight.w600),
                        )),
                    Text(authenticator.stats.averagePointsByGame.toString(),
                        style: GoogleFonts.nunito(
                          textStyle: const TextStyle(
                              fontSize: 20, fontWeight: FontWeight.bold),
                        ))
                  ],
                )),
            Container(
                width: 272,
                height: 64,
                margin: EdgeInsets.all(8),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(AppLocalizations.of(context)!.statisticSectionFour,
                        style: GoogleFonts.nunito(
                          textStyle: const TextStyle(
                              fontSize: 24, fontWeight: FontWeight.w600),
                        )),
                    Text(authenticator.stats.averageGameDuration!,
                        style: GoogleFonts.nunito(
                          textStyle: const TextStyle(
                              fontSize: 20, fontWeight: FontWeight.bold),
                        ))
                  ],
                )),
          ],
        )
      ]),
    );
  }
}
