export function calculateAverage(array: any[], property: string): number | null {
    if (!array || array.length === 0) {
        return null;
    }

    const sum = array.reduce((acc, obj) => {
        const value = obj[property];
        return acc + +value;
    }, 0);

    return sum / array.length;
}