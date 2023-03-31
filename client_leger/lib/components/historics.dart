import 'package:client_leger/components/game_cards.dart';
import 'package:client_leger/components/logs.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';
import 'package:google_fonts/google_fonts.dart';

class Historics extends StatefulWidget {
  const Historics({Key? key}) : super(key: key);

  @override
  _HistoricsState createState() => _HistoricsState();
}

class _HistoricsState extends State<Historics> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    // TODO: implement build
    return Container(
      width: 500,
      height: 600,
      child: DefaultTabController(
        length: 2,
        child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(2),
              border: Border.all(
                color: Color.fromRGBO(0, 0, 0, 0.2),
                width: 1,
              ),
            ),
            child: Scaffold(
              appBar: PreferredSize(
                preferredSize: Size.fromHeight(30),
                child: Container(
                  child: SafeArea(
                    child: Column(
                      children: [
                        Expanded(
                          child: TabBar(
                            labelColor: Colors.green,
                            unselectedLabelColor: Colors.grey,
                            indicatorSize: TabBarIndicatorSize.label,
                            indicatorColor: Colors.green,
                            labelStyle: GoogleFonts.nunito(
                              textStyle: TextStyle(
                                fontSize: 18,
                              ),
                            ),
                            tabs: [
                              Tab(
                                child: Text(
                                  AppLocalizations.of(context)!
                                      .historySectionOne,
                                  style: TextStyle(fontSize: 24),
                                ),
                                height: 100,
                              ),
                              Tab(
                                child: Text(
                                  AppLocalizations.of(context)!
                                      .historySectionTwo,
                                  style: TextStyle(fontSize: 24),
                                ),
                                height: 100,
                              ),
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
                child: TabBarView(
                  children: [
                    Logs(),
                    GameCards(),
                  ],
                ),
              ),
            )),
      ),
    );
  }
}
