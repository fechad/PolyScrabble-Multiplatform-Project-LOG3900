import 'package:http/http.dart' as http;

import '../config/environment.dart';

const String authUrl = 'auth';
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

  Future<List<String>> getUsernames() async {
    final response =
        await http.get(Uri.parse('$url/api/$authUrl/usernames'));
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
}
