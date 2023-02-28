import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:google_fonts/google_fonts.dart';

class OthersRack extends StatelessWidget {


  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
         Row(children: [
           Container(
             margin: EdgeInsets.only(right: 8),
              width: 30,
              height: 30,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.grey,
              ),
            ),
           Text('Anna Guo', style: GoogleFonts.nunito(
             textStyle: TextStyle(
               fontSize: 18,
             ),
           ),)
         ]),
          SizedBox(height: 8),
          // A rack

          Container(
              child: Row(
                  children: [
                    Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          color: Color(0xFFFFEBCE),
                          border: Border.all(
                            color: Color(0x11000000),
                            width: 1,
                          ),
                        ),
                        margin: EdgeInsets.only(left:2.5, right: 2.5),
                        width: 35,
                        height: 35,
                        child: Center(
                            child: Text(
                                'A',
                                style: TextStyle(
                                    fontSize: 24
                                )
                            ))
                    ),
                    Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          color: Color(0xFFFFEBCE),
                          border: Border.all(
                            color: Color(0x11000000),
                            width: 1,
                          ),
                        ),
                        margin: EdgeInsets.only(left:2.5, right: 2.5),
                        width: 35,
                        height: 35,
                        child: Center(
                            child: Text(
                                'N',
                                style: TextStyle(
                                    fontSize: 24
                                )
                            ))
                    ),
                    Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          color: Color(0xFFFFEBCE),
                          border: Border.all(
                            color: Color(0x11000000),
                            width: 1,
                          ),
                        ),
                        margin: EdgeInsets.only(left:2.5, right: 2.5),
                        width: 35,
                        height: 35,
                        child: Center(
                            child: Text(
                                'N',
                                style: TextStyle(
                                    fontSize: 24
                                )
                            ))
                    ),
                    Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          color: Color(0xFFFFEBCE),
                          border: Border.all(
                            color: Color(0x11000000),
                            width: 1,
                          ),
                        ),
                        margin: EdgeInsets.only(left:2.5, right: 2.5),
                        width: 35,
                        height: 35,
                        child: Center(
                            child: Text(
                                'A',
                                style: TextStyle(
                                    fontSize: 24
                                )
                            ))
                    ),
                    Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          color: Color(0xFFFFEBCE),
                          border: Border.all(
                            color: Color(0x11000000),
                            width: 1,
                          ),
                        ),
                        margin: EdgeInsets.only(left:2.5, right: 2.5),
                        width: 35,
                        height: 35,
                        child: Center(
                            child: Text(
                                'G',
                                style: TextStyle(
                                    fontSize: 24
                                )
                            ))
                    ),
                    Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          color: Color(0xFFFFEBCE),
                          border: Border.all(
                            color: Color(0x11000000),
                            width: 1,
                          ),
                        ),
                        margin: EdgeInsets.only(left:2.5, right: 2.5),
                        width: 35,
                        height: 35,
                        child: Center(
                            child: Text(
                                'U',
                                style: TextStyle(
                                    fontSize: 24
                                )
                            ))
                    ),
                    Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          color: Color(0xFFFFEBCE),
                          border: Border.all(
                            color: Color(0x11000000),
                            width: 1,
                          ),
                        ),
                        margin: EdgeInsets.only(left:2.5, right: 2.5),
                        width: 35,
                        height: 35,
                        child: Center(
                            child: Text(
                                'O',
                                style: TextStyle(
                                    fontSize: 24
                                )
                            ))
                    ),








                  ]
              )
          )
        ]
    );
  }
}
