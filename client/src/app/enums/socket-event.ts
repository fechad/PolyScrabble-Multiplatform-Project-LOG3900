// TODO: Sort in alphabetical order

export enum SocketEvent {
    // SOCKET-MANAGER-SERVICE
    Connection = 'connection',
    Disconnection = 'disconnecting',
    Reconnect = 'reconnect',
    GetPlayerInfos = 'getPlayerInfos',
    GetRackInfos = 'getRackInfos',
    CreateRoom = 'createRoom',
    CreateSoloRoom = 'createSoloRoom',
    CreateChatChannel = 'createChatChannel',
    JoinChatChannel = 'joinChatChannel',
    LeaveChatChannel = 'leaveChatChannel',
    CreatorLeaveChatChannel = 'creatorLeaveChatChannel',
    ChatChannelMessage = 'chatChannelMessage',
    GetDiscussionChannels = 'getDiscussionChannels',
    // TODO: remove the joinRoomSolo and joinRoomSoloBot (they are used in light client)
    JoinRoomSolo = 'joinRoomSolo',
    JoinRoomSoloBot = 'joinRoomSoloBot',
    SwapPlayerForBot = 'swapPlayerForBot',
    LeaveRoomCreator = 'leaveRoomCreator',
    LeaveRoomOther = 'leaveRoomOther',
    SetRoomAvailable = 'setRoomAvailable',
    JoinRoomRequest = 'joinRoomRequest',
    ObserveRoomRequest = 'observeRoomRequest',
    ObserverAccepted = 'observerAccepted',
    AcceptPlayer = 'acceptPlayer',
    RejectPlayer = 'rejectPlayer',
    Message = 'message',
    AvailableRooms = 'availableRooms',
    PublicRooms = 'publicRooms',
    StartGame = 'startGame',
    ChangeTurn = 'changeTurn',
    ToggleAngryBotAvatar = 'toggleAngryBotAvatar',
    BotPlayAction = 'botPlayAction',
    GetAllGoals = 'getAllGoals',

    // SOCKET-HANDLER-SERVICE
    BotJoinedRoom = 'botJoinedRoom',
    ConvertToRoomSoloBotStatus = 'convertToRoomSoloBotStatus',
    UpdateAvailableRoom = 'updateAvailableRoom',
    UpdatePublicRooms = 'updatePublicRooms',
    PlayerLeft = 'playerLeft',
    PlayerTurnChanged = 'playerTurnChanged',
    Reconnected = 'reconnected',
    GameIsOver = 'gameIsOver',

    // SOCKET-GAME-SERVICE
    GoalsUpdated = 'goalsUpdated',
    MessageReceived = 'messageReceived',
    UpdatePlayerScore = 'updatePlayerScore',
    LettersBankCountUpdated = 'lettersBankCountUpdated',
    DrawRack = 'drawRack',
    DrawBoard = 'drawBoard',
    BotPlayedAction = 'botPlayedAction',
    TimeUpdated = 'timeUpdated',
    StartGameRequest = 'startGameRequest',
    GameStarted = 'gameStarted',
    LeaveGame = 'leaveGame',

    // SOCKET-ROOM-SERVICE
    JoinRoomSoloStatus = 'joinRoomSoloStatus',
    RoomCreated = 'roomCreated',
    PlayerFound = 'playerFound',
    PlayerAccepted = 'playerAccepted',
    PlayerRejected = 'playerRejected',

    // SOCKET-CHANNEL-SERVICE
    AvailableChannels = 'availableChannels',
    ChannelMessage = 'channelMessage',
    RoomChannelUpdated = 'roomChannelUpdated',
}
