import 'package:client_leger/components/drawer.dart';
import 'package:flutter/material.dart';
import '../components/sidebar.dart';
import '../config/colors.dart';
import '../config/flutter_flow/flutter_flow_theme.dart';


const List<String> virtualPlayers = <String>['One', 'Two', 'Three', 'Four'];
const List<String> difficulty = <String>['Novice', 'Expert'];
const List<String> time = <String>['0', '1'];

class MultiplayerPage extends StatefulWidget {
  const MultiplayerPage({super.key});

  @override
  State<MultiplayerPage> createState() => _MultiplayerPageState();
}

class _MultiplayerPageState extends State<MultiplayerPage> {
  FocusNode _focusNode = FocusNode();
  final scaffoldKey = GlobalKey<ScaffoldState>();
  final _formKey = GlobalKey<FormState>();
  String? virtualValue;
  String? difficultyValue;
  String? timeValue;
  bool checkboxValue = false;
  final TextEditingController _gamePasswordController = TextEditingController();
  bool _passwordVisible = false;

  @override
  void initState() {
    super.initState();

  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      key: scaffoldKey,
      backgroundColor: const Color(0xFFF9FFF6),
      drawer: const ChatDrawer(),
      body:
      Stack(
          children: <Widget>[
             Center(
                // Center is a layout widget. It takes a single child and positions it
                // in the middle of the parent.
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children:  <Widget>[Align(
                    alignment: Alignment.topCenter,
                    child: Image.asset(
                      "assets/images/scrabble_hero.png",
                    ),
                  ),
                    SizedBox(height: 60),
                    SafeArea(
                      child: Material(color: Colors.transparent,
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child:
                        Container(
                          width: MediaQuery.of(context).size.width * 0.30,
                          height: MediaQuery.of(context).size.height * 0.60,
                          decoration: BoxDecoration(
                            color: FlutterFlowTheme.of(context).secondaryBackground,
                            boxShadow: [
                              BoxShadow(
                                blurRadius: 4,
                                color: Color(0x33000000),
                                offset: Offset(0, 2),
                              )
                            ],
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: Color(0x40404040),
                            ),
                          ),
                          child:
                          Form(
                            key: _formKey,
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                SizedBox(
                                  height: 24,
                                ),
                                Center(
                                  child: Text(
                                    'Partie Multijoueur',
                                    style: FlutterFlowTheme.of(context)
                                        .bodyText1
                                        .override(
                                      color: Colors.black,
                                      fontFamily: 'Nunito',
                                      fontSize: 24,
                                      decoration: TextDecoration.underline,
                                    ),

                                  ),
                                ),
                                SizedBox(
                                  height: 20,
                                ),
                                SizedBox(
                                  width: 280,
                                  child:  DropdownButton<String>(
                                    hint: Container(
                                      width: 250,
                                      child: Text(
                                        "Difficulté du joueur virtuel",
                                        style: TextStyle(color: Palette.mainColor,
                                            fontSize: 16),
                                        textAlign: TextAlign.start,
                                      ),
                                    ),
                                    value: difficultyValue,
                                    icon: const Icon(Icons.keyboard_arrow_down),
                                    elevation: 16,
                                    style: const TextStyle(color: Palette.mainColor),
                                    underline: Container(
                                      height: 1,
                                      color: Colors.black,
                                    ),
                                    onChanged: (String? value) {
                                      // This is called when the user selects an item.
                                      setState(() {
                                        difficultyValue = value!;
                                      });
                                    },
                                    items: difficulty.map<DropdownMenuItem<String>>((String value) {
                                      return DropdownMenuItem<String>(
                                        value: value,
                                        child: Text(value),
                                      );
                                    }).toList(),
                                  ),
                                ),
                                SizedBox(
                                  height: 20,
                                ),
                                SizedBox(
                                  width: 280,
                                  child:  DropdownButton<String>(
                                    hint: Container(
                                      width: 250,
                                      child: const Text(
                                        "Temps par tour",
                                        style: TextStyle(color: Palette.mainColor,
                                            fontSize: 16),
                                        textAlign: TextAlign.start,
                                      ),
                                    ),
                                    value: timeValue,
                                    icon: const Icon(Icons.keyboard_arrow_down),
                                    elevation: 16,
                                    style: const TextStyle(color: Palette.mainColor),
                                    underline: Container(
                                      height: 1,
                                      color: Colors.black,
                                    ),
                                    onChanged: (String? value) {
                                      // This is called when the user selects an item.
                                      setState(() {
                                        timeValue = value!;
                                      });
                                    },
                                    items: time.map<DropdownMenuItem<String>>((String value) {
                                      return DropdownMenuItem<String>(
                                        value: value,
                                        child: Text(value),
                                      );
                                    }).toList(),
                                  ),
                                ),
                            SizedBox(
                              height: 16),
                            SizedBox(
                              width: 310,
                                child: Column(
                                  children: [
                                CheckboxListTile(
                                   title: Text('Partie privée',
                                   textAlign: TextAlign.start),
                                    controlAffinity: ListTileControlAffinity.trailing,
                                    activeColor: Palette.mainColor,
                                    value: checkboxValue,
                                    onChanged: (value) {
                                      setState(() {
                                        print(value);
                                        checkboxValue = value!;
                                        //state.didChange(value);
                                      });
                                    }),
                              checkboxValue ?
                              TextFormField(
                                focusNode: _focusNode,
                                keyboardType: TextInputType.text,
                                autofocus: true,
                                controller: _gamePasswordController,
                                obscureText: !_passwordVisible,//This will obscure text dynamically
                                decoration: InputDecoration(
                                  hintText: 'Entrez un mot de passe',
                                  contentPadding: const EdgeInsets.symmetric(vertical: 0.0, horizontal: 10.0),
                                  enabledBorder: const OutlineInputBorder(
                                    borderSide: BorderSide(width: 1,
                                        color: Colors.black),
                                  ),
                                  focusedBorder: const OutlineInputBorder(
                                    borderSide: BorderSide(width: 1,
                                      color: Colors.black),
                                  ),
                                  suffixIcon: IconButton(
                                    icon: Icon(
                                      _passwordVisible
                                          ? Icons.visibility
                                          : Icons.visibility_off,
                                      color: Colors.black,
                                    ),
                                    onPressed: () {
                                      // Update the state i.e. toogle the state of passwordVisible variable
                                      setState(() {
                                        _passwordVisible = !_passwordVisible;
                                      });
                                    },
                                  ),
                                ),
                              )
                                  : Container(),
                          ],
                                ),
                            ),
                                Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 30.0),
                                  child: ElevatedButton(
                                    onPressed: () {
                                      // Validate returns true if the form is valid, or false otherwise.
                                    },
                                    style: ButtonStyle(
                                        shape: MaterialStatePropertyAll<
                                            RoundedRectangleBorder>(
                                            RoundedRectangleBorder(
                                                borderRadius:
                                                BorderRadius.circular(8))),
                                        minimumSize: MaterialStateProperty.all(
                                            const Size(300, 50)),
                                        backgroundColor:
                                        const MaterialStatePropertyAll<Color>(
                                            Palette.mainColor)),
                                    child: Text(
                                      'Créer la partie',
                                      style: FlutterFlowTheme.of(context)
                                          .bodyText1
                                          .override(
                                        color: Colors.white,
                                        fontFamily: 'Nunito',
                                        fontSize: 24,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],

                ),
              ),

            CollapsingNavigationDrawer(),
          ],
      ),
    );

  }
}
