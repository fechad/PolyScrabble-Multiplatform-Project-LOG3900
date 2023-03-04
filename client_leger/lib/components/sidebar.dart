//widget from https://github.com/PrateekSharma1712/custom_navigation_drawer/blob/master/lib/commons/collapsing_navigation_drawer_widget.dart

import 'package:client_leger/components/drawer.dart';
import 'package:client_leger/pages/connexion_page.dart';
import 'package:client_leger/pages/home_page.dart';
import 'package:client_leger/pages/profile_page.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import '../config/colors.dart';
import '../model/custom_navigation_drawer.dart';
import 'package:flutter/material.dart';

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

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
        vsync: this, duration: Duration(milliseconds: 300));
    widthAnimation = Tween<double>(begin: maxWidth, end: minWidth)
        .animate(_animationController);
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
            CollapsingListTile(title: 'Username', icon: Icons.person, animationController: _animationController,
                // TODO onTap: .... send to user profile
              onTap: () {
                Navigator.push(context,
                    MaterialPageRoute(builder: ((context) {
                      return UserPage();
                    })));
              },
                ),
            Divider(height: 40.0),
            Expanded(
              child: ListView.separated(
                separatorBuilder: (context, counter) {
                  return Divider(height: 12.0);
                },
                itemBuilder: (context, counter) {
                    return (counter == 2) ?
                      Padding(padding: const EdgeInsets.fromLTRB(0, 0, 0, 280),
                    child: CollapsingListTile(
                      onTap: () {
                        setState(() {
                          currentSelectedIndex = counter;
                        });
                      },
                      isSelected: currentSelectedIndex == counter,
                      title: navigationItems[counter].title,
                      icon: navigationItems[counter].icon,
                    ),
                    ) :
                    CollapsingListTile(
                      onTap: () {
                        setState(() {
                          currentSelectedIndex = counter;
                          if (counter == 0) Scaffold.of(context).openDrawer();
                          // TODO : put function here depending on what we click on
                          if (counter == navigationItems.length-1) {
                            Navigator.push(context,
                                MaterialPageRoute(builder: ((context) {
                                  return ConnexionPageWidget();
                                })));
                          };
                        });
                      },
                      isSelected: currentSelectedIndex == counter,
                      title: navigationItems[counter].title,
                      icon: navigationItems[counter].icon,
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

