// (C) Copyright 2014-2016 Hewlett Packard Enterprise Development LP

import { refresh, getItem, pollingInterval } from './Api';

export function watchTask (uri, progressHandler) {
  const promise = new Promise((resolve, reject) => {
    const check = () => {
      getItem(uri)
      .then(task => {
        if ('Error' === task.state) {
          reject(task);
        } else if ('Completed' === task.state) {
          resolve(task);
        } else {
          if (progressHandler) {
            progressHandler(task);
          }
          setTimeout(check, pollingInterval);
        }
      })
      .then(refresh);
    };
    check();
  });
  return promise;
}
