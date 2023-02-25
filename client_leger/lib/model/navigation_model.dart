import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class NavigationModel {
  String title;
  IconData icon;

  NavigationModel({required this.title, required this.icon});
}

List<NavigationModel> navigationItems = [
  NavigationModel(title: "Chats", icon: Icons.chat),
  NavigationModel(title: "Rewards", icon: Icons.search),
  NavigationModel(title: "Watch", icon: Icons.panorama_fish_eye),
  NavigationModel(title: "Settings", icon: Icons.settings),
  NavigationModel(title: "Logout", icon: Icons.logout),
];
