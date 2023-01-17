import { Directions } from '@app/enums/directions';
import { PlacementDirections } from '@app/enums/placement-directions';

export class DirectionHandler {
    static reversePlacementDirection(direction: string) {
        if (direction === PlacementDirections.Horizontal) return PlacementDirections.Vertical;
        return PlacementDirections.Horizontal;
    }
    static getPlacementDirections(direction: string) {
        if (direction === PlacementDirections.Horizontal) return PlacementDirections.Horizontal;
        if (direction === PlacementDirections.Vertical) return PlacementDirections.Vertical;
        throw new Error('Argument was not a valid direction');
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
