import { PlacementFinder } from '@app/classes/virtual-placement-logic/placement-finder';
import { VirtualTools } from './virtual-tools';

export interface VirtualPlayerTools extends VirtualTools {
    finder: PlacementFinder;
}
