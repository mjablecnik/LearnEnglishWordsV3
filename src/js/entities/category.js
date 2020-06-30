import WordsStorage from '../storages/words.js';
import Statistics from './statistics.js';
import { statisticsData } from '../store.js';
import { KnownStages } from '../utils.js';


export default class Category {
  constructor(id, collectionId, name, title, icon) {
    this.id = id;
    this.collectionId = collectionId;
    this.name = name;
    this.title = title;
    this.icon = icon;
    this.active = false;
    this.wordStorages = {
      'all': new WordsStorage(collectionId, id, 'all', 100),
      //'read': new WordsStorage(collectionId, id, 'read', 100),
      //'write': new WordsStorage(collectionId, id, 'write', 100),
      //'listen': new WordsStorage(collectionId, id, 'listen', 100),
      'known': new WordsStorage(collectionId, id, 'known', 100),
      'learning': new WordsStorage(collectionId, id, 'learning', 100),
      'unknown': new WordsStorage(collectionId, id, 'unknown', 100)
    };
    this.statistics = new Statistics(this.collectionId, this.id);
  }

  loadWordIds() {
    this.wordStorages['all'].loadIds(false);
    this.wordStorages['known'].loadIds(false);
    this.wordStorages['learning'].loadIds(false);
    this.wordStorages['unknown'].loadIds(false);
    //trainingModes.forEach((mode) => {
    //  this.wordStorages[mode.value].loadIds(false);
    //});
  }

  loadWords(type) {
    this.wordStorages[type].loadWords();
  }

  loadStatistics() {
    return this.statistics.load();
  }

  updateStatistics(word, prevLearningState) {
    if (!this.wordStorages['all'].getWordIds().includes(word.text)) { return }
    this.statistics.update(word, prevLearningState);
    statisticsData.updateData();
    //trainingModeStatisticsData.updateData();
  }

  //updateWords(mode, addWords, removeWords) {
  //  this.wordStorages[mode].update(addWords, removeWords);
  //  allKnownWordsData.updateData(mode, removeWords, []);
  //  allNotKnownWordsData.updateData(mode, addWords, removeWords);
  //}

  updateKnownWordList(word) {
    if (word.knownStage === KnownStages.UNKNOWN || word.knownStage === KnownStages.NOT_KNOWN) {
      this.wordStorages['known'].removeWord(word);
    } else if (word.knownStage <= KnownStages.HARD_KNOWN) {
      this.wordStorages['known'].addWord(word);
    } else {
      this.wordStorages['known'].removeWord(word);
    }
  }
}

