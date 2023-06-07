// min and max included
export function rndInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

// Thx stack overflow: https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript
export function cartesian(...a: any[]): any[] {
    return a.reduce((a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())));
}