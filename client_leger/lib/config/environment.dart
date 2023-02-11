const String environment_prod = 'https://polyscrabble-105-2.nn.r.appspot.com';
const String environment = 'http://10.0.2.2:3000';

String getSocketURL() {
  const bool isProduction = bool.fromEnvironment('dart.vm.product');
  if (isProduction) {
    // TODO: Changer pour le bon url serveur
    return environment_prod;
  } else {
    return environment;
  }
}

String getServerURL() {
  const bool isProduction = bool.fromEnvironment('dart.vm.product');
  if (isProduction) {
    // TODO: Changer pour le bon url serveur
    return 'https://polyscrabble-105-2.nn.r.appspot.com';
  } else {
    return 'http://10.0.2.2:3000';
  }
}
