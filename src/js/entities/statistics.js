import DS from '../storages/data.js';
import { 
  getDefaultModeStatisticsData,
  isKnownForMode, getState
} from '../utils.js'


export class Stats {
  constructor(stats) {
    this.startData = stats;
    this.count = stats.count;
    this.known = stats.known;
    this.learning = stats.learning;
    this.unknown = stats.unknown;
  }

  update(word, prevState) {
    let currentState = getState(word);
    if (word.learning === undefined || currentState === prevState) { return }
    this[currentState] += 1;
    this[prevState] -= 1;
  }

  reset() {
    this.count = this.startData.count;
    this.known = this.startData.known;
    this.learning = this.startData.learning;
    this.unknown = this.startData.unknown;
  }

  static plus(stats1, stats2) {
    return new Stats({
      count: stats1.count + stats2.count,
      known: stats1.known + stats2.known,
      learning: stats1.learning + stats2.learning,
      unknown: stats1.unknown + stats2.unknown
    })
  }
}


export class ModeStats {
  constructor(stats) {
    this.startData = stats;
    this.read = stats.read;
    this.write = stats.write;
    this.listen = stats.listen;
  }

  update(word, prevState, modes) {
    for (let { mode, prevState } of modes) {
      let currentState = isKnownForMode(word, mode);
      if(currentState === prevState) { continue }
      if(currentState) {
        this[mode].known += 1; 
        this[mode].unknown -= 1; 
      } else {
        this[mode].known -= 1; 
        this[mode].unknown += 1; 
      }
    }
  }

  getStats() {
    return {
      read: this.read,
      write: this.write,
      listen: this.listen
    }
  }

  reset() {
    this.stats = this.startData;
  }

  static plus(stats1, stats2) {
    let newModeStats = getDefaultModeStatisticsData();
    Object.keys(newModeStats).forEach((mode) => {
      newModeStats[mode] = {
        "known": stats1[mode].known + stats2[mode].known,
        "unknown": stats1[mode].unknown + stats2[mode].unknown
      };
    });
    return newModeStats
  }
}


export default class Statistics {
  constructor(collectionId, categoryId, stats = null, modeStats = null) {
    this.collectionId = collectionId;
    this.categoryId = categoryId;

    this.stats = stats;
    this.modeStats = modeStats;
  }

  update(word, prevState) {
    this.stats.update(word, prevState);
    this.modeStats.forEach((modeStats) => modeStats.update(word, prevState));
    this.save();
  }

  reset() {
    this.stats.reset();
    this.modeStats.forEach((modeStats) => modeStats.reset());
  }

  load() {
    return new Promise((resolve, reject) => {
      DS.getCategoryStatistics(this.collectionId, this.categoryId).then((stats) => {
        if (stats !== null) {
          this.stats = new Stats(stats);
          DS.getCategoryModeStatistics(this.collectionId, this.categoryId)
            .then((modeStats) => { 
              this.modeStats = new ModeStats(modeStats); 
              resolve();
            });
        }
      });
    });
  }

  save() {
    DS.saveCategoryStatistics(this.collectionId, this.categoryId, this.stats);
    DS.saveCategoryModeStatistics(this.collectionId, this.categoryId, this.modeStats);
  }

  static plus(stats1, stats2) {
    return new Statistics(
      null, null,
      Stats.plus(stats1.stats, stats2.stats), 
      ModeStats.plus(stats1.modeStats, stats2.modeStats)
    );
  }
}
