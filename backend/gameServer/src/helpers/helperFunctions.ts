export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const guests = [];

export function generateGuestUsername(digits: number = 8): string {
  const id = Math.floor(Math.random() * Math.pow(10, digits));
  const username = `guest${id}`;
  if (!guests.includes(username)) {
    guests.push(username);
    return username;
  }
  return generateGuestUsername(digits);
}
