import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

class YourRack extends StatelessWidget {


  @override
  Widget build(BuildContext context) {
    return

          Container(
            height: 60,
              decoration: BoxDecoration(
                color: Color(0xAAA17360),
                borderRadius: BorderRadius.circular(4),
                border: Border.all(
                  color: Color(0x44000000),
                  width: 1,
                ),
              ),
              child: Row(
                  children: [
                    Draggable( child:
                    Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          color: Color(0xFFFFEBCE),
                          border: Border.all(
                            color: Color(0xAA000000),
                            width: 1,
                          ),
                        ),
                        margin: EdgeInsets.only(left:2.5, right: 2.5),
                        width: 45,
                        height: 45,
                        child: Center(
                            child: Text(
                                'A',
                                style: TextStyle(
                                    fontSize: 24
                                )
                            ))
                    ),
                        feedback: Container(
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(10),
                              color: Color(0xFFFFEBCE),
                              border: Border.all(
                                color: Color(0xAA000000),
                                width: 1,
                              ),
                            ),
                            margin: EdgeInsets.only(left:2.5, right: 2.5),
                            width: 50,
                            height: 50,
                            child: Center(
                                child: Text(
                                    'A',
                                    style: TextStyle(
                                        fontSize: 24, color: Colors.black
                                    )
                                ))
                        )),
                    Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          color: Color(0xFFFFEBCE),
                          border: Border.all(
                            color: Color(0xAA000000),
                            width: 1,
                          ),
                        ),
                        margin: EdgeInsets.only(left:2.5, right: 2.5),
                        width: 45,
                        height: 45,
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
                            color: Color(0xAA000000),
                            width: 1,
                          ),
                        ),
                        margin: EdgeInsets.only(left:2.5, right: 2.5),
                        width: 45,
                        height: 45,
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
                            color: Color(0xAA000000),
                            width: 1,
                          ),
                        ),
                        margin: EdgeInsets.only(left:2.5, right: 2.5),
                        width: 45,
                        height: 45,
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
                            color: Color(0xAA000000),
                            width: 1,
                          ),
                        ),
                        margin: EdgeInsets.only(left:2.5, right: 2.5),
                        width: 45,
                        height: 45,
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
                            color: Color(0xAA000000),
                            width: 1,
                          ),
                        ),
                        margin: EdgeInsets.only(left:2.5, right: 2.5),
                        width: 45,
                        height: 45,
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
                            color: Color(0xAA000000),
                            width: 1,
                          ),
                        ),
                        margin: EdgeInsets.only(left:2.5, right: 2.5),
                        width: 45,
                        height: 45,
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

    );
  }
}
