/* eslint-disable @typescript-eslint/no-magic-numbers */
import { GoalDescription } from '@app/enums/goal-descriptions';
import { GoalRewards } from '@app/enums/goal-rewards';
import { GoalTitle } from '@app/enums/goal-titles';
import { Goal } from '@app/interfaces/goal';

export const TILES_NEEDED_FOR_GOAL = 5;
export const TARGET_GOAL_COUNT = 4;
export const PUBLIC_GOAL_COUNT = 4;
export const TOTAL_POINTS_NEEDED_FOR_REWARD = 100;
export const THIRTY_POINTS_NEEDED_FOR_REWARD = 30;

export const AT_LEAST_5_GOAL: Goal = {
    title: GoalTitle.AtLeastFive,
    description: GoalDescription.AtLeastFive,
    reached: false,
    reward: GoalRewards.AtLeastFive,
    isPublic: true,
    players: [],
};
export const AT_LEAST_5_GOAL_EN: Goal = {
    title: GoalTitle.AtLeastFiveEn,
    description: GoalDescription.AtLeastFiveEn,
    reached: false,
    reward: GoalRewards.AtLeastFive,
    isPublic: true,
    players: [],
};
export const FIRST_TO_HUNDRED_GOAL: Goal = {
    title: GoalTitle.FirstToHundred,
    description: GoalDescription.FirstToHundred,
    reached: false,
    reward: GoalRewards.FirstToHundred,
    isPublic: true,
    players: [],
};
export const FIRST_TO_HUNDRED_GOAL_EN: Goal = {
    title: GoalTitle.FirstToHundredEn,
    description: GoalDescription.FirstToHundredEn,
    reached: false,
    reward: GoalRewards.FirstToHundred,
    isPublic: true,
    players: [],
};
export const NEED_OR_GOAL: Goal = {
    title: GoalTitle.NeedOr,
    description: GoalDescription.NeedOr,
    reached: false,
    reward: GoalRewards.NeedOr,
    isPublic: true,
    players: [],
};
export const NEED_OR_GOAL_EN: Goal = {
    title: GoalTitle.NeedOrEn,
    description: GoalDescription.NeedOrEn,
    reached: false,
    reward: GoalRewards.NeedOr,
    isPublic: true,
    players: [],
};
export const NO_CHANGE_NO_PASS_GOAL: Goal = {
    title: GoalTitle.NoChangeNoPass,
    description: GoalDescription.NoChangeNoPass,
    reached: false,
    reward: GoalRewards.NoChangeNoPass,
    isPublic: true,
    players: [],
};
export const NO_CHANGE_NO_PASS_GOAL_EN: Goal = {
    title: GoalTitle.NoChangeNoPassEn,
    description: GoalDescription.NoChangeNoPassEn,
    reached: false,
    reward: GoalRewards.NoChangeNoPass,
    isPublic: true,
    players: [],
};
export const PALINDROME_GOAL: Goal = {
    title: GoalTitle.Palindrome,
    description: GoalDescription.Palindrome,
    reached: false,
    reward: GoalRewards.Palindrome,
    isPublic: true,
    players: [],
};
export const PALINDROME_GOAL_EN: Goal = {
    title: GoalTitle.PalindromeEn,
    description: GoalDescription.PalindromeEn,
    reached: false,
    reward: GoalRewards.Palindrome,
    isPublic: true,
    players: [],
};
export const THIRD_TIME_CHARM_GOAL: Goal = {
    title: GoalTitle.ThirdTimeCharm,
    description: GoalDescription.ThirdTimeCharm,
    reached: false,
    reward: GoalRewards.ThirdTimeCharm,
    isPublic: true,
    players: [],
};
export const THIRD_TIME_CHARM_GOAL_EN: Goal = {
    title: GoalTitle.ThirdTimeCharmEn,
    description: GoalDescription.ThirdTimeCharmEn,
    reached: false,
    reward: GoalRewards.ThirdTimeCharm,
    isPublic: true,
    players: [],
};
export const THIRTY_POINTER_GOAL: Goal = {
    title: GoalTitle.ThirtyPointer,
    description: GoalDescription.ThirtyPointer,
    reached: false,
    reward: GoalRewards.ThirtyPointer,
    isPublic: true,
    players: [],
};
export const THIRTY_POINTER_GOAL_EN: Goal = {
    title: GoalTitle.ThirtyPointerEn,
    description: GoalDescription.ThirtyPointerEn,
    reached: false,
    reward: GoalRewards.ThirtyPointer,
    isPublic: true,
    players: [],
};
export const THREE_WORDS_AT_ONCE_GOAL: Goal = {
    title: GoalTitle.ThreeWordsAtOnce,
    description: GoalDescription.ThreeWordsAtOnce,
    reached: false,
    reward: GoalRewards.ThreeWordsAtOnce,
    isPublic: true,
    players: [],
};
export const THREE_WORDS_AT_ONCE_GOAL_EN: Goal = {
    title: GoalTitle.ThreeWordsAtOnceEn,
    description: GoalDescription.ThreeWordsAtOnceEn,
    reached: false,
    reward: GoalRewards.ThreeWordsAtOnce,
    isPublic: true,
    players: [],
};

export const DEFAULT_GOALS = [AT_LEAST_5_GOAL, FIRST_TO_HUNDRED_GOAL, NO_CHANGE_NO_PASS_GOAL, THIRTY_POINTER_GOAL];
export const DEFAULT_GOALS_EN = [AT_LEAST_5_GOAL_EN, FIRST_TO_HUNDRED_GOAL_EN, NO_CHANGE_NO_PASS_GOAL_EN, THIRTY_POINTER_GOAL_EN];
