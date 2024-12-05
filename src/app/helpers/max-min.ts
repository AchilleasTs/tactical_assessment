export function getMaxAndMin(array: any[], property: string): { max: any; min: any } | null {
    if (!array || array.length === 0) {
        return null;
    }

    const validValues = array.map((obj) => +obj[property]);

    if (validValues.length === 0) {
        return null;
    }

    const max = Math.max(...validValues);
    const min = Math.min(...validValues);

    return { max, min };
}