import { writable, get } from 'svelte/store';

function getState(word) {
  if (word.learning.read === false && word.learning.write === false && word.learning.listen === false) {
    return "unknown"
  } else if (word.learning.read !== false && word.learning.write !== false && word.learning.listen !== false) {
    return "known"
  } else {
    return "learning"
  }
}

function isKnown(word, mode) { 
  if (word.learning === undefined) { return false }
  if (word.learning[mode] !== false) { return true } else { return false }
  return false
}

function createStatisticsData(startStatisticsData) {
  const { subscribe, set, update } = writable({...startStatisticsData});
  return {
    subscribe,
    setCount: (count) => update((data) => { 
      data.count = count;
      data.unknown = count;
      return data
    }),
    getState: (word) => { return getState(word) },
    updateData: (word, prevState) => update((data) => {
      let currentState = getState(word);
      if (word.learning === undefined || currentState === prevState) { return data }
      data[currentState] += 1;
      data[prevState] -= 1;
      return data
    }),
    reset: () => {
      set({...startStatisticsData});
    }
  };
}

function createTrainingModeStatisticsData(startStatisticsData) {
  const { subscribe, set, update } = writable({...startStatisticsData});
  return {
    subscribe,
    setCount: (count, modes) => update((data) => { 
      for (let mode of modes) {
        data[mode].unknown = count;
      }
      return data
    }),
    updateData: (word, modes) => update((data) => {
      for (let mode of modes) {
        if(isKnown(word, mode)) {
          data[mode].known += 1; 
          data[mode].unknown -= 1; 
        } 
      }
      return data
    }),
    reset: () => {
      set({...startStatisticsData});
    }
  };
}

export const trainingData = writable(0);
export const collectionData = writable(0);
export const downloadedCollections = writable([]);
export const categoryData = writable(0);
export const categoryDetailData = writable(0);
export const settingsData = writable(0);
export const trainingModeStatisticsData = createTrainingModeStatisticsData({
  "read": {"known": 0, "unknown": 100},
  "write": {"known": 0, "unknown": 100},
  "listen": {"known": 0, "unknown": 100},
});
export const statisticsData = createStatisticsData({
  "count": 100,
  "known": 0,
  "learning": 0,
  "unknown": 100
});


