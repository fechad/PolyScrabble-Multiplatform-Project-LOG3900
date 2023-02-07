// TODO: Sort in alphabetical order

export enum SocketEvent {
    // SOCKET-MANAGER-SERVICE
    Connection = 'connection',
    Disconnection = 'disconnecting',
    Reconnect = 'reconnect',
    GetPlayerInfos = 'getPlayerInfos',
    GetRackInfos = 'getRackInfos',
    JoinRoom = 'joinRoom',
    CreateChatChannel = 'createChatChannel',
    JoinChatChannel = 'joinChatChannel',
    LeaveChatChannel = 'leaveChatChannel',
    CreatorLeaveChatChannel = 'creatorLeaveChatChannel',
    ChatChannelMessage = 'chatChannelMessage',
    GetDiscussionChannels = 'getDiscussionChannels',
    JoinRoomSolo = 'joinRoomSolo',
    JoinRoomSoloBot = 'joinRoomSoloBot',
    ConvertToRoomSoloBot = 'convertToRoomSoloBot',
    LeaveRoomCreator = 'leaveRoomCreator',
    LeaveRoomOther = 'leaveRoomOther',
    SetRoomAvailable = 'setRoomAvailable',
    AskToJoin = 'askToJoin',
    AcceptPlayer = 'acceptPlayer',
    RejectPlayer = 'rejectPlayer',
    Message = 'message',
    AvailableRooms = 'availableRooms',
    StartGame = 'startGame',
    ChangeTurn = 'changeTurn',
    BotPlayAction = 'botPlayAction',
    GetAllGoals = 'getAllGoals',

    // SOCKET-HANDLER-SERVICE
    BotInfos = 'botInfos',
    ConvertToRoomSoloBotStatus = 'convertToRoomSoloBotStatus',
    UpdateAvailableRoom = 'updateAvailableRoom',
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

    // SOCKET-ROOM-SERVICE
    JoinRoomSoloStatus = 'joinRoomSoloStatus',
    JoinRoomStatus = 'joinRoomStatus',
    PlayerFound = 'playerFound',
    PlayerAccepted = 'playerAccepted',
    PlayerRejected = 'playerRejected',

    // SOCKET-CHANNEL-SERVICE
    AvailableChannels = 'availableChannels',
    ChannelMessage = 'channelMessage',
}
