import 'package:client_leger/components/objective_box.dart';
import 'package:client_leger/components/your_rack.dart';

import '../components/avatar_list.dart';
import '../components/board.dart';
import '../components/sidebar.dart';
import '../config/colors.dart';
import '../config/flutter_flow/flutter_flow_theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';


class GamePageWidget extends StatefulWidget {
  const GamePageWidget({Key? key}) : super(key: key);

  @override
  _GamePageWidgetState createState() => _GamePageWidgetState();
}

class _GamePageWidgetState extends State<GamePageWidget> {

  final scaffoldKey = GlobalKey<ScaffoldState>();
  final _unfocusNode = FocusNode();

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {

    _unfocusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    final screenWidth = mediaQuery.size.width;
    final screenHeight = mediaQuery.size.height;
    return Scaffold(
      backgroundColor: Color.fromRGBO(249, 255, 246, 1),
      body: Row(
    children: [
    CollapsingNavigationDrawer(),
    Column(children: [Container(
    width: screenWidth * 0.65,
    height: screenHeight,
    child: Board(),
    )

    ]),
    Column(
    children: [
    SizedBox(height: 10),
    Row(
    mainAxisAlignment: MainAxisAlignment.center,
    children: [

    Icon(Icons.filter_none, size: 32),
    Text(
    '  80',
    style: TextStyle(
    color: Colors.black,
    fontFamily: 'Nunito',
    fontSize: 24,
    )),
    SizedBox(
    width: 85,
    ),
    Container(
    decoration: BoxDecoration(
    border: Border.all(
    color: Colors.black,
    width: 2,
    ),
    ),
    child: SizedBox(
    width: 60,
    height: 40,
    child: Center(
    child: Text(
    '1:00',
    style: TextStyle(
    fontSize: 24,
    color: Colors.black
    )
    )
    )
    ),
    ),
    SizedBox(
    width: 115,
    ),
    Icon(Icons.lightbulb_outline_rounded, size: 40)
    ]
    ), SizedBox(height: 20),
      AvatarList(),
      SizedBox(height: 10),
      ObjectiveBox(),
      SizedBox(height:32),
      YourRack(),
      SizedBox(height:16),
      Row(
        children: [
          ElevatedButton(
            onPressed: ()=>{},
            style: ButtonStyle(
                backgroundColor: MaterialStatePropertyAll<Color>(Color(0xFFFF4C4C))),
            child: Text('Annuler'),
          ),
          SizedBox(width: 24,),
          ElevatedButton(
              onPressed: ()=>{},
              style: ButtonStyle(
                  backgroundColor:
                  const MaterialStatePropertyAll<Color>(Palette.mainColor)),
              child: Text('Échanger'),
          )
        ],
      )
    ]
    )
    ])
    );
  }
}
