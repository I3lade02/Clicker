export const format = (n) => {
    if (n < 1000) return Math.floor(n).toString();
    const units = ["K", "M", "B", "T", "Q"];
    let u = -1;
    while (n >= 1000 && u < units.length - 1) {
        n /= 1000;
        u++;
    }
    return `${n.toFixed(2)}${units[u]}`;
};