export class WordConstructor {
    static checkCanForm(target: string, base: string, availableLetters: string[]): boolean {
        if (availableLetters.length === 0 && target !== base) return false;
        const unOwnedLetters = target.replace(base, '').split('');
        availableLetters.forEach((letter) => {
            const index = unOwnedLetters.indexOf(letter);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- -1 is default value of indexOf when there is no index
            if (index === -1) return;
            unOwnedLetters.splice(index, 1);
        });
        return unOwnedLetters.length === 0;
    }
}
