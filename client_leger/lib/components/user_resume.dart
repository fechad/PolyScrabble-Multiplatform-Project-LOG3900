import 'package:client_leger/components/highscores.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../config/colors.dart';
import '../pages/profile_page.dart';

class UserResume extends StatefulWidget {



  @override
  _UserResumeState createState() => _UserResumeState();
}

class _UserResumeState extends State<UserResume> {
  List<Widget> badges = [];
  int currentExp = 0;
  int requiredExp = 0;
  double fraction = 0;
  @override
  void initState() {
    currentExp = 300;
    requiredExp = 500;
    fraction = currentExp/requiredExp;
    for(int i=0; i<7; i++) {
      badges.add(
          Container(
            width: 36,
            height: 36,
            margin: EdgeInsets.only(left: 2.5, right: 2.5),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.grey,
            ),
          )
      );
    }
  }


  @override
  Widget build(BuildContext context) {
    return Drawer(
         child: Column(
           children: [
             Container(
               margin: EdgeInsets.all(16),
               width: 150,
               height: 150,
               decoration: BoxDecoration(
                 shape: BoxShape.circle,
                 color: Colors.grey,
               ),
             ),
             Text("Top G", style: GoogleFonts.nunito(
                      textStyle: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold
                      ),)),
             SizedBox(height: 16,),
             Row(
               mainAxisAlignment: MainAxisAlignment.center,
               children: badges,
             ),
             SizedBox(height: 16,),
             Container(
                 margin: EdgeInsets.only(right: 8, left: 8, top: 32, bottom: 32),
                 padding: EdgeInsets.only(left: 16, right: 8),
                 height: 90,
                 decoration: BoxDecoration(
                   color: Colors.white,
                   borderRadius: BorderRadius.circular(4),
                   border: Border.all(
                     color: Color(0x66000000),
                     width: 1,
                   ),
                   boxShadow: [
                     BoxShadow(
                       color: Colors.grey.withOpacity(0.5),
                       spreadRadius: 1,
                       blurRadius: 1,
                       offset: Offset(1, 2), // changes position of shadow
                     ),
                   ],
                 ),
                 child: Row(
                   children: [
                     Column(
                       mainAxisAlignment: MainAxisAlignment.center,
                       crossAxisAlignment: CrossAxisAlignment.center,
                       children: [
                         Text("niv.", style: GoogleFonts.nunito(
                           textStyle: TextStyle(
                               fontSize: 12,
                               fontWeight: FontWeight.bold
                           ),)),
                         Text("1", style: GoogleFonts.nunito(
                           textStyle: TextStyle(
                               fontSize: 24,
                               fontWeight: FontWeight.bold
                           ),))
                       ],
                     ),
                     Column(
                       crossAxisAlignment: CrossAxisAlignment.end,
                       mainAxisAlignment: MainAxisAlignment.center,
                       children: [
                         SizedBox(height: 24,),
                         Container(
                           margin: EdgeInsets.only(left:16),
                           width: 224,
                           height: 10,
                           decoration: BoxDecoration(
                               borderRadius: BorderRadius.circular(1000),
                               color: Color(0xCCCCCCCC)
                           ),
                           child: FractionallySizedBox(
                               alignment: Alignment.centerLeft,
                               widthFactor: fraction,
                               heightFactor: 1,
                               child: Container(
                                 decoration: BoxDecoration(
                                     borderRadius: BorderRadius.circular(1000),
                                     color: Palette.mainColor
                                 ),
                               )
                           ),
                         ),
                         SizedBox(height: 8,),
                         Text(currentExp.toString() + " / " + requiredExp.toString(), style: GoogleFonts.nunito(
                           textStyle: TextStyle(
                               color: Color(0xFFBBBBBB),
                               fontSize: 16,
                               fontWeight: FontWeight.bold
                           ),)),
                       ],
                     )
                   ],
                 )
             ),
             SizedBox(height: 32,),
             HighScores(),
             SizedBox(height: 96,),
             Container(
               width: 250,
               height: 48,
               child: ElevatedButton(onPressed: () {
                 Navigator.push(context,
                     MaterialPageRoute(builder: ((context) {
                       return UserPage();
                     })));
               },

                 style: ButtonStyle(
                     backgroundColor: MaterialStatePropertyAll<Color>(Palette.mainColor)),
                 child:
                 Text("Profil complet",

                     style: GoogleFonts.nunito(
                       textStyle: TextStyle(
                           color: Color(0xFFFFFFFF),
                           fontSize: 24,
                           fontWeight: FontWeight.bold
                       ),)),)
             )
           ],
         ),
    );
  }
}
