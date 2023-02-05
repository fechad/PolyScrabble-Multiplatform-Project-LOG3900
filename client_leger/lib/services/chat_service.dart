import 'package:client_leger/components/chat_model.dart';
import 'package:client_leger/config/flutter_flow/flutter_flow_util.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/chat_page.dart';
import 'package:client_leger/pages/home_page.dart';
import 'package:intl/intl.dart';

class ChatService {
  List<ChatModel> _discussionChannels = [
    ChatModel(name: 'General Chat', activeUsers: 1, messages: [])
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
    return DateFormat('kk:mm:ss').format(DateTime.now());
  }

  List<ChatModel> getDiscussions() {
    return _discussionChannels;
  }

  void _configureSocket() async {
    socket.on(
        'channelMessage',
        (data) => {
              print(data),
              print('received new message'),
              if (data['system'])
                {
                  _discussionChannels[0].messages.insert(
                      0,
                      ChatMessage(
                          channelName: data['channelName'],
                          system: true,
                          time: data['time'],
                          message: data['message']))
                }
              else
                {
                  _discussionChannels[0].messages.insert(
                      0,
                      ChatMessage(
                          channelName: data['channelName'],
                          system: false,
                          sender: data['sender'],
                          time: data['time'],
                          message: data['message']))
                },
              print(_discussionChannels[0].messages)
            });

    socket.on(
        'availableChannels',
        (data) => {
              //print('update'),
              //print(data.runtimeType),
              _discussionChannels = [],
              for (var i in data)
                {print(i), _discussionChannels.add(decodeModel(i))},

              // ignore: avoid_print
              print(_discussionChannels[0])
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
    //print(data['messages']);
    List<ChatMessage> messages = [];
    for (var j in data['messages']) {
      messages.add(decodeMessage(j));
    }
    //print('converted all messages');
    ChatModel discussionChannels = ChatModel.fromJson(data, messages);
    //print('converted channel');
    return discussionChannels;
  }

  ChatMessage decodeMessage(dynamic data) {
    //print(data['system']);
    ChatMessage res = ChatMessage.fromJson(data);
    //print(res);
    return res;
  }

  void _askForDiscussions() async {
    socket.emit('getDiscussionChannels');
  }

  void addDiscussion(String name) {
    socket
        .emit('createChatChannel', [name, authenticator.currentUser.username]);
    print('Adding new channel');
  }

  void deleteDiscussion(String name) {
    // ignore: list_remove_unrelated_type
    _discussionChannels.remove((chat) =>
        chat.name == name && chat.owner == authenticator.currentUser.username);
  }

  void addMessage({required String channelName, required ChatMessage message}) {
    print(message);
    socket.emit('chatChannelMessage', {message});
  }

  void joinDiscussion(channelName) {
    print(_discussionChannels);
    socket.emitWithAck('joinChatChannel',
        {'name': channelName, 'user': authenticator.currentUser.username},
        ack: (data) => _discussionChannels = data);
  }

  void leaveDiscussion(channelName, username) {
    socket.emit(
        'leaveChatChannel', [channelName, authenticator.currentUser.username]);
  }
}
