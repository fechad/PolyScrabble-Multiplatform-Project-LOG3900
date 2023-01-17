export abstract class Command {
    abstract execute(): void;
    abstract cancel(): void;
}
