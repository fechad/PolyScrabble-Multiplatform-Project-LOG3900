import 'package:flutter/material.dart';

class NavigationModel {
  String title;
  IconData icon;
  bool notifiable;

  NavigationModel(
      {required this.title, required this.icon, required this.notifiable});
}

List<NavigationModel> navigationItems = [
  NavigationModel(title: "User", icon: Icons.person, notifiable: false),
  NavigationModel(title: "Home", icon: Icons.home, notifiable: false),
  NavigationModel(title: "Chats", icon: Icons.chat, notifiable: true),
  NavigationModel(
      title: "Watch", icon: Icons.remove_red_eye_rounded, notifiable: false),
  NavigationModel(title: "Settings", icon: Icons.settings, notifiable: false),
  NavigationModel(title: "Logout", icon: Icons.logout, notifiable: false),
];
