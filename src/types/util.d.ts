export interface IStartEnd {
    start: number;
    end: number;
}

export interface IMergedCrops {
    image: Buffer;
    yOffsets: IStartEnd[];
}
