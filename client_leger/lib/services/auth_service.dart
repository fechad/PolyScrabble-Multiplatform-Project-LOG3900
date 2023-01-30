import 'package:client_leger/components/user_model.dart';
import 'package:flutter/material.dart';

class AuthService {

  late UserModel currentUser; 

  AuthService() {
    setUser();
  }
  
  void setUser() {
    currentUser = UserModel(
      username: "Anna", email: "xanna@gmail.com", 
      icon: const Icon(null) , 
      level: Level(rank: "Stone", 
      currentXP: 0, 
      totalXP: 100), 
      badges: [], 
      highScore: 0, 
      gamesWon: 0
    );
  }

  UserModel getCurrentUser() {
    return currentUser;
  }
}