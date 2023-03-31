import 'package:camera/camera.dart';
import 'package:client_leger/l10n/language_service.dart';
import 'package:client_leger/pages/connexion_page.dart';
import 'package:client_leger/services/auth_service.dart';
import 'package:client_leger/theme/theme_constants.dart';
import 'package:client_leger/theme/theme_manager.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import 'l10n/l10n.dart';

AuthService authenticator = AuthService();
ThemeManager themeManager = ThemeManager();
LanguageService languageService = LanguageService();

late List<CameraDescription> cameras;
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  cameras = await availableCameras();

  authenticator = await AuthService.create();
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  static const bool isProduction = bool.fromEnvironment('dart.vm.product');

  @override
  void initState() {
    themeManager.addListener(themeListener);
    languageService.addListener(languageListener);
    super.initState();
  }

  @override
  void dispose() {
    themeManager.removeListener(themeListener);
    languageService.removeListener(languageListener);
    super.dispose();
  }

  themeListener() {
    if (mounted) {
      setState(() {});
    }
  }

  languageListener() {
    if (mounted) {
      setState(() {});
    }
  }

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        title: 'Flutter Demo',
        theme: lightTheme,
        darkTheme: darkTheme,
        supportedLocales: L10n.languages,
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate
        ],
        locale: languageService.currentLanguage,
        themeMode: themeManager.themeMode,
        home: ConnexionPageWidget()
        //MyHomePage(title: 'PolyScrabble')
        );
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
