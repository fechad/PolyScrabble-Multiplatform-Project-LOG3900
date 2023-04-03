/* eslint-disable prettier/prettier */
export class Objective {
    name: string;
    progression: number;
    target: number;
    exp: number;
    constructor(name: string, progression: number, target: number, exp: number) {
        this.name = name;
        this.progression = progression;
        this.target = target;
        this.exp = exp;
    }
}
