import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/main.dart';
import 'package:client_leger/services/chat_service.dart';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as Io;

import '../config/colors.dart';
import '../config/environment.dart';
import '../config/flutter_flow/flutter_flow_theme.dart';
import '../config/flutter_flow/flutter_flow_widgets.dart';
import 'connexion_page.dart';

Io.Socket socket = Io.io(
    getSocketURL(),
    Io.OptionBuilder()
        .setTransports(['websocket'])
        .setPath('/socket.io')
        .disableAutoConnect()
        .build());

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

  @override
  void initState() {
    super.initState();
    connect();
  }

  void connect() {
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
        backgroundColor: FlutterFlowTheme.of(context).primaryBackground,
        drawer: ChatDrawer(),
        appBar: PreferredSize(
          preferredSize: Size.fromHeight(100),
          child: AppBar(
            backgroundColor: FlutterFlowTheme.of(context).primaryBtnText,
            automaticallyImplyLeading: false,
            leading: Align(
              alignment: AlignmentDirectional(0, 0),
              child: InkWell(
                onTap: () async {
                  scaffoldKey.currentState!.openDrawer();
                },
                child: Icon(
                  Icons.list_rounded,
                  color: Colors.black,
                  size: 60,
                ),
              ),
            ),
            title: Align(
              alignment: AlignmentDirectional(0, 1),
              child: Text(
                'PolyScrabble',
                textAlign: TextAlign.center,
                style: FlutterFlowTheme.of(context).title1.override(
                      fontFamily: 'Poppins',
                      fontSize: 56,
                    ),
              ),
            ),
            actions: [
              IconButton(
                icon: Icon(Icons.person),
                color: Colors.black,
                iconSize: 60,
                onPressed: () {
                  scaffoldKey.currentState!.openEndDrawer();
                },
              ),
            ],
            centerTitle: false,
            toolbarHeight: 100,
            elevation: 2,
          ),
        ),
        body: Center(
          // Center is a layout widget. It takes a single child and positions it
          // in the middle of the parent.
          child: Column(
              // Column is also a layout widget. It takes a list of children and
              // arranges them vertically. By default, it sizes itself to fit its
              // children horizontally, and tries to be as tall as its parent.
              //
              // Invoke "debug painting" (press "p" in the console, choose the
              // "Toggle Debug Paint" action from the Flutter Inspector in Android
              // Studio, or the "Toggle Debug Paint" command in Visual Studio Code)
              // to see the wireframe for each widget.
              //
              // Column has various properties to control how it sizes itself and
              // how it positions its children. Here we use mainAxisAlignment to
              // center the children vertically; the main axis here is the vertical
              // axis because Columns are vertical (the cross axis would be
              // horizontal).
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Palette.mainColor,
                    minimumSize: Size(300, 40),
                    textStyle: const TextStyle(fontSize: 20),
                  ),
                  child: const Text('Scrabble classique'),
                  onPressed: () {},
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Palette.mainColor,
                    minimumSize: Size(300, 40),
                    textStyle: const TextStyle(fontSize: 20),
                  ),
                  child: const Text('Meilleurs scores'),
                  onPressed: () {},
                ),
              ]),
        ),
        endDrawer: Drawer(
          child: Container(
            color: Colors.white,
            child: Center(
              child: FFButtonWidget(
                  onPressed: () {
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
