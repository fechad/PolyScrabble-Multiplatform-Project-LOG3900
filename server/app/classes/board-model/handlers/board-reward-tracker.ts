import { GoalTitle } from '@app/enums/goal-titles';
import { Matcher } from '@app/classes/goals/matcher';
import { Player } from '@app/classes/player';
import { DIRECT_PLACEMENT_HISTORY_MAX_LENGTH } from './word-history-constants';
import { WordsTracker } from './words-tracker';

const X_WORDS_TO_FORM = 3;
const PALINDROME_MIN_LENGTH = 4;
const SPECIAL_SYLLABLE = 'ou';
const ALMOST_BINGO_LENGTH = 5;
export class BoardRewardTracker {
    private wordsTracker: WordsTracker = new WordsTracker();

    registerDirectPlacement(word: string, player: Player, wordPoints?: number) {
        this.wordsTracker.registerDirectPlacement(word, player.pseudo);
        this.checkRewards(word, player, wordPoints);
    }
    registerFormedWord(word: string, player: Player, wordPoints?: number) {
        this.wordsTracker.registerWordFormed(word, player.pseudo);
        this.checkRewards(word, player, wordPoints);
    }
    checkAtLeastFive(letters: string[], player: Player) {
        if (letters.length < ALMOST_BINGO_LENGTH) return;
        Matcher.notifyGoalManager(player, GoalTitle.AtLeastFive);
    }
    checkRewards(word: string, player: Player, wordPoints?: number) {
        if (this.checkPalindromeGoal(word)) Matcher.notifyGoalManager(player, GoalTitle.Palindrome, wordPoints);
        if (this.checkThreeWordsAtOnce(player.pseudo)) Matcher.notifyGoalManager(player, GoalTitle.ThreeWordsAtOnce);
        if (this.checkSpecialSyllableGoal(word)) Matcher.notifyGoalManager(player, GoalTitle.NeedOr);
        this.checkThirdTimeCharm(player);
    }
    checkThreeWordsAtOnce(playerName: string): boolean {
        return this.wordsTracker.getWordsFormedCount(playerName) >= X_WORDS_TO_FORM;
    }
    checkThirdTimeCharm(player: Player) {
        const directPlacements = this.wordsTracker.getDirectPlacements(player.pseudo);
        if (directPlacements.length < DIRECT_PLACEMENT_HISTORY_MAX_LENGTH) return;
        let notAllSame = false;
        directPlacements.forEach((entry: string) => {
            if (entry !== directPlacements[0]) notAllSame = true;
        });
        if (notAllSame) return;
        Matcher.notifyGoalManager(player, GoalTitle.ThirdTimeCharm);
    }
    resetPlayerWordsFormed(playerName: string) {
        this.wordsTracker.resetWordsFormed(playerName);
    }
    private checkSpecialSyllableGoal(word: string): boolean {
        return word.toLowerCase().includes(SPECIAL_SYLLABLE);
    }
    private checkPalindromeGoal(word: string): boolean {
        return this.checkPalindrome(word) && word.length >= PALINDROME_MIN_LENGTH;
    }
    private checkPalindrome(word: string): boolean {
        const reversed = word.split('').reverse().join('');
        return word === reversed;
    }
}
