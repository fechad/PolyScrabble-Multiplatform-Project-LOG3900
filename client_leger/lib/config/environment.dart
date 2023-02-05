String getSocketURL() {
  const bool isProduction = bool.fromEnvironment('dart.vm.product');
  if (isProduction) {
    // TODO: Changer pour le bon url serveur
    return 'http://localhost:3000';
  } else {
    return 'http://10.0.2.2:3000';
  }
}

String getServerURL() {
  const bool isProduction = bool.fromEnvironment('dart.vm.product');
  if (isProduction) {
    // TODO: Changer pour le bon url serveur
    return 'http://localhost:3000';
  } else {
    return 'http://10.0.2.2:3000';
  }
}
