import 'package:client_leger/components/chat_model.dart';
import 'package:client_leger/config/flutter_flow/flutter_flow_util.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/chat_page.dart';
import 'package:client_leger/pages/home_page.dart';
import 'package:intl/intl.dart';

class ChatService {
  List<ChatModel> _discussionChannels = [
    ChatModel(name: 'General Chat', activeUsers: [], messages: [])
  ];

  ChatService() {
    _configureSocket();
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
    return _discussionChannels;
  }

  void _configureSocket() async {
    socket.on(
        'channelMessage',
        (data) => {
          print('CHANNEL MESSAGE'),
              _discussionChannels[0].messages = [],
              (data as List<dynamic>).forEach((message) => {
                    _discussionChannels[0].messages.add(ChatMessage(
                        channelName: message['channelName'],
                        system: message['system'],
                        sender: message['sender'],
                        time: message['time'],
                        message: message['message'])),
                  })
            });

    socket.on(
        'availableChannels',
        (data) => {
              socket.emit('joinChatChannel',
                  {'General Chat', authenticator.currentUser.username}),
              _discussionChannels = [],
              for (var i in data)
                {print(i), _discussionChannels.add(decodeModel(i))},
            });

    socket.on('addChannel', (data) => {addDiscussion(data)});

    socket.on(
        'deleteChannel',
        (name) => {
              // ignore: list_remove_unrelated_type
              _discussionChannels.remove((channel) => channel.name == name)
            });
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
    _discussionChannels.remove((chat) =>
        chat.name == name && chat.owner == authenticator.currentUser.username);
  }

  void addMessage({required String channelName, required ChatMessage message}) {
    socket.emit('chatChannelMessage', {message});
  }

  void joinDiscussion(channelName) {
    socket.emitWithAck('joinChatChannel',
        {'name': channelName, 'user': authenticator.currentUser.username},
        ack: (data) => _discussionChannels = data);
  }

  void leaveDiscussion(channelName, username) {
    socket.emit('leaveChatChannel', {
      'channel': channelName,
      'username': authenticator.currentUser.username
    });
  }
}
