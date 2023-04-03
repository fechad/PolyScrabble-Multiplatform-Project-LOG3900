import 'dart:convert';

import 'package:http/http.dart' as http;

import '../classes/game.dart';
import '../config/environment.dart';

const String authUrl = 'auth';
const String userInfoUrl = 'userInfo';
const String opponentInfoUrl = 'opponentInfo';
const String avatarUrl = 'images/avatars';
const String badgeUrl = 'images/badges';
const String baseUrl = environment;
String url = getServerURL();

class HttpService {
  HttpService();
  Future<http.Response> loginUser(String username) {
    String loginUrl = '$url/api/$authUrl/login';
    return http.put(Uri.parse(loginUrl), body: {"username": username});
  }

  Future<http.Response> logoutUser(String username) {
    String loginUrl = '$url/api/$authUrl/logout';
    return http.put(Uri.parse(loginUrl), body: {"username": username});
  }

  Future<http.Response> getUserInfo(String email) {
    return http.get(Uri.parse('$url/api/userInfo/$email'));
  }

  Future<http.Response> getStatsInfo(String email) {
    return http.get(Uri.parse('$url/api/stats/$email'));
  }

  //  http://localhost:3000/api/stats/byUsername/Tounsi
  Future<http.Response> getOtherUserProfileInfo(String username) {
    return http.get(Uri.parse('$url/api/stats/byUsername/$username'));
  }

  Future<http.Response> createUser(String email, String username) {
    return http.post(Uri.parse('$url/api/$authUrl/user'),
        body: {"email": email, "username": username});
  }

  Future<http.Response> resetUserPassword(String email) {
    return http.post(Uri.parse('$url/api/$authUrl/user/reset/$email'),
        body: {"email": email});
  }

  Future<List<String>> getUsernames() async {
    final response = await http.get(Uri.parse('$url/api/$authUrl/usernames'));
    if (response.statusCode != 200) {
      return throw Exception(
        response.statusCode,
      );
    }

    final firstReplace = response.body.replaceAll("[", '');
    final secondReplace = firstReplace.replaceAll("]", '');
    final respJson = secondReplace.split(",");
    return Future.value(respJson);
  }

  Future<http.Response> updateUserSettings(
      String userEmail, Account clientAccountInfo) {
    final Map<String, dynamic> body = {
      'username': clientAccountInfo.username,
      'email': clientAccountInfo.email,
      'userSettings': {
        'avatarUrl': clientAccountInfo.userSettings.avatarUrl,
        'defaultLanguage': clientAccountInfo.userSettings.defaultLanguage,
        'defaultTheme': clientAccountInfo.userSettings.defaultTheme,
        'victoryMusic': clientAccountInfo.userSettings.victoryMusic,
      },
      'progressInfo': {
        'totalXP': clientAccountInfo.progressInfo.totalXP,
        'currentLevel': clientAccountInfo.progressInfo.currentLevel,
        'currentLevelXp': clientAccountInfo.progressInfo.currentLevelXp,
        'xpForNextLevel': clientAccountInfo.progressInfo.xpForNextLevel,
        'victoriesCount': clientAccountInfo.progressInfo.victoriesCount
      },
      'totalXP': clientAccountInfo.progressInfo.totalXP,
      'highScores': clientAccountInfo.highScores,
      'badges': clientAccountInfo.badges,
      'bestGames': clientAccountInfo.bestGames,
      'gamesPlayed': clientAccountInfo.gamesPlayed,
      'gamesWon': clientAccountInfo.gamesWon,
    };

    return http.patch(Uri.parse('${url}/api/${userInfoUrl}/${userEmail}'),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode(body));
  }
}
