import '../classes/game.dart';
import '../pages/chat_page.dart';

class ChatModel {
  String name;
  Account? owner;
  List<String> activeUsers;
  List<ChatMessage> messages;
  ChatModel(
      {required this.name,
      this.owner,
      required this.activeUsers,
      required this.messages});

  ChatModel.fromJson(dynamic json, jsonMessages, [jsonAccount])
      : name = json['name'],
        owner = jsonAccount,
        activeUsers = json['activeUsers']
            .toString()
            .replaceAll('[', '')
            .replaceAll(']', '')
            .split(','),
        messages = jsonMessages;

  Map<String, dynamic> toJson() => {
        'name': name,
        'owner': owner,
        'activeUsers': activeUsers,
        'messages': messages
      };
}
