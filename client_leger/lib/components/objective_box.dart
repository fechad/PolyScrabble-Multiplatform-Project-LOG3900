import 'package:client_leger/components/objectives.dart';
import 'package:client_leger/components/racks.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ObjectiveBox extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 340,
      height: 425,
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
              width: 300,
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
                          Tab(text: 'Objectifs'),
                          Tab(text: 'Chevalets'),
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
                Objectives(),
                Row(mainAxisAlignment: MainAxisAlignment.center ,children:[Racks()]),
              ],
            ),
          ),
        )),
      ),
    );
  }
}
