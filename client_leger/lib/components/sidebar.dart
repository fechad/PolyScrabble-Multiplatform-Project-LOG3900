//widget from https://github.com/PrateekSharma1712/custom_navigation_drawer/blob/master/lib/commons/collapsing_navigation_drawer_widget.dart
import 'package:client_leger/pages/connexion_page.dart';
import 'package:client_leger/pages/profile_page.dart';
import 'package:client_leger/pages/settings_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_ringtone_player/flutter_ringtone_player.dart';

import '../config/colors.dart';
import '../main.dart';
import '../model/custom_navigation_drawer.dart';
import '../pages/chat_page.dart';
import '../pages/game_page.dart';
import '../pages/home_page.dart';
import '../pages/leaderboard_page.dart';
import '../pages/observer_page.dart';
import '../services/chat_service.dart';
import '../services/init_service.dart';
import '../services/link_service.dart';

final ChatService chat = chatService;

class CollapsingNavigationDrawer extends StatefulWidget {
  @override
  CollapsingNavigationDrawerState createState() {
    return new CollapsingNavigationDrawerState();
  }
}

class CollapsingNavigationDrawerState extends State<CollapsingNavigationDrawer>
    with SingleTickerProviderStateMixin {
  double maxWidth = 70;
  double minWidth = 0;
  bool isCollapsed = false;
  late AnimationController _animationController;
  late Animation<double> widthAnimation;
  int currentSelectedIndex = 0;
  late bool notify;
  String chatName = '';

  @override
  void initState() {
    super.initState();
    _animationController =
        AnimationController(vsync: this, duration: Duration(milliseconds: 300));
    widthAnimation = Tween<double>(begin: maxWidth, end: minWidth)
        .animate(_animationController);
    _configureSocket();
  }

  @override
  void dispose() {
    super.dispose();
  }

  void _configureSocket() async {
    socket.on(
        'channelMessage',
        (data) => {
              chatName = (data as List<dynamic>)[0]['channelName'],
              chatService.getDiscussionChannelByName(chatName).messages = [],
              (data).forEach((message) => {
                    chatService
                        .getDiscussionChannelByName(chatName)
                        .messages
                        .add(ChatMessage(
                            channelName: message['channelName'],
                            system: message['system'],
                            sender: message['sender'],
                            time: message['time'],
                            message: message['message'])),
                  }),
              if (chatService
                      .getDiscussionChannelByName(chatName)
                      .messages[chatService
                              .getDiscussionChannelByName(chatName)
                              .messages
                              .length -
                          1]
                      .sender !=
                  authenticator.currentUser.username)
                {
                  if (this.mounted)
                    {
                      if (linkService.getCurrentOpenedChat() != chatName)
                        {
                          linkService.pushNewChannel(chatName),
                          setState(() {
                            if (!linkService.getNewMessageBoolean())
                              linkService.newMessageChange();
                          })
                        }
                    },
                  FlutterRingtonePlayer.play(
                    android: AndroidSounds.notification,
                    ios: IosSounds.receivedMessage,
                    looping: false, // Android only - API >= 28
                    volume: 0.5, // Android only - API >= 28
                    asAlarm: false, // Android only - all APIs
                  ),
                }
            });

    socket.on(
        'availableChannels',
        (data) => {
              socket.emit('joinChatChannel',
                  {'General Chat', authenticator.currentUser.username}),
              chatService.discussionChannels = [],
              for (var i in data)
                {
                  chatService.discussionChannels.add(chatService.decodeModel(i))
                },
            });

    socket.on('addChannel', (data) => {chatService.addDiscussion(data)});

    socket.on(
        'deleteChannel',
        (name) => {
              // ignore: list_remove_unrelated_type
              chatService.discussionChannels
                  .remove((channel) => channel.name == name)
            });
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
        width: 70,
        child: AnimatedBuilder(
          animation: _animationController,
          builder: (context, widget) => getWidget(context, widget),
        ));
  }

  Widget getWidget(context, widget) {
    return Material(
      elevation: 80.0,
      child: Container(
        width: 70,
        color: Palette.darkColor.shade600,
        child: OverflowBox(
          maxWidth: 80,
          child: Column(
            children: <Widget>[
              CollapsingListTile(
                title: 'Username', icon: Icons.person,
                animationController: _animationController,
                // TODO onTap: .... send to user profile
                onTap: () {
                  Navigator.push(context,
                      MaterialPageRoute(builder: ((context) {
                    return UserPage();
                  })));
                },
                notifiable: false,
              ),
              CollapsingListTile(
                title: 'Home', icon: Icons.home,
                animationController: _animationController,
                // TODO onTap: .... send to user profile
                onTap: () {
                  Navigator.push(context,
                      MaterialPageRoute(builder: ((context) {
                    return MyHomePage(title: 'PolyScrabble');
                  })));
                },
                notifiable: false,
              ),
              Divider(height: 40.0),
              Expanded(
                child: ListView.separated(
                  separatorBuilder: (context, counter) {
                    return Divider(height: 12.0);
                  },
                  itemBuilder: (context, counter) {
                    return (counter == 2)
                        ? Padding(
                            padding: const EdgeInsets.fromLTRB(0, 0, 0, 240),
                            child: CollapsingListTile(
                              onTap: () {
                                setState(() {
                                  currentSelectedIndex = counter;
                                  Navigator.push(context,
                                      MaterialPageRoute(builder: ((context) {
                                    return ObserverPage();
                                  })));
                                });
                              },
                              isSelected: currentSelectedIndex == counter,
                              title: navigationItems[counter].title,
                              icon: navigationItems[counter].icon,
                              notifiable: navigationItems[counter].notifiable,
                            ),
                          )
                        : (counter == 0)
                            ? Stack(
                                children: [
                                  CollapsingListTile(
                                    onTap: () {
                                      setState(() {
                                        currentSelectedIndex = counter;

                                        if (counter == 0) {
                                          Scaffold.of(context).openDrawer();
                                          if (linkService
                                                  .getNewMessageBoolean() &&
                                              linkService
                                                      .getChannelWithNewMessages()
                                                      .length ==
                                                  0)
                                            linkService.newMessageChange();
                                        }
                                      });
                                    },
                                    isSelected: currentSelectedIndex == counter,
                                    title: navigationItems[counter].title,
                                    icon: navigationItems[counter].icon,
                                    notifiable:
                                        navigationItems[counter].notifiable,
                                  ),
                                  if (linkService.getNewMessageBoolean())
                                    const Positioned(
                                      // draw a red marble
                                      top: 5.0,
                                      right: 20.0,
                                      child: Icon(Icons.brightness_1,
                                          size: 16.0, color: Colors.redAccent),
                                    ),
                                ],
                              )
                            : CollapsingListTile(
                                onTap: () {
                                  setState(() {
                                    currentSelectedIndex = counter;

                                    if (counter == 0) {
                                      Scaffold.of(context).openDrawer();
                                      if (linkService.getNewMessageBoolean())
                                        linkService.newMessageChange();
                                    }
                                    // TODO : put function here depending on what we click on
                                    else if (counter == 1) {
                                      Navigator.push(context, MaterialPageRoute(
                                          builder: ((context) {
                                        return LeaderBoardPage();
                                      })));
                                    } else if (counter == 3) {
                                      Navigator.push(context, MaterialPageRoute(
                                          builder: ((context) {
                                        return SettingsPage();
                                      })));
                                    } else if (counter == 4) {
                                      Navigator.push(context, MaterialPageRoute(
                                          builder: ((context) {
                                        return ConnexionPageWidget();
                                      })));
                                    }
                                  });
                                },
                                isSelected: currentSelectedIndex == counter,
                                title: navigationItems[counter].title,
                                icon: navigationItems[counter].icon,
                                notifiable: navigationItems[counter].notifiable,
                              );
                  },
                  itemCount: navigationItems.length,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
