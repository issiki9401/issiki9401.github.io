// ====== 狀態更新邏輯 (分離縮小背景與浮動播放器) ======
function updatePlayerState() {
    const hash = window.location.hash;
    const isSubPage = hash !== ''; 
    const scrollY = window.scrollY;
    
    // 1. 判斷是否為子頁面 (僅負責將首頁的標題列隱藏並縮短背景)
    if (isSubPage) {
        document.body.classList.add('is-subpage');
    } else {
        document.body.classList.remove('is-subpage');
    }

    // 2. 判斷是否變身小工具 (在子頁面，或是首頁往下捲動超過 200px 時皆觸發)
    if (isSubPage || scrollY > 200) {
        document.body.classList.add('mini-player');
    } else {
        document.body.classList.remove('mini-player');
    }
}

// 監聽網址與滾動
function handleHash() {
    const hash = window.location.hash;
    
    document.getElementById('view-home').style.display = 'none';
    document.getElementById('view-about').style.display = 'none';
    document.getElementById('view-post').style.display = 'none';

    if (hash.startsWith('#post-')) {
        const postId = hash.replace('#post-', '');
        document.getElementById('view-post').style.display = 'flex';
        loadPostDetail(postId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (hash === '#about') {
        document.getElementById('view-about').style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        document.getElementById('view-home').style.display = 'flex';
        if(window.scrollY < 10) window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    updatePlayerState();
}

window.addEventListener('hashchange', handleHash);
window.addEventListener('scroll', updatePlayerState);
document.addEventListener('DOMContentLoaded', () => { handleHash(); updatePlayerState(); });

// 關於按鈕同頁切換邏輯
const navAboutBtn = document.getElementById('nav-about-btn');
if (navAboutBtn) {
    navAboutBtn.addEventListener('click', (e) => {
        if (window.location.hash === '#about') { e.preventDefault(); window.location.hash = ''; }
    });
}

// ====== 導覽列與捲動動畫 ======
const glassNav = document.getElementById('glass-nav');
if (glassNav) {
    glassNav.addEventListener('mousemove', (e) => {
        const rect = glassNav.getBoundingClientRect();
        glassNav.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        glassNav.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
    glassNav.addEventListener('mouseleave', () => {
        glassNav.style.setProperty('--mouse-x', `-100px`);
        glassNav.style.setProperty('--mouse-y', `-100px`);
    });
}

const scrollArrow = document.getElementById('scroll-arrow');
if (scrollArrow) {
    scrollArrow.addEventListener('click', () => {
        const mainContent = document.getElementById('main-content');
        if (mainContent) window.scrollTo({ top: mainContent.offsetTop, behavior: 'smooth' });
    });
}

const carouselElement = document.getElementById('reveal-carousel');
if (carouselElement && 'IntersectionObserver' in window) {
    carouselElement.classList.add('hide-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.remove('hide-on-scroll');
                observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.1 }); 
    observer.observe(carouselElement);
}

// ====== YouTube 音樂播放器邏輯 ======
let player, musicPlayer;
let isBgPlaying = true, isBgMuted = true, isMusicPlaying = false;
let currentTrack = 0, progressInterval;

const playlist = [
    { id: '_Yn2aIz9SjQ', title: '夜航星 (Night Voyager)' },
    { id: 'wbAvpVEDFpc', title: '仙《仙王的日常生活》动画主题曲' },
    { id: 'mWxP-sQmNMU', title: 'Running For Your Life - Wuthering Waves' },
    { id: 'Xow5OrwWZnw', title: 'FURYON - San-Z' },
    { id: 'cXYpM_nU8Ls', title: '太空电梯 - 阿鲲' }
];

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

window.onYouTubeIframeAPIReady = function() {
    if (document.getElementById('yt-player')) {
        player = new YT.Player('yt-player', {
            playerVars: {
                autoplay: 1,
                controls: 0,
                rel: 0,
                loop: 1,
                playlist: 'M7jgxJ_4TJs',
                mute: 1,
                start: 1,
                playsinline: 1,
                origin: window.location.origin
            },
            events: {
                'onReady': function(event) {
                    event.target.mute();
                    event.target.playVideo();
                },
                'onStateChange': function(event) {
                    if (event.data === YT.PlayerState.PLAYING) isBgPlaying = true;
                    else if (event.data === YT.PlayerState.PAUSED) isBgPlaying = false;
                }
            }
        });
    }
    if (document.getElementById('yt-music-iframe')) {
        musicPlayer = new YT.Player('yt-music-iframe', {
            height: '200', width: '200', videoId: playlist[currentTrack].id,
            playerVars: { 'autoplay': 0, 'controls': 0, 'playsinline': 1 },
            events: { 'onStateChange': onMusicStateChange }
        });
    }
};

const bgPlayPauseBtn = document.getElementById('play-pause-btn');
const bgMuteBtn = document.getElementById('mute-btn');

if (bgPlayPauseBtn) {
    bgPlayPauseBtn.addEventListener('click', () => {
        if (player && typeof player.pauseVideo === 'function') {
            isBgPlaying ? player.pauseVideo() : player.playVideo();
            bgPlayPauseBtn.innerHTML = isBgPlaying 
                ? `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`
                : `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
            isBgPlaying = !isBgPlaying;
        }
    });
}
if (bgMuteBtn) {
    bgMuteBtn.addEventListener('click', () => {
        if (player && typeof player.unMute === 'function') {
            isBgMuted ? player.unMute() : player.mute();
            bgMuteBtn.innerHTML = isBgMuted 
                ? `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`
                : `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
            isBgMuted = !isBgMuted;
        }
    });
}

// 播放器互動：不再有亂入的 minimized 切換
const mPlayBtn = document.getElementById('music-play-btn');
const mNextBtn = document.getElementById('music-next-btn');
const musicSlider = document.getElementById('music-slider');

if (mPlayBtn) {
    mPlayBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (musicPlayer && typeof musicPlayer.pauseVideo === 'function') {
            if(isMusicPlaying) musicPlayer.pauseVideo();
            else musicPlayer.playVideo();
        }
    });
}
if (mNextBtn) {
    mNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (musicPlayer && typeof musicPlayer.loadVideoById === 'function') playNextTrack();
    });
}
if (musicSlider) {
    musicSlider.addEventListener('input', (e) => {
        if (musicPlayer && typeof musicPlayer.getDuration === 'function') {
            const duration = musicPlayer.getDuration();
            const seekTo = (e.target.value / 100) * duration;
            musicPlayer.seekTo(seekTo, true);
        }
    });
}

function playNextTrack() {
    currentTrack = (currentTrack + 1) % playlist.length;
    const track = playlist[currentTrack];
    document.getElementById('music-cover').src = `https://img.youtube.com/vi/${track.id}/mqdefault.jpg`;
    document.getElementById('music-title').innerText = track.title;
    musicPlayer.loadVideoById(track.id);
    if(musicSlider) document.getElementById('music-slider').value = 0;
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function startProgressBar() {
    if (!musicSlider) return;
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(() => {
        if (musicPlayer && typeof musicPlayer.getCurrentTime === 'function') {
            const current = musicPlayer.getCurrentTime();
            const duration = musicPlayer.getDuration();
            document.getElementById('music-current').innerText = formatTime(current);
            document.getElementById('music-duration').innerText = formatTime(duration);
            if (duration > 0) musicSlider.value = (current / duration) * 100;
        }
    }, 1000);
}

function onMusicStateChange(event) {
    if (!mPlayBtn) return;
    const mCover = document.getElementById('music-cover');

    if (event.data === YT.PlayerState.PLAYING) {
        isMusicPlaying = true;
        mCover.classList.add('playing');
        mPlayBtn.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.5" fill="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
        startProgressBar();
    } 
    else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED || event.data === YT.PlayerState.CUED) {
        isMusicPlaying = false;
        mCover.classList.remove('playing');
        mPlayBtn.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.5" fill="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
        clearInterval(progressInterval);
        
        if (event.data === YT.PlayerState.ENDED) playNextTrack();
    }
}

// ====== 登入與分頁載入邏輯 ======
const loginToggleBtn = document.getElementById('login-toggle-btn');
const loginFormBox = document.getElementById('login-form-box');

if (loginToggleBtn) {
    loginToggleBtn.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        const ripple = document.createElement('span');
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`; ripple.style.top = `${y}px`;
        ripple.classList.add('ripple'); ripple.style.animation = 'ripple-anim 0.6s linear';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
        loginFormBox.classList.toggle('show');
    });
}

const loginBtn = document.getElementById('login-btn');
const pwdInput = document.getElementById('admin-password');

// 點擊按鈕或 Enter 登入
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const pwd = pwdInput.value;
        try {
            const res = await fetch('api.php?action=login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwd }) });
            if (res.ok) { localStorage.setItem('isAdmin', 'true'); window.location.href = 'editor.html'; } 
            else { alert('密碼錯誤！'); pwdInput.value = ''; }
        } catch (e) { alert('伺服器連線異常。'); }
    });
}
if (pwdInput) {
    pwdInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); if (loginBtn) loginBtn.click(); }
    });
}

let allPosts = [];
let currentPage = 1;
const postsPerPage = 10;

async function loadBlogPosts() {
    const container = document.getElementById('blog-container');
    if (!container) return;
    try {
        const res = await fetch('api.php?action=get_posts');
        const text = await res.text();
        try { allPosts = JSON.parse(text); } catch (e) { return; }
        if (allPosts.length === 0) return;
        renderBlogPage(1);
    } catch (err) {}
}

window.renderBlogPage = function(page) {
    currentPage = page;
    const container = document.getElementById('blog-container');
    const start = (page - 1) * postsPerPage;
    const pagePosts = allPosts.slice(start, start + postsPerPage);

    container.innerHTML = pagePosts.map(post => {
        const coverImg = post.cover ? post.cover : 'assets/images/blog_cover.png';
        return `
            <div class="blog-post" onclick="window.location.hash='post-${post.id}'">
                <img src="${coverImg}" alt="Cover Image" class="cover-img">
                <div class="blog-content"><h3>${post.title}</h3><span class="date">${post.date}</span><div class="post-text">${post.content}</div></div>
            </div>`;
    }).join('');
    
    renderPagination();
    if(page > 1) { window.scrollTo({ top: container.offsetTop - 100, behavior: 'smooth' }); }
}

function renderPagination() {
    const totalPages = Math.ceil(allPosts.length / postsPerPage);
    const pageContainer = document.getElementById('pagination-container');
    if (!pageContainer) return;
    if (totalPages <= 1) { pageContainer.innerHTML = ''; return; }
    
    let html = '';
    if (currentPage > 1) html += `<button class="page-btn text-btn" onclick="renderBlogPage(${currentPage - 1})">上一頁</button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="renderBlogPage(${i})">${i}</button>`;
    }
    if (currentPage < totalPages) html += `<button class="page-btn text-btn" onclick="renderBlogPage(${currentPage + 1})">下一頁</button>`;
    pageContainer.innerHTML = html;
}

if(document.getElementById('blog-container')) { loadBlogPosts(); }

async function loadPostDetail(postId) {
    const container = document.getElementById('post-detail-container');
    container.innerHTML = '<div style="text-align: center; opacity: 0.7;">文章載入中...</div>';
    try {
        const res = await fetch('api.php?action=get_posts');
        const posts = await res.json();
        const post = posts.find(p => p.id.toString() === postId);
        if (post) {
            const coverImg = post.cover ? post.cover : 'assets/images/blog_cover.png';
            container.innerHTML = `<img src="${coverImg}" alt="Cover" class="post-cover-large"><h2 class="post-title">${post.title}</h2><span class="post-date">發佈於：${post.date}</span><div class="post-body">${post.content}</div>`;
        } else { container.innerHTML = '<h2 style="color:white; text-align:center;">文章不存在或已刪除！</h2>'; }
    } catch (err) { container.innerHTML = '<h2 style="color:white; text-align:center;">載入失敗，請稍後再試。</h2>'; }
}
// ====== 圖片輪播 (Carousel) 邏輯 ======
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('carousel-track');
    if (!track) return;

    const slides = Array.from(track.children);
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    let currentIndex = 0;
    let autoPlayTimer;

    // 更新顯示的投影片
    function updateCarousel(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        currentIndex = index;
        resetAutoPlay(); // 每次手動點擊後重新計時
    }

    // 下一張
    function nextSlide() {
        let index = (currentIndex + 1) % slides.length;
        updateCarousel(index);
    }

    // 上一張
    function prevSlide() {
        let index = (currentIndex - 1 + slides.length) % slides.length;
        updateCarousel(index);
    }

    // 自動播放功能 (5秒切換一次)
    function resetAutoPlay() {
        clearInterval(autoPlayTimer);
        autoPlayTimer = setInterval(nextSlide, 5000);
    }

    // 綁定按鈕事件
    if (nextBtn) nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        nextSlide();
    });

    if (prevBtn) prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        prevSlide();
    });

    // 初始化自動播放
    resetAutoPlay();
});