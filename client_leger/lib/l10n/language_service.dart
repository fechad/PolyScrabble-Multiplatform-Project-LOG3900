import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_localization.dart';

class LanguageService extends ChangeNotifier {
  Locale _currentLanguage = AppLocalizations.supportedLocales[0];

  Locale get currentLanguage => _currentLanguage;

  void switchLanguage(String lang) {
    _currentLanguage = Locale(lang);
    notifyListeners();
  }
}
