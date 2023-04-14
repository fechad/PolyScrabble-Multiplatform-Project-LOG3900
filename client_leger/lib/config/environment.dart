const String environmentProd =
    'http://ec2-3-96-187-147.ca-central-1.compute.amazonaws.com:3000';
const String environment = 'http://10.0.2.2:3000';

String getSocketURL() {
  const bool isProduction = bool.fromEnvironment('dart.vm.product');
  if (isProduction) {
    // TODO: Changer pour le bon url serveur
    return environmentProd;
  } else {
    return environment;
  }
}

String getServerURL() {
  const bool isProduction = bool.fromEnvironment('dart.vm.product');
  if (isProduction) {
    // TODO: Changer pour le bon url serveur
    return environmentProd;
  } else {
    return 'http://10.0.2.2:3000';
  }
}
