import { Directions } from '@app/enums/directions';
import { PlacementDirections } from '@app/enums/placement-directions';

export class DirectionHandler {
    static reversePlacementDirection(direction: string): PlacementDirections {
        if (direction === PlacementDirections.Horizontal) return PlacementDirections.Vertical;
        return PlacementDirections.Horizontal;
    }
    static reverseDirection(direction: Directions): Directions {
        switch (direction) {
            case Directions.Down:
                return Directions.Up;
            case Directions.Up:
                return Directions.Down;
            case Directions.Left:
                return Directions.Right;
            case Directions.Right:
                return Directions.Left;
        }
    }
    static getPlacementDirections(direction: string) {
        if (direction === PlacementDirections.Horizontal) return PlacementDirections.Horizontal;
        if (direction === PlacementDirections.Vertical) return PlacementDirections.Vertical;
        throw new Error('Argument was not a valid direction');
    }
    static towardsWordBeginning(direction: PlacementDirections): Directions {
        return PlacementDirections.Vertical === direction ? Directions.Up : Directions.Left;
    }
    static towardsWordEnd(direction: PlacementDirections): Directions {
        return this.reverseDirection(this.towardsWordBeginning(direction));
    }
    static transformDirection(direction: Directions): PlacementDirections {
        switch (direction) {
            case Directions.Up:
            case Directions.Down:
                return PlacementDirections.Vertical;
            case Directions.Left:
            case Directions.Right:
                return PlacementDirections.Horizontal;
        }
    }
}
