import 'package:client_leger/components/user_resume.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class AvatarList extends StatefulWidget {

  AvatarList({super.key});

  @override
  _AvatarListState createState() => _AvatarListState();
}

class _AvatarListState extends State<AvatarList>{
  final scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        key: scaffoldKey,
        drawer: UserResume(),
      body:
      Container(
        height: 80,
        width: 320,
        alignment: Alignment.center,
      child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
        Column(
            children: [
              GestureDetector(
          onTap: () {
              scaffoldKey.currentState?.openDrawer();
              },
        child:
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.grey,
                ),
              )
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
    ));
  }
}
