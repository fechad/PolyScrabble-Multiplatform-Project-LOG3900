import 'package:flutter/material.dart';
class Palette {
  static const MaterialColor mainColor = const MaterialColor(
    0xff7daf6b, // 0% comes in here, this will be color picked if no shade is selected when defining a Color property which doesn’t require a swatch.
    const <int, Color>{
      50: const Color(0xff7daf6b),//10%
      100: const Color(0xff8ab77a),//20%
      200: const Color(0xff97bf89),//30%
      300: const Color(0xffa4c797),//40%
      400: const Color(0xffb1cfa6),//50%
      500: const Color(0xffbed7b5),//60%
      600: const Color(0xffcbdfc4),//70%
      700: const Color(0xffe5efe1),//80%
      800: const Color(0xfff2f7f0),//90%
      900: const Color(0xffffffff),//100%
    },
  );
}
