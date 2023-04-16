import 'dart:convert';

import 'package:client_leger/components/chat_model.dart';
import 'package:client_leger/config/flutter_flow/flutter_flow_util.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/chat_page.dart';
import 'package:intl/intl.dart';

import '../classes/game.dart';
import 'init_service.dart';

class ChatService {
  List<ChatModel> discussionChannels = [
    ChatModel(name: 'Principal', activeUsers: [], messages: [])
  ];
  Account owner = Account(
      username: '',
      email: '',
      userSettings: UserSettings(
          avatarUrl: '',
          defaultLanguage: '',
          defaultTheme: '',
          victoryMusic: ''),
      progressInfo: ProgressInfo(
          totalXP: 0,
          currentLevel: 0,
          currentLevelXp: 0,
          xpForNextLevel: 0,
          victoriesCount: 0),
      highScores: null,
      badges: [],
      bestGames: [],
      gamesPlayed: [],
      gamesWon: 0);
  ChatModel _roomChannel = ChatModel(name: '', activeUsers: [], messages: []);
  ChatService() {
    _askForDiscussions();
    joinDiscussion('Principal');
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

  saveRoomMessages(List<ChatMessage> messages){
    _roomChannel.messages = messages;
  }

  ChatModel decodeModel(dynamic data) {
    List<ChatMessage> messages = [];
    for (var j in data['messages']) {
      messages.add(decodeMessage(j));
    }

    ChatModel discussionChannels = ChatModel.fromJson(data, messages);
    if (data['name'] != 'Principal' && !data['name'].startsWith('R-')) {
      owner = Account.fromJson(data['owner']);
    }
    discussionChannels.owner = owner;
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
    socket.emit('createChatChannel', {
      'channel': name,
      'username': authenticator.getCurrentUser(),
      'isRoomChannel': false
    });
    joinDiscussion(name);
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

  void creatorLeaveDiscussion(String channelName) {
    socket.emit("creatorLeaveChatChannel", {
      'channel': channelName,
      'isRoomChannel': false,
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
