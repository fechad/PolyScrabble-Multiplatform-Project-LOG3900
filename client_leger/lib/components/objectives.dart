import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class Objectives extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 300,
          child: Column(
            children: [
              SizedBox(height: 16),


              // an completed objective


              Container(
                decoration: BoxDecoration(
                  color: Color(0x227DAF6B),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(
                    color: Color(0xFF7DAF6B),
                    width: 2,
                  ),
                ),
                child: Container(
                  height: 40,
                  width: 270,
                  padding: EdgeInsets.only(left:8, right: 8),
                  child: Row(
                    children: [
                      Container(
                        width:210,
                          margin: EdgeInsets.only(right: 8),
                          child:Text('Placer un palindrome',
                              style: GoogleFonts.nunito(
                                textStyle: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF7DAF6B)
                                ),
                              )
                      )),
                      Container(
                        width: 30,
                        height: 30,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.grey,
                        ),
                      ),
                    ]
                  )
                )
              ),

              SizedBox(height: 10,),

              // incompleted objective

              Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(
                      color: Color(0x44000000),
                      width: 1,
                    ),
                  ),
                  child: Container(
                      height: 40,
                      width: 270,
                      padding: EdgeInsets.only(left:8, right: 8),
                      child: Row(
                          children: [
                            Container(
                                width:210,
                                margin: EdgeInsets.only(right: 8),
                                child:Text('Placer un palindrome',
                                    style: GoogleFonts.nunito(
                                      textStyle: TextStyle(
                                          fontSize: 16,
                                          color: Color(0xFF000000)
                                      ),
                                    )
                                )),
                          ]
                      )
                  )
              ),
            ],
          )
    );

  }
}
