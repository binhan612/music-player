/**
 * 1. Render song
 * 2. Scroll top
 * 3. Play/ pause/ seek
 * 4. CD rotate
 * 5. Next/ prev
 * 6. Random
 * 7. Next/ repeat when ending track
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when click
 */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_KEY_STORAGE = 'Phuong_player';

const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player =$('.player');
const progress = $('.progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');



const app = {
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  randomList: [],
  currentIndex: 0,
  config: JSON.parse(localStorage.getItem(PLAYER_KEY_STORAGE)) || {},
  songs: [
    {
      name: "Muon roi ma sao con",
      singer: "Son Tung MTP",
      path: "audio/MuonRoiMaSaoCon-SonTungMTP-7011803.mp3",
      image: "image/muon roi ma sao con.jfif"
    },
    {
      name: "Apologize",
      singer: "Timbaland & One Republic",
      path: "audio/Apologize-TimbalandOneRepublic-5910232.mp3",
      image: "image/apologize.jfif"
    },
    {
      name: "Co chang trai viet len cay",
      singer: "Phan Manh Quynh",
      path: "audio/CoChangTraiVietLenCayMatBiecOst-PhanManhQuynh-6181112.mp3",
      image: "image/co chang trai viet len cay.jfif"
    },
    {
      name: "La la la",
      singer: "Sam Smith",
      path: "audio/LaLaLa-NaughtyBoy-2555758.mp3",
      image:
        "image/lalala.jfif"
    },
    {
      name: "Girls like you",
      singer: "Maroon 5",
      path:
        "audio/GirlsLikeYou-Maroon5CardiB-5519390.mp3",
      image:
        "image/girls like you.jfif"
    },
    {
      name: "Liability",
      singer: "Lorde",
      path: "audio/Liability-Lorde-5516809.mp3",
      image:
        "image/liability.jfif"
    },
    {
      name: "Tren Tinh Ban Duoi Tinh Yeu",
      singer: "MIN",
      path: "audio/TrenTinhBanDuoiTinhYeu-MIN-6802163.mp3",
      image:
        "image/tren tinh ban duoi tinh yeu.jfif"
    }
  ],
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_KEY_STORAGE, JSON.stringify(this.config));
  },
  render: function () {
    var htmls = this.songs.map((song, index)  => {
      return `<div class="song ${index === this.currentIndex ? 'active' : '' }" data-index =${index}>
                <div class="thumb" style="background-image: url('${song.image}')"></div>
                <div class="body">
                  <h3 class="title">${song.name}</h3>
                  <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                  <i class="fas fa-ellipsis-h"></i>
                </div>
          </div>
        `;
    });
    return $('.playlist').innerHTML = htmls.join('');
  },
  defineProperties: function () {
    Object.defineProperty(this, 'currentSong', {
      get: function () {
        return this.songs[this.currentIndex];
      }
    })
  },
  handleEvents: function () {
    const cdWidth = cd.offsetWidth;
    const _this = this;

    //X??? l?? CD quay
    const cdThumbAnimate = cdThumb.animate([
      {transform: 'rotate(360deg)'}
    ], {
      duration: 10000,
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    //X??? l?? ph??ng to, thu nh??? cd
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      var newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth>0 ? newCdWidth+'px' : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    //X??? l?? khi click play
    playBtn.onclick = function () {
      if(_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      };
      //khi b??i h??t ??ang play
      audio.onplay = function () {
        _this.isPlaying = true;
        player.classList.remove('playing');
        cdThumbAnimate.play();
      }
      //khi b??i h??t b??? pause
      audio.onpause = function () {
        _this.isPlaying = false;
        player.classList.add('playing');
        cdThumbAnimate.pause();
      }
      //khi ti???n ????? b??i h??t thay ?????i
      audio.ontimeupdate = function() {
        if(audio.duration) {
          var progressPercent = Math.floor(audio.currentTime / audio.duration *100);
          progress.value = progressPercent;
        }
      }
      //X??? l?? khi tua song
      progress.oninput = function() {
        const seekTime = progress.value / 100 * audio.duration
        audio.currentTime = seekTime;
      }
    };

    //X??? l?? next b??i h??t
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else { _this.nextSong ();}
      audio.play();
      _this.activeSong();
      // _this.scrollActiveSongIntoView();
    };

    //X??? l?? l??i b??i h??t
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else { _this.prevSong ();}
      audio.play();
      _this.activeSong();
      //_this.scrollActiveSongIntoView();
    };

    // X??? l?? random b??i h??t
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig('isRandom', _this.isRandom)
      randomBtn.classList.toggle('active', _this.isRandom);
    };

    // X??? l?? nextsong khi ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        _this.nextSongAsEnded();
      };
      _this.activeSong();
      //_this.scrollActiveSongIntoView();
    };

    // X??? l?? repeat b??i h??t
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat)
      repeatBtn.classList.toggle('active', _this.isRepeat);
    };

    //L???ng nghe h??nh vi click v??o playList
    playList.onclick = function (e) {
      const pickedSong = e.target.closest('.song:not(.active)');
      const songOption = e.target.closest('.option');
      if (pickedSong || songOption) {
        //X??? l?? khi click v??o song
        if (pickedSong) {
          _this.currentIndex = Number(pickedSong.dataset.index); // || pickedSong.getAtribute('data-index')
          _this.loadCurrentSong();
          _this.activeSong();
          audio.play();
        };
        //X??? l?? khi click v??o song option
        if (songOption) {
          alert("We're working on it! ^~ ");
        }
      }
    };
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
    audio.src = `${this.currentSong.path}`; 
  },
  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;
  },
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    };
    this.loadCurrentSong();
    
  },
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex <= 0) {
      this.currentIndex = this.songs.length - 1;
    };
    this.loadCurrentSong();   
  },
  playRandomSong: function () {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
      if (this.randomList.length >= 7) {
        this.randomList = []
      };
      var isCheck = this.randomList.includes(this.songs[newIndex]);
    } while (isCheck);
    this.currentIndex = newIndex;
    this.loadCurrentSong();
    this.randomList.push(this.songs[newIndex]);
  },
  nextSongAsEnded: function () {
      if (this.isRandom) {
        this.playRandomSong();
      } else { this.nextSong (); }
      audio.play()
  },
  activeSong: function () {
    let tracks = $$('.song');
    let activeTrack = $('.song.active');
    activeTrack.classList.remove('active');
    tracks[this.currentIndex].classList.add('active');
    function scrollActiveSongIntoView () {
      setTimeout(() => {
        $('.song.active').scrollIntoView(
          {
            behavior: 'smooth',
            block: 'end'
          }
        )
      }, 500);
    };
    scrollActiveSongIntoView ()
  },
  start: function () {
    // G??n c???u h??nh t??? config v??o ???ng d???ng
    this.loadConfig();

    // ?????nh ngh??a c??c thu???c t??nh
    this.defineProperties();

    // l???ng nghe c??c s??? ki??n(DOM events)
    this.handleEvents ();

    // T???i th??ng tin b??i h??t
    this.loadCurrentSong ();

    // Render danh s??ch b??i h??t
    this.render ();

    // Hi???n th??? tr???ng th??i ban ?????u c???a button repeat & random
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);  
  }
};

app.start();




