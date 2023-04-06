import 'package:client_leger/components/objectives.dart';
import 'package:client_leger/components/racks.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';
import 'package:google_fonts/google_fonts.dart';

import '../main.dart';
import '../services/link_service.dart';

class ObjectiveBox extends StatefulWidget {
  ObjectiveBox(
      {super.key, required this.isObserver, required this.updateLetters});
  bool isObserver;
  final VoidCallback updateLetters;

  @override
  ObjectiveBoxState createState() => ObjectiveBoxState(isObserver: isObserver);
}

class ObjectiveBoxState extends State<ObjectiveBox> {
  ObjectiveBoxState({required this.isObserver});
  bool isObserver;

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 340,
      height: 425,
      color: Colors.transparent,
      child: DefaultTabController(
        length: 2,
        child: Container(
            child: Scaffold(
          backgroundColor: Colors.transparent,
          appBar: PreferredSize(
            preferredSize: Size.fromHeight(30),
            child: Container(
              width: 300,
              child: SafeArea(
                child: Column(
                  children: [
                    Expanded(
                      child: !isObserver ?
                      Container(
                        width: MediaQuery.of(context).size.width,
                        child: Objectives(),
                      )
                      :
                TabBar(
                        labelColor: themeManager.themeMode == ThemeMode.light
                            ? Color.fromARGB(255, 125, 175, 107)
                            : Color.fromARGB(255, 121, 101, 220),
                        unselectedLabelColor: Colors.grey,
                        indicatorSize: TabBarIndicatorSize.label,
                        indicatorColor:
                            themeManager.themeMode == ThemeMode.light
                                ? Color.fromARGB(255, 125, 175, 107)
                                : Color.fromARGB(255, 121, 101, 220),
                        labelStyle: GoogleFonts.nunito(
                          textStyle: TextStyle(
                            fontSize: 20,
                          ),
                        ),
                        tabs: [
                          Tab(
                              text: AppLocalizations.of(context)!
                                  .gamePageObjectives),
                          Tab(text: AppLocalizations.of(context)!.gamePageRack),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          body: Container(
            width: MediaQuery.of(context).size.width,
            color: Color(0x00000000),
            child: TabBarView(
              children: [
                Objectives(),
                Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Racks(
                    isObserver: isObserver,
                    updateLetters: updateLetters,
                  )
                ]),
              ],
            ),
          ),
        )),
      ),
    );
  }

  updateLetters() {
    setState(() {
      gameService.playersRack;
    });
  }
}
