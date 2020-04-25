const shuffle = (array) => {
  const arrCopy = array.slice();
  let m = arrCopy.length;
  let t;
  let i;

  while (m) {
    i = Math.floor(Math.random() * (m -= 1));
    t = arrCopy[m];
    arrCopy[m] = arrCopy[i];
    arrCopy[i] = t;
  }
  return arrCopy;
};

export default shuffle;
