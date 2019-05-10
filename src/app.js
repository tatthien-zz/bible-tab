'use strict';

import './app.scss'

import Vue from 'vue'
import setting from './setting'
import map from './map'
import notie from 'notie'
new Vue({
  el: '#app',
  data: {
    logos: null,
    selectedLocale: setting.get('locale', 'vi'),
    locales: [
      { key: 'vi', title: 'Vietnamese' },
      { key: 'en', title: 'English' }
    ],
    selectedInterval: setting.get('interval', '0'),
    interval: [
      { time: 0, title: 'None' },
      { time: 1, title: '1 hour' },
      { time: 6, title: '6 hours' },
      { time: 12, title: '12 hours' },
      { time: 24, title: '1 day' }
    ],
    isShowSetting: false,
    isCopy: false,
    delayRemain: '00:00:00',
    theme: setting.get('theme', 'light'),
    loaded: false
  },
  computed: {
    bookCode () {
      if (this.logos === null) return ''
      return this.logos.address.replace(/(\d+:\d+-\d+$)|(\d+:\d+$)/, '').toLowerCase().trim()
    },
    logosContent () {
      return this.logos !== null ? this.logos.content[this.selectedLocale] : ''
    },
    logosAddress () {
      if (this.logos === null) return ''
      let bookText = map[this.logos.book - 1][this.selectedLocale]
      return this.logos.address.toLowerCase().replace(this.bookCode, bookText)
    },
    linkToChapter () {
      if (this.logos === null) return ''
      return this.getBibleShareUrl()
    },
    facebookShareUrl () {
      if (this.logos === null) return ''
      return `https://www.facebook.com/sharer/sharer.php?u=${this.getBibleShareUrl(this.logos.verse)}`
    },
    twitterShareUrl () {
      if (this.logos === null) return ''
      return `https://twitter.com/intent/tweet?text=${this.logosAddress} ${this.getBibleShareUrl(this.logos.verse)}`
    }
  },
  created () {
    if (this.selectedInterval == 0) {
      this.fetch()
    } else {
      // Calculate the difference time
      let savedTime = setting.get('cached_time')
      let now = Date.now()
      let diff = now - savedTime
      let hourDiff = diff / (1000 * 60 * 60)

      if (hourDiff > this.selectedInterval) {
        this.fetch()
      } else {
        this.logos = JSON.parse(setting.get('cached_verse'))
      }
    }
    // Set the countdown
    this.setDelayRemain()
  },
  mounted () {
    this.loaded = true;
  },
  watch: {
    selectedInterval () {
      setting.set('cached_time', Date.now())
    }
  },
  methods: {
    fetch () {
      let endpoint = `https://scripture.phuc.am/${this.getIndex()}.json`
      fetch(endpoint).then((response) => {
        return response.json()
      }).then((verse) => {
        this.logos = {
          content: {
            vi: verse.ScriptureVi,
            en: verse.ScriptureEn
          },
          chapter: verse.Chapter,
          verse: verse.Verse,
          address: verse.Address,
          book: verse.Book
        }
        setting.set('cached_verse', JSON.stringify(this.logos))

        // reset the time
        setting.set('cached_time', Date.now())
      })
    },
    getIndex () {
      let cachedIndex = setting.get('cached_index', -1)
      if (cachedIndex < 524) {
        cachedIndex++
      } else {
        cachedIndex = 1
      }
      setting.set('cached_index', cachedIndex)
      return cachedIndex;
    },
    getBibleShareUrl (verse = '') {
      if (this.selectedLocale === 'vi') {
        return `http://kinhthanh.cdnvn.com/doc-kinh-thanh/${this.bookCode}/${this.logos.chapter}?v=VI1934#${verse}`
      } else {
        return `http://kinhthanh.cdnvn.com/doc-kinh-thanh/${this.bookCode}/${this.logos.chapter}?v=NIV#${verse}`
      }
    },
    copyVerse () {
      this.isCopy = true
      this.$nextTick(() => {
        let input = this.$refs.copy_input

        input.select()

        document.execCommand('Copy')

        // Show notification
        this.alert('Copied to clipboard')

        this.isCopy = false
      })
    },
    openShareWindow (e) {
      let target = e.target
      let strWindowFeatures = 'menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,left=0,top=0,width=600, height=300'
      window.open(target.href, 'Bible Tab', strWindowFeatures)
    },
    saveSettings () {
      let form = this.$refs.form_settings
      let fields = form.querySelectorAll('select, input, textarea')
      for (let i = 0; i < fields.length; i++) {
        let field = fields[i]
        let name = field.name
        let value = field.value
        setting.set(name, value)
      }

      // Show success message
      this.alert('Your settings have been saved')
    },
    alert (msg, type = 1) {
      notie.alert({
        type: type,
        text: msg,
        stay: false,
        time: 2,
        position: 'bottom'
      })
    },
    changeTheme () {
      if (this.theme === 'light') {
        this.theme = 'dark'
      } else {
        this.theme = 'light'
      }

      setting.set('theme', this.theme)
    },
    setDelayRemain () {
      setInterval(() => {
        let currentTime = Date.now()
        let cachedTime = setting.get('cached_time')
        let diffSec = Math.floor((currentTime - cachedTime) / 1000 )
        let remainSecond = this.selectedInterval * 60 * 60 - diffSec

        let remainMin = Math.floor(remainSecond / 60)
        let remainHour = Math.floor(remainMin / 60)

        let hour = remainHour < 10 ? `0${remainHour}` : remainHour

        let min = Math.floor(remainSecond / 60 - remainHour * 60)
        min = min < 10 ? `0${min}` : min

        let sec = Math.floor(remainSecond - remainMin * 60)
        sec = sec < 10 ? `0${sec}` : sec

        this.delayRemain = `${hour}:${min}:${sec}`
      }, 1000)
    }
  }
})
