
import 'package:flutter/material.dart';

class BorderService {
  getBorder(int level) {
    String path = '';
    if (level >= 2)
       path = "assets/images/borders/bronze.png";
    if (level >= 5)
      path = "assets/images/borders/silver.png";
    if (level >= 10)
      path = "assets/images/borders/gold.png";
    return path;
  }
  border(String path) {
    if (path == "")
      return Container(
        height: 200,
        width: 200,
      );
    else
      return Container(
          height: 200,
          width: 200,
          child: Image.asset(path)
      );
  }
}
