export const generateGuid = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const randomHex = Math.random() * 16 | 0;  // Generate a random hex digit (0-15)
        const value = char === 'x' ? randomHex : (randomHex & 0x3 | 0x8);  // 8, 9, A, or B for 'y'
        return value.toString(16);  // Convert to hex string
    });
};