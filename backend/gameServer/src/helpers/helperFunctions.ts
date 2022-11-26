// https://stackoverflow.com/a/2450976
export function shuffle(array: any[]) {
  let currentIndex = array.length, randomIndex: number;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

const guests = [];

export function generateGuestUsername(digits: number): string {
  const id = Math.floor(Math.random() * Math.pow(10, digits));
  const username = `guest${id}`;
  if (!guests.includes(username)) {
    guests.push(username);
    return username;
  }
  return generateGuestUsername();
}
