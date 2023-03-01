import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class AvatarList extends StatelessWidget {


  @override
  Widget build(BuildContext context) {
    return Container(
        height: 80,
        width: 320,
        alignment: Alignment.center,
      child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
        Column(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.grey,
                ),
              ),
              SizedBox(height: 10),
              Text("251", style: TextStyle(fontSize: 14, color: Colors.black))
            ]
        ),
        SizedBox(width: 10),
        Column(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.grey,
                ),
              ),
              SizedBox(height: 10),
              Text("251", style: TextStyle(fontSize: 14, color: Colors.black))
            ]
        ),
        SizedBox(width: 10),
        Column(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.grey,
                ),
              ),
              SizedBox(height: 10),
              Text("251", style: TextStyle(fontSize: 14, color: Colors.black))
            ]
        ),
        SizedBox(width: 10),
        Column(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.grey,
                ),
              ),
              SizedBox(height: 10),
              Text("251", style: TextStyle(fontSize: 14, color: Colors.black))
            ]
        )
      ])
    );
  }
}
