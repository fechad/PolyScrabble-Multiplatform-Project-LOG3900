import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

import '../classes/game.dart';
import '../config/environment.dart';

const String authUrl = 'auth';
const String userInfoUrl = 'userInfo';
const String opponentInfoUrl = 'opponentInfo';
const String avatarUrl = 'images/avatars';
const String badgeUrl = 'images/badges';
const String baseUrl = environment;
const String CLOUD_NAME = 'dejrgre8q';
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

  Future<http.Response> loginUserLogs(String email) {
    return http.get(Uri.parse('$url/api/$authUrl/user/$email'));
  }

  Future<http.Response> logoutUserLogs(String username) {
    String logoutUrl = '$url/api/$authUrl/logout';
    return http.put(Uri.parse(logoutUrl), body: {"username": username});
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

  Future<http.Response> getCloudinarySignature() {
    return http
        .get(Uri.parse('$url/api/images/signature'))
        .catchError((e) => print(e));
  }

  Future<http.Response> uploadFile(Map<dynamic, dynamic> data) async {
    var stream = http.ByteStream(Stream.castFrom(data['file'].openRead()));
    var length = await data['file'].length();

    var uri =
        Uri.parse('https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload');

    var request = http.MultipartRequest("POST", uri);
    var multipartFile = http.MultipartFile('file', stream, length,
        filename: data['file'].path.split('/').last,
        contentType: MediaType('image', 'jpeg'));
    request.files.add(multipartFile);
    request.fields.addAll(<String, String>{
      'signature': data['signature'],
      'timestamp': data['timestamp'],
      'api_key': data['api_key']
    });

    final res = await request.send();
    return http.Response.fromStream(res);
  }
}
