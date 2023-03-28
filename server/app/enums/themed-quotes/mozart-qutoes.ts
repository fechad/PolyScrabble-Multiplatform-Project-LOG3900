/* eslint-disable max-len */
import { PLACEHOLDER_LETTERS_ALREADY_PLACED, PLACEHOLDER_NEW_WORD_PLACED } from '@app/constants/virtual-player-constants';
import { Quotes } from './quotes';

export const mozartEnglishQuotes: Quotes = {
    greeting: 'Good day! Let us create a masterpiece together! 🎶',
    bigScore: 'Behold the musical genius! 🎵',
    extremeScore:
        'Your looming defeat has left me feeling as if my ears were filled with sour notes, but fear not - I shall compose a requiem for your shattered pride. 🎼 ',
    angryAnnouncement: 'YOU? BEAT ME? You have not heard a true symphony until you have witnessed my wrath! 👿',
    specialAnnouncement: `It's obvious to play the word ${PLACEHOLDER_NEW_WORD_PLACED} when those are the letters ${PLACEHOLDER_LETTERS_ALREADY_PLACED} are already in place. Thank you for doing most of the work for me! 🎹`,
};
export const mozartFrenchQuotes: Quotes = {
    greeting: "Bonjour ! Créons ensemble un chef-d'œuvre ! 🎶",
    bigScore: 'Contemplez le génie musical ! 🎵',
    extremeScore:
        "Votre défaite inévitable m'a laissé avec l'impression que mes oreilles étaient remplies de fausses notes, mais ne craignez rien - je composerai un requiem pour votre fierté brisée. 🎼 ",
    angryAnnouncement: "VOUS ? ME BATTRE ? Vous n'avez pas entendu une vraie symphonie jusqu'à ce que vous ayez subit ma colère! 👿",
    specialAnnouncement: `C'est d'une évidence de faire le mot ${PLACEHOLDER_NEW_WORD_PLACED} quand les lettres ${PLACEHOLDER_LETTERS_ALREADY_PLACED} sont déjà présentes. Le travail, c'est vous qui l'avez fait pour moi! 🎹`,
};
