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

    //Xử lý CD quay
    const cdThumbAnimate = cdThumb.animate([
      {transform: 'rotate(360deg)'}
    ], {
      duration: 10000,
      iterations: Infinity,
    });
    cdThumbAnimate.pause();

    //Xử lý phóng to, thu nhỏ cd
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      var newCdWidth = cdWidth - scrollTop;
      cd.style.width = newCdWidth>0 ? newCdWidth+'px' : 0;
      cd.style.opacity = newCdWidth / cdWidth;
    };

    //Xử lý khi click play
    playBtn.onclick = function () {
      if(_this.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      };
      //khi bài hát đang play
      audio.onplay = function () {
        _this.isPlaying = true;
        player.classList.remove('playing');
        cdThumbAnimate.play();
      }
      //khi bài hát bị pause
      audio.onpause = function () {
        _this.isPlaying = false;
        player.classList.add('playing');
        cdThumbAnimate.pause();
      }
      //khi tiến độ bài hát thay đổi
      audio.ontimeupdate = function() {
        if(audio.duration) {
          var progressPercent = Math.floor(audio.currentTime / audio.duration *100);
          progress.value = progressPercent;
        }
      }
      //Xử lý khi tua song
      progress.oninput = function() {
        const seekTime = progress.value / 100 * audio.duration
        audio.currentTime = seekTime;
      }
    };

    //Xử lý next bài hát
    nextBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else { _this.nextSong ();}
      audio.play();
      _this.activeSong();
      // _this.scrollActiveSongIntoView();
    };

    //Xử lý lùi bài hát
    prevBtn.onclick = function () {
      if (_this.isRandom) {
        _this.playRandomSong();
      } else { _this.prevSong ();}
      audio.play();
      _this.activeSong();
      //_this.scrollActiveSongIntoView();
    };

    // Xử lý random bài hát
    randomBtn.onclick = function () {
      _this.isRandom = !_this.isRandom;
      _this.setConfig('isRandom', _this.isRandom)
      randomBtn.classList.toggle('active', _this.isRandom);
    };

    // Xử lý nextsong khi ended
    audio.onended = function () {
      if (_this.isRepeat) {
        audio.play();
      } else {
        _this.nextSongAsEnded();
      };
      _this.activeSong();
      //_this.scrollActiveSongIntoView();
    };

    // Xử lý repeat bài hát
    repeatBtn.onclick = function () {
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat)
      repeatBtn.classList.toggle('active', _this.isRepeat);
    };

    //Lắng nghe hành vi click vào playList
    playList.onclick = function (e) {
      const pickedSong = e.target.closest('.song:not(.active)');
      const songOption = e.target.closest('.option');
      if (pickedSong || songOption) {
        //Xử lý khi click vào song
        if (pickedSong) {
          _this.currentIndex = Number(pickedSong.dataset.index); // || pickedSong.getAtribute('data-index')
          _this.loadCurrentSong();
          _this.activeSong();
          audio.play();
        };
        //Xử lý khi click vào song option
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
    // Gán cấu hình từ config vào ứng dụng
    this.loadConfig();

    // Định nghĩa các thuộc tính
    this.defineProperties();

    // lắng nghe các sự kiên(DOM events)
    this.handleEvents ();

    // Tải thông tin bài hát
    this.loadCurrentSong ();

    // Render danh sách bài hát
    this.render ();

    // Hiển thị trạng thái ban đầu của button repeat & random
    randomBtn.classList.toggle("active", this.isRandom);
    repeatBtn.classList.toggle("active", this.isRepeat);  
  }
};

app.start();




