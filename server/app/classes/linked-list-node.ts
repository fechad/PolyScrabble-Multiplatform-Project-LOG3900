export interface StructureNode {
    isAnyLetter: boolean;
    next: StructureNode | null;
    values: string[];
}
