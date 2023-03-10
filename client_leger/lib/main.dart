import 'package:client_leger/pages/connexion_page.dart';
import 'package:client_leger/services/auth_service.dart';
import 'package:flutter/material.dart';

import 'pages/home_page.dart';

AuthService authenticator = AuthService();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  authenticator = await AuthService.create();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  static const bool isProduction = bool.fromEnvironment('dart.vm.product');
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        title: 'Flutter Demo',
        theme: ThemeData(
          // This is the theme of your application.
          //
          // Try running your application with "flutter run". You'll see the
          // application has a blue toolbar. Then, without quitting the app, try
          // changing the primarySwatch below to Colors.green and then invoke
          // "hot reload" (press "r" in the console where you ran "flutter run",
          // or simply save your changes to "hot reload" in a Flutter IDE).
          // Notice that the counter didn't reset back to zero; the application
          // is not restarted.
          primarySwatch: Colors.blue,
        ),
        //home: const MyHomePage(title: 'PolyScrabble'),
        home: true //isProduction
            ? ConnexionPageWidget()
            : /*GamePageWidget()); //:*/ MyHomePage(title: 'PolyScrabble'));
  }
}

class RebuildController {
  final GlobalKey rebuildKey = GlobalKey();

  void rebuild() {
    void rebuild(Element el) {
      el.markNeedsBuild();
      el.visitChildren(rebuild);
    }

    (rebuildKey.currentContext as Element).visitChildren(rebuild);
  }
}

class RebuildWrapper extends StatelessWidget {
  final RebuildController controller;
  final Widget child;

  const RebuildWrapper(
      {Key? key, required this.controller, required this.child})
      : super(key: key);

  @override
  Widget build(BuildContext context) => Container(
        key: controller.rebuildKey,
        child: child,
      );
}
