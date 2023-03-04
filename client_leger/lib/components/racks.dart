import 'package:client_leger/components/othersRack.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class Racks extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
        padding: EdgeInsets.only(left: 7.5, right: 5),
        child: Column(children: [
          SizedBox(height: 16),
          OthersRack(),
          SizedBox(height: 16),
          OthersRack(),
          SizedBox(height: 16),
          OthersRack(),
          SizedBox(height: 16),
          OthersRack(),
        ]));
  }
}
