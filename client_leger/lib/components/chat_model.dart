
import 'package:client_leger/components/user_model.dart';
import 'package:client_leger/services/chat_service.dart';

import '../pages/chat_page.dart';

class ChatModel {
  String name;
  String icon;
  UserModel owner;
  int activeUsers;
  String time;
  String newMessage;
  List<ChatMessage> messages;
  ChatModel({required this.name, required this.icon, required this.owner, required this.activeUsers, required this.time, required this.newMessage, required this.messages});
}
