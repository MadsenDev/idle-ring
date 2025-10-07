export const format = (n: number) => {
    if (n < 1_000) return n.toFixed(0);
    const units = ["K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];
    let u = -1;
    while (n >= 1000 && u < units.length - 1) { n /= 1000; u++; }
    return `${n.toFixed(2)}${units[u] ?? ""}`;
  };  