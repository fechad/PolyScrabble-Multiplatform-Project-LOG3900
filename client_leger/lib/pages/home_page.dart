import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/services/chat_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as Io;
import '../components/sidebar.dart';
import '../config/colors.dart';
import '../config/environment.dart';
import '../config/flutter_flow/flutter_flow_widgets.dart';
import 'connexion_page.dart';

import 'game_page.dart';

import 'menu_page.dart';


Io.Socket socket = Io.io(
    getSocketURL(),
    Io.OptionBuilder()
        .setTransports(['websocket'])
        .setPath('/socket.io')
        .disableAutoConnect()
        .build());

final socketService = SocketService();
final chatService = ChatService();

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  final scaffoldKey = GlobalKey<ScaffoldState>();
  static const bool isProduction = bool.fromEnvironment('dart.vm.product');

  @override
  void initState() {
    super.initState();
    if (!isProduction) authenticator.setLoggedInEmail('');
    connect();
  }

  void connect() {
    try {
      socketService.connect();
    } catch (e) {
      print(e);
    }

    try {
      socket.connect();
      socket.onConnect((data) {
        print('connect');
      });
      socket.on(
          'connect_error',
              (d) => {
            print(socket.io.options),
            print(d),
            //socket.io.replaceAll(':0', ''),
            //socket.disconnect().connect(),
            //socket.io.options.update('transports', (value) => ['polling']),
            print(socket.io.options)
          });

      print(socket.connected);
    } catch (e) {
      print(e);
    }
    // socket.on('event', (data) => print(data));
    // socket.onDisconnect((_) => print('disconnect'));
    // socket.on('fromServer', (_) => print(_));
  }

  @override
  Widget build(BuildContext context) {
    // This method is rerun every time setState is called, for instance as done
    // by the _incrementCounter method above.
    //
    // The Flutter framework has been optimized to make rerunning build methods
    // fast, so that you can just rebuild anything that needs updating rather
    // than having to individually change instances of widgets.
    return Scaffold(
        key: scaffoldKey,
        backgroundColor: Color(0xFFF9FFF6),
        drawer: const ChatDrawer(),
        body: Stack(
          children: <Widget>[
            Container(
              child: Center(
                // Center is a layout widget. It takes a single child and positions it
                // in the middle of the parent.
                child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                    children: <Widget>[Align(
                      alignment: Alignment.topCenter,
                      child: Image.asset(
                        "assets/images/scrabble_hero.png",
                        ),
                      ),
                      SizedBox(height: 130),
                      Text("Modes de jeu" ,
                          style: TextStyle(
                            fontFamily: "Nunito",
                            fontSize: 35,
                           decoration: TextDecoration.underline,
                      )),
                      SizedBox(height: 60),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Palette.mainColor,
                          minimumSize: Size(300, 40),
                          textStyle: const TextStyle(fontSize: 20),
                        ),
                        child: const Text('Scrabble Classique'),
                        onPressed: () {
                          Navigator.of(context).push(
                              MaterialPageRoute(
                                  builder: (context) =>
                                      const MenuPage()));
                        },
                      ),
                      SizedBox(height: 15),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Palette.mainColor,
                          minimumSize: Size(300, 40),
                          textStyle: const TextStyle(fontSize: 20),
                        ),
                        child: const Text('Scrabble Mania'),
                        onPressed: () {
                          // Navigator.push(context,
                          //     MaterialPageRoute(builder: ((context) {
                          //       return GeneralChatWidget();
                          //     })));
                        },
                      ),
                      SizedBox(height: 200),
                    ],
                ),
              ),
            ),

            CollapsingNavigationDrawer(),
          ]

        ),
        endDrawer: Drawer(
          child: Container(
            color: Colors.white,
            child: Center(
              child: FFButtonWidget(
                  onPressed: () {
                    if (!isProduction) return;
                    httpService
                        .logoutUser(authenticator.currentUser.username)
                        .then((value) => chatService.leaveDiscussion(
                        'General Chat',
                        authenticator
                            .currentUser.username)); //TODO: Envoyer l'email
                    Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => const ConnexionPageWidget()));
                  },
                  text: 'Log out',
                  options: const FFButtonOptions(
                    width: 240,
                    height: 50,
                    color: Palette.mainColor,
                    textStyle: TextStyle(
                      fontFamily: 'Nunito',
                      color: Colors.white,
                      fontSize: 24,
                    ),
                    borderSide: BorderSide(
                      color: Colors.transparent,
                      width: 1,
                    ),
                    borderRadius: 2,
                  )),
            ),
          ), // This trailing comma makes auto-formatting nicer for build methods.
        ));
  }
}
