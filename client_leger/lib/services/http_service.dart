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
      String userEmail, UserSettings newSettings) {
    //this.clearError();
    return http.patch(Uri.parse('${url}/api/${userInfoUrl}/${userEmail}'),
        body: newSettings.toJson());
  }

  Future<http.Response> getOpponentInfo(String username) {
    //this.clearError();
    return http.get(
      Uri.parse('${url}/api/${userInfoUrl}/${opponentInfoUrl}/${username}'),
    );
  }
}
