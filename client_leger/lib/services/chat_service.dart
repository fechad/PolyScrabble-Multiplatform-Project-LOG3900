import 'package:client_leger/components/chat_model.dart';
import 'package:client_leger/config/flutter_flow/flutter_flow_util.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/chat_page.dart';
import 'package:intl/intl.dart';

import 'init_service.dart';

class ChatService {
  List<ChatModel> discussionChannels = [
    ChatModel(name: 'General Chat', activeUsers: [], messages: [])
  ];
  ChatModel _roomChannel = ChatModel(name: '', activeUsers: [], messages: []);
  ChatService() {
    _askForDiscussions();
    joinDiscussion('General Chat');
    print(socket.connected);
    print('This is my SOCKET ID: ');
    print(socket.id);
  }

  String getTime() {
    return DateFormat('HH:mm:ss').format(DateTime.now());
  }

  List<ChatModel> getDiscussions() {
    return discussionChannels;
  }

  ChatModel getRoomChannel() {
    return _roomChannel;
  }

  setRoomChannel(ChatModel chat) {
    _roomChannel = chat;
  }

  ChatModel decodeModel(dynamic data) {
    List<ChatMessage> messages = [];
    for (var j in data['messages']) {
      messages.add(decodeMessage(j));
    }
    ChatModel discussionChannels = ChatModel.fromJson(data, messages);
    return discussionChannels;
  }

  ChatMessage decodeMessage(dynamic data) {
    ChatMessage res = ChatMessage.fromJson(data);
    return res;
  }

  void _askForDiscussions() async {
    socket.emit('getDiscussionChannels');
  }

  void addDiscussion(String name) {
    socket
        .emit('createChatChannel', [name, authenticator.currentUser.username]);
  }

  void deleteDiscussion(String name) {
    // ignore: list_remove_unrelated_type
    discussionChannels.remove((chat) =>
        chat.name == name && chat.owner == authenticator.currentUser.username);
  }

  void addMessage({required String channelName, required ChatMessage message}) {
    socket.emit('chatChannelMessage', {message});
  }

  void joinDiscussion(channelName) {
    socket.emitWithAck('joinChatChannel',
        {'name': channelName, 'user': authenticator.currentUser.username},
        ack: (data) => discussionChannels = data);
  }

  void leaveDiscussion(channelName, username) {
    socket.emit('leaveChatChannel', {
      'channel': channelName,
      'username': authenticator.currentUser.username
    });
  }

  ChatModel getDiscussionChannelByName(String name) {
    if (name == _roomChannel.name) return _roomChannel;
    for (var channel in getDiscussions()) {
      if (channel.name == name) return channel;
    }
    return ChatModel(name: '', activeUsers: [], messages: []);
  }
}
