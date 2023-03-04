import 'package:client_leger/classes/command.dart';

class GameCommandService {
  GameCommandService();

  void constructPlacementCommand(PlacementCommand command) {
    command.execute();
  }

  void constructExchangeCommand(ExchangeCommand command) {
    command.execute();
  }

  void constructHelpCommand(HelpCommand command) {
    command.execute();
  }
}
