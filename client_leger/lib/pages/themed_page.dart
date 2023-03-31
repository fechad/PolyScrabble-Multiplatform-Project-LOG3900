import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/components/themed_jv.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';
import 'package:google_fonts/google_fonts.dart';

import '../components/sidebar.dart';
import '../main.dart';
import 'home_page.dart';

class ThemedPage extends StatefulWidget {
  const ThemedPage({super.key});

  @override
  State<ThemedPage> createState() => _ThemedPageState();
}

class _ThemedPageState extends State<ThemedPage> {
  final scaffoldKey = GlobalKey<ScaffoldState>();
  List<Widget> allJV = [];
  List<Widget> easyJV = [];
  List<Widget> hardJV = [];
  List<int> times = [90, 120, 90, 60, 30];
  List<int> difficulty = [2, 1, 2, 3, 5];
  List<String> names = ["Mozart", "Santa", "Serena", "Trump", "Einstein"];
  String path = "assets/images/avatars/";
  final hasBeatenSanta = authenticator.currentUser.badges[0] == ""
      ? false
      : authenticator.currentUser.badges.toString().contains('Santa');

  Future<void> _showMyDialog(
      BuildContext context, String name, int difficulty, int time) async {
    backgroundService.setBackground(name);
    if (hasBeatenSanta || name == "Santa")
      return showDialog<void>(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            content: ThemedJV(name: name, difficulty: difficulty, time: time),
          );
        },
      );
  }

  @override
  void initState() {
    super.initState();
    List<Widget> hardness = [];
    for (int i = 0; i < 5; i++) {
      for (int j = 0; j < difficulty[i]; j++)
        hardness.add(Text('💀',
            style: TextStyle(
              fontSize: 32,
            )));
      allJV.add(Container(
        height: 300,
        margin: EdgeInsets.all(20),
        child: Column(children: [
          Container(
              margin: EdgeInsets.only(bottom: 10),
              height: 250,
              width: 250,
              decoration: BoxDecoration(
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.2),
                    spreadRadius: 2,
                    blurRadius: 7,
                    offset: Offset(0, 0),
                  ),
                ],
                borderRadius: BorderRadius.all(Radius.circular(4)),
                border: Border.all(
                  color: Color(0x22000000),
                  width: 2.0,
                  style: BorderStyle.solid,
                ),
              ),
              child: GestureDetector(
                onTap: () async {
                  await _showMyDialog(
                      context, names[i], difficulty[i], times[i]);
                },
                child: Image.asset(
                  hasBeatenSanta || names[i] == "Santa"
                      ? path + names[i] + "Avatar.png"
                      : path + "lock.png",
                ),
              )),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: hardness,
          )
        ]),
      ));
      hardness = [];
    }
    for (int i = 0; i < 5; i++) {
      if (i > 2)
        hardJV.add(allJV[i]);
      else
        easyJV.add(allJV[i]);
    }
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: ChatDrawer(),
      body: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          CollapsingNavigationDrawer(),
          Expanded(
              child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                AppLocalizations.of(context)!.themeTitle,
                style: GoogleFonts.nunito(
                  textStyle:
                      TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: easyJV,
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: hardJV,
              ),
            ],
          ))
        ],
      ),
    );
  }
}
