import '../pages/chat_page.dart';

class ChatModel {
  String name;
  String? owner;
  List<String> activeUsers;
  List<ChatMessage> messages;
  ChatModel(
      {required this.name,
      this.owner,
      required this.activeUsers,
      required this.messages});

  ChatModel.fromJson(dynamic json, jsonMessages)
      : name = json['name'],
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
