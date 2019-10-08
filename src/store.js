import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import format from 'date-fns/format';
import subDays from 'date-fns/subDays';

Vue.use(Vuex);

const SET_INITIALIZE = 'SET_INITIALIZE';
const SET_SETTINGS = 'SET_SETTINGS';
const SET_SCRIPTURE_INDEX = 'SET_SCRIPTURE_INDEX';
const GET_SCRIPTURE = 'GET_SCRIPTURE';
const SET_NEXT_REQUEST = 'SET_NEXT_REQUEST';
const GET_BACKGROUND_IMAGE = 'GET_BACKGROUND_IMAGE';

const defaultSettings = {
  showDate: true,
  useBackground: true,
  backgroundColor: ['#08AEEA', '#2AF598'],
  textColor: '#000',
  changeVerse: '15',
  bibleLanguage: 'en',
};

const defaultScripture = {
  Address: 'SA 1:1',
  Book: 1,
  Chapter: 1,
  Verse: 1,
  ScriptureVi: 'Ban đầu Đức Chúa Trời dựng nên trời đất.',
  ScriptureEn: 'In the beginning God created the heavens and the earth.',
};

const today = format(new Date(), 'DD-MM-YYYY');
const yesterday = format(subDays(new Date(), 1), 'DD-MM-YYYY');

export default new Vuex.Store({
  state: {
    initialize: localStorage.getItem('bibletab_initialize') || false,
    settings: localStorage.getItem('bibletab_settings') ? JSON.parse(localStorage.getItem('bibletab_settings')) : defaultSettings,
    scripture: localStorage.getItem('bibletab_scripture') ? JSON.parse(localStorage.getItem('bibletab_scripture')) : defaultScripture,
    scriptureIndex: parseInt(localStorage.getItem('bibletab_scripture_index'), 10) || 1,
    nextRequest: localStorage.getItem('bibletab_next_request') || null,
    background: localStorage.getItem(`bibletab_background_${today}`) ? JSON.parse(localStorage.getItem(`bibletab_background_${today}`)) : null,
  },
  getters: {
    initialize: state => state.initialize,
    settings: state => state.settings,
    scripture: state => state.scripture,
    scriptureIndex: state => state.scriptureIndex,
    nextRequest: state => state.nextRequest,
    background: state => state.background,
  },
  actions: {
    [SET_INITIALIZE]({ commit }, value) {
      commit(SET_INITIALIZE, value);
    },
    [SET_SETTINGS]({ commit }, settings) {
      commit(SET_SETTINGS, settings);
      commit(SET_INITIALIZE, true);
    },
    [GET_SCRIPTURE]({ commit }, index) {
      axios
        .get(`https://scripture.phuc.am/${index}.json`)
        .then((resp) => {
          commit(GET_SCRIPTURE, resp.data);
          commit(SET_NEXT_REQUEST);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    [SET_SCRIPTURE_INDEX]({ commit }, index) {
      commit(SET_SCRIPTURE_INDEX, index);
    },
    [SET_NEXT_REQUEST]({ commit }) {
      commit(SET_NEXT_REQUEST);
    },
    [GET_BACKGROUND_IMAGE]({ commit }) {
      const unsplashAccessKey = '5e8c2dd61fc1d11b50b0587456500d5ecaa369cda8e297dbae62f59990c6fbec';
      const unsplashCollection = '4809869';
      axios
        .get('https://api.unsplash.com/photos/random', {
          params: {
            collections: unsplashCollection,
            client_id: unsplashAccessKey,
            w: 1920,
            h: 1080,
            crop: 'entropy',
            auto: 'format',
            q: 70,
            fm: 'jpg',
            fit: 'crop',
          },
        })
        .then((resp) => {
          commit(GET_BACKGROUND_IMAGE, resp.data);
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
  mutations: {
    [SET_INITIALIZE](state, value) {
      state.initialize = value;
      localStorage.setItem('bibletab_initialize', value);
    },
    [SET_SETTINGS](state, settings) {
      state.settings = settings;
      localStorage.setItem('bibletab_settings', JSON.stringify(settings));
    },
    [GET_SCRIPTURE](state, scripture) {
      state.scripture = scripture;
      localStorage.setItem('bibletab_scripture', JSON.stringify(scripture));
    },
    [SET_SCRIPTURE_INDEX](state, index) {
      state.scriptureIndex = index;
      localStorage.setItem('bibletab_scripture_index', JSON.stringify(index));
    },
    [SET_NEXT_REQUEST](state) {
      const duration = state.settings.changeVerse * 60;
      const nextRequest = Math.round(Date.now() / 1000) + duration;
      localStorage.setItem('bibletab_next_request', nextRequest);
    },
    [GET_BACKGROUND_IMAGE](state, image) {
      state.background = image;
      localStorage.setItem(`bibletab_background_${today}`, JSON.stringify(image));
      localStorage.removeItem(`bibletab_background_${yesterday}`);
    },
  },
});
