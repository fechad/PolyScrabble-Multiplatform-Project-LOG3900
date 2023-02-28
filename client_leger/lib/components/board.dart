import 'package:flutter/material.dart';

class Board extends StatefulWidget {
  @override
  _BoardState createState() => _BoardState();
}

class _BoardState extends State<Board> {
  List<Widget> tiles = [];
  List<Widget> rows = [];
  List<String> word_3x = ["0-0", "7-0", "14-0", "0-7", "7-7", "14-7", "0-14", "7-14", "14-14"];
  List<String> word_2x = ["1-1", "2-2", "3-3", "4-4", "10-10", "11-11", "12-12", "13-13", "1-13", "2-12", "3-11", "4-10", "13-1", "12-2", "11-3", "10-4"];
  List<String> letter_3x = ["1-5", "1-9", "5-1", "5-5", "5-9", "5-13", "9-1", "9-5", "9-9", "9-13", "13-5", "13-9"];
  List<String> letter_2x = ["3-0", "11-0", "6-2", "8-2", "0-3", "7-3", "14-3", "2-6", "6-6", "8-6", "12-6", "3-7", "11-7", "2-8", "6-8", "8-8", "12-8", "0-11", "7-11", "14-11", "6-12", "8-12", "3-14", "11-14"];
  @override
  void initState() {
    super.initState();
    for (int j = 0; j < 15; j++) {
      for (int i = 0; i < 15; i++) {
        tiles.add(Container());
      }
      rows.add(Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: tiles));
      tiles = [];
      for (int i = 0; i < 15; i++) {
        colorTile(i, j);
        print(i.toString() + "-" + j.toString());
      }
    }


  }

  void colorTile(int x, int y) {
      if (word_3x.contains(x.toString() + "-" + y.toString())) (rows[y] as Row).children[x] =
            DragTarget<String>(
              builder: (context, List<String?> candidateData, rejectedData) {
                return Container(
                  height: 45,
                  width: 45,
                  decoration: BoxDecoration(
                    color: candidateData.isEmpty ? Color(0xFFE8A1A1) : Color(0xCCCCB89B),
                    border: Border.all(
                      color: Color(0xFFFFFFFF),
                      width: 0.5,
                    ),
                  ),
                  child: Center(child: Text('Mot x3', style: TextStyle(fontSize: 10, color: Colors.white), ))
                );
              },
              onAccept: (String data) {
                print('Data accepted: $data');
              },
            );
      else if (word_2x.contains(x.toString() + "-" + y.toString())) (rows[y] as Row).children[x] =
          DragTarget<String>(
            builder: (context, List<String?> candidateData, rejectedData) {
              return Container(
                  height: 45,
                  width: 45,
                  decoration: BoxDecoration(
                    color: candidateData.isEmpty ? Color(0xFFFFC7C7) : Color(0xCCCCB89B),
                    border: Border.all(
                      color: Color(0xFFFFFFFF),
                      width: 0.5,
                    ),
                  ),
                  child: Center(child: Text('Mot x2', style: TextStyle(fontSize: 10, color: Colors.white), ))
              );
            },
            onAccept: (String data) {
              print('Data accepted: $data');
            },
          );
      else if (letter_3x.contains(x.toString() + "-" + y.toString())) (rows[y] as Row).children[x] =
          DragTarget<String>(
            builder: (context, List<String?> candidateData, rejectedData) {
              return Container(
                  height: 45,
                  width: 45,
                  decoration: BoxDecoration(
                    color: candidateData.isEmpty ? Color(0xFFA8BBFF) : Color(0xCCCCB89B),
                    border: Border.all(
                      color: Color(0xFFFFFFFF),
                      width: 0.5,
                    ),
                  ),
                  child: Center(child: Text('Lettre x3', style: TextStyle(fontSize: 10, color: Colors.white), ))
              );
            },
            onAccept: (String data) {
              print('Data accepted: $data');
            },
          );
      else if (letter_2x.contains(x.toString() + "-" + y.toString())) (rows[y] as Row).children[x] =
          DragTarget<String>(
            builder: (context, List<String?> candidateData, rejectedData) {
              return Container(
                  height: 45,
                  width: 45,
                  decoration: BoxDecoration(
                    color: candidateData.isEmpty ? Color(0xFFBBBECA) : Color(0xCCCCB89B),
                    border: Border.all(
                      color: Color(0xFFFFFFFF),
                      width: 0.5,
                    ),
                  ),
                  child: Center(child: Text('Lettre x2', style: TextStyle(fontSize: 10, color: Colors.white), ))
              );
            },
            onAccept: (String data) {
              print('Data accepted: $data');
            },
          );
      else (rows[y] as Row).children[x] =
          DragTarget<String>(
            builder: (context, List<String?> candidateData, rejectedData) {
              return Container(
                height: 45,
                width: 45,
                decoration: BoxDecoration(
                  color: candidateData.isEmpty ? Color(0xFFFFEBCE) : Color(0xCCCCB89B),
                  border: Border.all(
                    color: Color(0xFFFFFFFF),
                    width: 0.5,
                  ),
                ),
              );
            },
            onAccept: (String data) {
              print('Data accepted: $data');
            },
          );
    }

  //(rows[0] as Row).children[0] to access a children
  @override
  Widget build(BuildContext context) {

    return Column(mainAxisAlignment: MainAxisAlignment.center, children: rows,);
  }
}
