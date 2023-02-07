String getSocketURL() {
  const bool isProduction = bool.fromEnvironment('dart.vm.product');
  if (isProduction) {
    // TODO: Changer pour le bon url serveur
    return 'https://polyscrabble-105-2.nn.r.appspot.com';
  } else {
    return 'https://polyscrabble-105-2.nn.r.appspot.com';
  }
}

String getServerURL() {
  const bool isProduction = bool.fromEnvironment('dart.vm.product');
  if (isProduction) {
    // TODO: Changer pour le bon url serveur
    return 'https://polyscrabble-105-2.nn.r.appspot.com/api';
  } else {
    return 'http://10.0.2.2:3000/api';
  }
}
