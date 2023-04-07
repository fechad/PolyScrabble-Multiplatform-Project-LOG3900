import { Application } from '@app/app';
import { firestore } from 'firebase-admin';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Service } from 'typedi';
import { SocketEvent } from './enums/socket-event';
import { PlayerGameHistoryService } from './services/GameEndServices/player-game-history.service';
import { DatabaseService, USED_USERNAMES_COLLECTION } from './services/database.service';
import { GamesHistoryService } from './services/games.history.service';
import { ScoresService } from './services/score.service';
import { SocketManager } from './services/socket-manager.service';

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- from Nikolay Radoev
    private static readonly baseTen: number = 10;
    socketManager: SocketManager;
    private server: http.Server;

    constructor(
        private readonly application: Application,
        private databaseService: DatabaseService,
        private scoreService: ScoresService,
        private playerGameHistoryService: PlayerGameHistoryService,
        private gamesHistoryService: GamesHistoryService,
    ) {}

    private static normalizePort(val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, this.baseTen) : val;
        if (isNaN(port)) {
            return val;
        } else if (port >= 0) {
            return port;
        } else {
            return false;
        }
    }
    async init() {
        this.application.app.set('port', Server.appPort);

        this.server = http.createServer(this.application.app);
        SocketManager.createInstance(this.server, this.scoreService, this.playerGameHistoryService, this.gamesHistoryService);
        this.socketManager = SocketManager.instance;
        this.socketManager.handleSockets();

        this.socketManager.sio.on(SocketEvent.Connection, (socket) => {
            socket.on(SocketEvent.Disconnection, async () => {
                try {
                    const username = this.socketManager.socketHandlerService.getSocketPlayerUsername(socket);
                    if (!username) return;
                    const userEmailInfo: { email: string } | null = await this.databaseService.getDocumentByID(USED_USERNAMES_COLLECTION, username);
                    if (!userEmailInfo) throw new Error('Username was not linked to an email');
                    this.databaseService.log('userActions', (userEmailInfo as { email: string }).email, {
                        message: 'logout/déconnexion',
                        time: firestore.Timestamp.now(),
                    });
                    this.databaseService.setUserAsDisconnected((userEmailInfo as { email: string }).email);
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error(error);
                }
            });
        });

        this.server.listen(Server.appPort);
        this.server.on('error', (error: NodeJS.ErrnoException) => this.onError(error));
        this.server.on('listening', () => this.onListening());
        await this.connectToDatabase();
    }

    private onError(error: NodeJS.ErrnoException) {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind: string = typeof Server.appPort === 'string' ? 'Pipe ' + Server.appPort : 'Port ' + Server.appPort;
        switch (error.code) {
            case 'EACCES':
                // eslint-disable-next-line no-console
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                // eslint-disable-next-line no-console
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Se produit lorsque le serveur se met à écouter sur le port.
     */
    private onListening() {
        const addr = this.server.address() as AddressInfo;
        const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
        // eslint-disable-next-line no-console
        console.log(`Listening on ${bind}`);
    }

    private async connectToDatabase() {
        try {
            await this.databaseService.start();
            // eslint-disable-next-line no-console -- useful to track the dataBase state
            console.log('Database connection successful !');
        } catch {
            // eslint-disable-next-line no-console -- useful to track the dataBase state
            console.error('Database connection failed !');
            process.exit(1);
        }
    }
}
