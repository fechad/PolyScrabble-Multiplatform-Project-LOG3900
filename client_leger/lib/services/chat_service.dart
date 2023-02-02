import 'package:client_leger/components/chat_model.dart';
import 'package:client_leger/components/user_model.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/pages/chat_page.dart';
import 'package:client_leger/pages/home_page.dart';
import 'package:intl/intl.dart';

class ChatService {
  static List<ChatModel> discussionChannels = [
    ChatModel(
      name: 'General group',
      owner: authenticator.getCurrentUser(),
      activeUsers: 1,
      newMessage: 'Welcome to PolyScrabble!',
      messages: [
        ChatMessage(
            system: true,
            sender: null,
            time: DateFormat('yyyy-MM-dd – kk:mm').format(DateTime.now()),
            message: 'Welcome to PolyScrabble!')
      ],
      time: DateFormat('yyyy-MM-dd – kk:mm').format(DateTime.now()),
      icon: "", //add path to icon
    )
  ];

  ChatService() {
    getDiscussions();
    joinDiscussion('General Chat');
    print(socket.connected);
    socket.on(
        'message',
        (data) => {
              if (data.system)
                {
                  discussionChannels[data.roomName].messages.add(ChatMessage(
                      system: true,
                      sender: null,
                      time: getTime(),
                      message: data.message))
                }
              else
                {
                  discussionChannels[data.roomName].messages.add(ChatMessage(
                      system: false,
                      sender: UserModel(
                          username: data.sender.username,
                          email: data.sender.email,
                          icon: data.sender.icon,
                          level: data.sender.level,
                          badges: data.sender.badges,
                          highScore: data.sender.highScore,
                          gamesWon: data.sender.gamesWon),
                      time: getTime(),
                      message: data.message))
                }
            });

    socket.on('addChannel', (data) => {addDiscussion(data)});

    socket.on(
        'deleteChannel',
        (name) => {
              // ignore: list_remove_unrelated_type
              discussionChannels.remove((channel) => channel.name == name)
            });
  }

  String getTime() {
    return DateFormat('yyyy-MM-dd – kk:mm').format(DateTime.now());
  }

  List<ChatModel> getDiscussions() {
    //TODO: demande au serveur la liste des canaux de discussions actifs, puis update l'attribut discussionChannels du service.
    return discussionChannels;
  }

  void addDiscussion(String name) {
    discussionChannels.add(ChatModel(
        name: name,
        owner: authenticator.currentUser,
        activeUsers: 1,
        icon: "",
        time: getTime(),
        messages: [
          ChatMessage(
              sender: null,
              system: true,
              time: getTime(),
              message: "username has started this channel!")
        ],
        newMessage: 'username has started this channel!'));
    //TODO : envoyer le nom et les détails de la nouvelle convo au  serveur
  }

  void deleteDiscussion(String name) {
    // ignore: list_remove_unrelated_type
    discussionChannels.remove((chat) =>
        chat.name == name && chat.owner == authenticator.currentUser.username);
  }

  void addMessage({roomName, message}) {
    socket.emit('message', {message, authenticator.currentUser});
  }

  void joinDiscussion(roomName) {
    socket.emit('joinChatChannel', roomName);
  }
}
