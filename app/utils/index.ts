function raceNonNull<T>(promises: Promise<T | null>[]): Promise<T | null> {
  return new Promise((resolve) => {
    let remainingPromises = promises.length;

    promises.forEach((promise) => {
      promise.then((result) => {
        if (result !== null) {
          resolve(result);
        } else {
          remainingPromises--;
          if (remainingPromises === 0) {
            resolve(null);
          }
        }
      });
    });
  });
}

// eslint-disable-next-line import/prefer-default-export
export { raceNonNull };
