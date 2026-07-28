import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('alarm-feed');

  // 1. 유저 정보 & 프로필 & 장착 아이템
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '김알람',
    email: 'user@gmail.com',
    age: '20대',
    bio: '매일 아침 상쾌하게 일어나는 중입니다!',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    xp: 250,
    coins: 15000,
    rating: 4.8,
    equippedFrame: 'frame-gold-glow',
    equippedSkin: 'none',
    equippedBadge: 'none',
    inventory: ['frame-gold-glow', 'frame-diamond-aura'],
    reviews: [
      { id: 1, reviewer: '새벽우주선', score: 5, text: '제시간에 전화 걸어주셔서 안 늦었어요!' }
    ]
  });

  const level = Math.floor(userProfile.xp / 100) + 1;

  // 실제 구글 로그인 처리 함수
  const handleGoogleLoginSuccess = (response) => {
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const payload = JSON.parse(jsonPayload);

      setUserProfile(prev => ({
        ...prev,
        name: payload.name || prev.name,
        email: payload.email || prev.email,
        avatarUrl: payload.picture || prev.avatarUrl
      }));
      setIsLoggedIn(true);
      alert(`Google 계정(${payload.email})으로 성공적으로 연동 로그인되었습니다!`);
    } catch (e) {
      setIsLoggedIn(true);
    }
  };

  useEffect(() => {
    if (window.google && !isLoggedIn) {
      try {
        window.google.accounts.id.initialize({
          client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
          callback: handleGoogleLoginSuccess
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: 280 }
        );
      } catch (err) {
        console.log("Google GIS 초기화", err);
      }
    }
  }, [isLoggedIn]);

  // 2. 일일 퀘스트
  const [quests, setQuests] = useState([
    { id: 1, title: '🌅 아침 알람 확인하기', rewardXp: 20, rewardCoin: 100, progress: 1, maxProgress: 1, completed: false },
    { id: 2, title: '✍️ 자유 게시글 1회 작성하기', rewardXp: 30, rewardCoin: 200, progress: 0, maxProgress: 1, completed: false },
    { id: 3, title: '📞 모닝콜 예약 등록하기', rewardXp: 50, rewardCoin: 300, progress: 0, maxProgress: 1, completed: false }
  ]);

  const claimQuestReward = (id) => {
    setQuests(quests.map(q => {
      if (q.id === id && !q.completed && q.progress >= q.maxProgress) {
        setUserProfile(prev => ({ ...prev, xp: prev.xp + q.rewardXp, coins: prev.coins + q.rewardCoin }));
        alert(`퀘스트 보상 수령 완료! +${q.rewardXp}XP / +${q.rewardCoin} 코인을 획득했습니다!`);
        return { ...q, completed: true };
      }
      return q;
    }));
  };

  // 3. 프로필 사진 편집
  const [tempImg, setTempImg] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTempImg(url);
      setCropZoom(1);
      setCropX(0);
      setCropY(0);
      setIsCropModalOpen(true);
    }
  };

  const applyCroppedImage = () => {
    setUserProfile(prev => ({ ...prev, avatarUrl: tempImg }));
    setIsCropModalOpen(false);
  };

  // 4. 모닝콜 피드 & 전화 예약 기능복원
  const [posts, setPosts] = useState([
    {
      id: 1,
      type: 'feed',
      author: '새벽열공러',
      authorProfile: { name: '새벽열공러', age: '10대', bio: '열공 중입니다!', rating: 4.9, avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
      time: '06:30',
      reason: '수능 대비 모의고사 풀기',
      music: 'Ditto - 뉴진스',
      comments: [{ id: 1, author: '모닝커피', text: '화이팅입니다!' }],
      reservations: ['미라클모닝er']
    }
  ]);
  const [feedTime, setFeedTime] = useState('06:00');
  const [feedReason, setFeedReason] = useState('');

  const handleAddFeedPost = (e) => {
    e.preventDefault();
    if (!feedReason.trim()) return alert('이유를 입력해 주세요.');
    const newFeed = {
      id: Date.now(),
      type: 'feed',
      author: userProfile.name,
      authorProfile: { ...userProfile },
      time: feedTime,
      reason: feedReason,
      music: '✨ AI 추천 알람음',
      comments: [],
      reservations: []
    };
    setPosts([newFeed, ...posts]);
    setFeedReason('');
    alert('모닝콜 요청 피드가 등록되었습니다!');
  };

  // 모닝콜 전화 예약 처리
  const handleReserveCall = (postId, e) => {
    e.stopPropagation();
    setPosts(posts.map(p => {
      if (p.id === postId) {
        if (p.reservations.includes(userProfile.name)) {
          alert('이미 모닝콜을 예약하셨습니다.');
          return p;
        }
        alert(`${p.author} 님의 ${p.time} 모닝콜 전화 예약을 완료했습니다!`);
        // 퀘스트 반영
        setQuests(quests.map(q => q.id === 3 ? { ...q, progress: 1 } : q));
        return { ...p, reservations: [...p.reservations, userProfile.name] };
      }
      return p;
    }));
  };

  // 5. 스톱워치 기능
  const [swTime, setSwTime] = useState(0);
  const [swIsRunning, setSwIsRunning] = useState(false);
  const [swLaps, setSwLaps] = useState([]);

  useEffect(() => {
    let interval = null;
    if (swIsRunning) {
      interval = setInterval(() => {
        setSwTime(prev => prev + 10);
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [swIsRunning]);

  const formatSwTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
  };

  const handleLap = () => {
    if (swIsRunning) {
      setSwLaps([formatSwTime(swTime), ...swLaps]);
    }
  };

  const resetSw = () => {
    setSwIsRunning(false);
    setSwTime(0);
    setSwLaps([]);
  };

  // 6. 개인 알람 설정
  const [myAlarms, setMyAlarms] = useState([
    { id: 101, time: '07:00', label: '평일 출근', days: ['월', '화', '수', '목', '금'], enabled: true, preferredMusic: 'NewJeans, K-pop', currentMusic: '✨ AI 추천: Supernova - 에스파' },
  ]);
  const [alarmTimeInput, setAlarmTimeInput] = useState('08:00');
  const [alarmLabelInput, setAlarmLabelInput] = useState('');
  const [alarmPrefMusic, setAlarmPrefMusic] = useState('');
  const [selectedDays, setSelectedDays] = useState(['월', '화', '수', '목', '금']);
  const [editingAlarmId, setEditingAlarmId] = useState(null);

  const daysList = ['월', '화', '수', '목', '금', '토', '일'];

  const toggleDay = (day) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const toggleAlarmEnabled = (id, e) => {
    e.stopPropagation();
    setMyAlarms(myAlarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const startEditAlarm = (alarm) => {
    setEditingAlarmId(alarm.id);
    setAlarmTimeInput(alarm.time);
    setAlarmLabelInput(alarm.label);
    setAlarmPrefMusic(alarm.preferredMusic || '');
    setSelectedDays(alarm.days || []);
  };

  const handleSaveAlarm = (e) => {
    e.preventDefault();
    if (selectedDays.length === 0) return alert('최소 하나 이상의 요일을 선택해주세요.');
    const generatedMusic = alarmPrefMusic.trim() 
      ? `✨ AI 추천 (${alarmPrefMusic} 기반): ${alarmPrefMusic.split(',')[0]} 스타일 리믹스`
      : '✨ AI 추천: 기본 상쾌한 클래식';

    if (editingAlarmId) {
      setMyAlarms(myAlarms.map(a => a.id === editingAlarmId ? {
        ...a, time: alarmTimeInput, label: alarmLabelInput || '개인 알람', days: selectedDays, preferredMusic: alarmPrefMusic, currentMusic: generatedMusic
      } : a));
      setEditingAlarmId(null);
      alert('알람이 수정되었습니다.');
    } else {
      setMyAlarms([...myAlarms, { id: Date.now(), time: alarmTimeInput, label: alarmLabelInput || '개인 알람', days: selectedDays, enabled: true, preferredMusic: alarmPrefMusic, currentMusic: generatedMusic }]);
      alert('새 알람이 추가되었습니다.');
    }
    setAlarmLabelInput('');
    setAlarmPrefMusic('');
  };

  // 7. 자유게시판
  const [freePosts, setFreePosts] = useState([
    { 
      id: 1, 
      type: 'free',
      author: '아침형인간', 
      authorProfile: { name: '아침형인간', age: '20대', bio: '미라클 모닝 성공 중!', rating: 5.0, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
      title: '다들 오늘 하루도 화이팅!', 
      content: '오늘도 AI 알람 듣고 6시에 바로 일어났네요 ㅎㅎ 다들 힘내세요!', 
      comments: [{ id: 1, author: '열공러', text: '좋은 하루 보내세요!' }] 
    }
  ]);
  const [freeTitle, setFreeTitle] = useState('');
  const [freeContent, setFreeContent] = useState('');

  const handleAddFreePost = (e) => {
    e.preventDefault();
    if (!freeTitle.trim() || !freeContent.trim()) return alert('제목과 내용을 입력하세요.');
    const newPost = { 
      id: Date.now(), 
      type: 'free',
      author: userProfile.name, 
      authorProfile: { ...userProfile },
      title: freeTitle, 
      content: freeContent, 
      comments: [] 
    };
    setFreePosts([newPost, ...freePosts]);
    setQuests(quests.map(q => q.id === 2 ? { ...q, progress: 1 } : q));
    setFreeTitle('');
    setFreeContent('');
    alert('게시글이 작성되었습니다!');
  };

  const [viewedUserProfile, setViewedUserProfile] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentInput, setCommentInput] = useState('');

  const handleAddComment = () => {
    if (!commentInput.trim() || !selectedPost) return;
    const newComment = { id: Date.now(), author: userProfile.name, text: commentInput };
    const updatedPost = { ...selectedPost, comments: [...selectedPost.comments, newComment] };
    
    setSelectedPost(updatedPost);

    if (selectedPost.type === 'free') {
      setFreePosts(freePosts.map(p => p.id === selectedPost.id ? updatedPost : p));
    } else {
      setPosts(posts.map(p => p.id === selectedPost.id ? updatedPost : p));
    }
    setCommentInput('');
  };

  // 8. 상점 및 인벤토리
  const shopItems = [
    { id: 'frame-gold-glow', name: '✨ 네온 빛 황금 테두리', price: 500, category: '테두리' },
    { id: 'frame-diamond-aura', name: '💎 다이아몬드 회전 아우라', price: 10000, category: '테두리' },
    { id: 'frame-rainbow-spin', name: '🌈 무지개 파티클 스핀', price: 25000, category: '테두리' },
    { id: 'skin-dark', name: '🌙 다크모드 테마 스킨', price: 400, category: '스킨' },
    { id: 'badge-god', name: '🪐 전설의 시간 지배자 배지', price: 50000, category: '배지' }
  ];

  const buyShopItem = (item) => {
    if (userProfile.coins < item.price) return alert('코인이 부족합니다!');
    if (userProfile.inventory.includes(item.id)) return alert('이미 보유한 아이템입니다.');
    setUserProfile(prev => ({
      ...prev,
      coins: prev.coins - item.price,
      inventory: [...prev.inventory, item.id]
    }));
    alert(`${item.name}을(를) 구매했습니다!`);
  };

  const toggleEquipItem = (itemId, category) => {
    setUserProfile(prev => {
      if (category === '테두리') {
        return { ...prev, equippedFrame: prev.equippedFrame === itemId ? 'none' : itemId };
      }
      if (category === '스킨') {
        return { ...prev, equippedSkin: prev.equippedSkin === itemId ? 'none' : itemId };
      }
      if (category === '배지') {
        return { ...prev, equippedBadge: prev.equippedBadge === itemId ? 'none' : itemId };
      }
      return prev;
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-box">
          <h1 className="logo">AllA.M.</h1>
          <p>소셜 모닝콜 & AI 알람 커뮤니티</p>
          <div className="login-hero-icon">⏰</div>
          
          <div id="google-signin-btn" className="google-btn-wrapper"></div>

          <button className="google-login-btn-fallback" onClick={() => setIsLoggedIn(true)}>
            🌐 Google 연동 테스트 계정으로 시작
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container skin-${userProfile.equippedSkin}`}>
      <header className="top-header">
        <h1 className="logo">AllA.M.</h1>
        <div className="header-profile" onClick={() => setActiveTab('profile')}>
          <div className={`avatar-frame-box ${userProfile.equippedFrame}`}>
            <img src={userProfile.avatarUrl} alt="Avatar" className="header-avatar" />
          </div>
          <span className="user-name-text">{userProfile.name}</span>
          <span className="lvl">Lv.{level}</span>
          <span className="coin">💰{userProfile.coins}</span>
        </div>
      </header>

      <main className="content-body">
        {activeTab === 'alarm-feed' && (
          <section className="tab-page">
            <h2>⏰ 모닝콜 피드</h2>
            <form onSubmit={handleAddFeedPost} className="card-form">
              <h3>+ 모닝콜 요청하기</h3>
              <input type="time" value={feedTime} onChange={e => setFeedTime(e.target.value)} />
              <input type="text" placeholder="깨워줘야 하는 이유" value={feedReason} onChange={e => setFeedReason(e.target.value)} />
              <button type="submit" className="add-btn">피드 등록</button>
            </form>

            <div className="list-group">
              {posts.map(post => {
                const isReservedByMe = post.reservations?.includes(userProfile.name);
                return (
                  <div key={post.id} className="item-card">
                    <div className="card-top">
                      <div className="user-clickable" onClick={() => setViewedUserProfile(post.authorProfile)}>
                        {/* 축소된 프로필 사진 크기 (feed-avatar 클래스) */}
                        <img src={post.authorProfile.avatarUrl} alt="avatar" className="feed-avatar" />
                        <strong>{post.author}</strong>
                        <span className="star-rating">⭐ {post.authorProfile.rating}</span>
                      </div>
                      <span className="badge">⏰ {post.time}</span>
                    </div>
                    <p className="card-body-text" onClick={() => setSelectedPost(post)} style={{ cursor: 'pointer' }}>{post.reason}</p>
                    
                    {/* 복원된 전화 예약 버튼 및 안내 영역 */}
                    <div className="feed-action-bar">
                      <button 
                        className={`call-reserve-btn ${isReservedByMe ? 'reserved' : ''}`}
                        onClick={(e) => handleReserveCall(post.id, e)}
                      >
                        {isReservedByMe ? '📞 전화 예약 완료' : '📞 모닝콜 전화 예약하기'}
                      </button>
                      <small className="reservation-count">예약 {post.reservations?.length || 0}명</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'my-alarms' && (
          <section className="tab-page">
            <h2>🔔 개인 알람 설정</h2>
            <form onSubmit={handleSaveAlarm} className="card-form">
              <h3>{editingAlarmId ? '✏️ 알람 수정 중' : '+ 새 알람 추가'}</h3>
              <div className="time-picker-row">
                <input type="time" value={alarmTimeInput} onChange={e => setAlarmTimeInput(e.target.value)} className="time-input" />
                <input type="text" placeholder="알람 이름 (예: 평일 출근)" value={alarmLabelInput} onChange={e => setAlarmLabelInput(e.target.value)} className="text-input" />
              </div>

              <div className="music-pref-box">
                <label>🎵 선호하는 음악/장르 (AI 추천 참고용)</label>
                <input 
                  type="text" 
                  placeholder="예: NewJeans, K-pop, 클래식, 팝송 등" 
                  value={alarmPrefMusic} 
                  onChange={e => setAlarmPrefMusic(e.target.value)} 
                />
              </div>

              <div className="days-picker">
                {daysList.map(day => (
                  <button type="button" key={day} className={`day-chip ${selectedDays.includes(day) ? 'active' : ''}`} onClick={() => toggleDay(day)}>
                    {day}
                  </button>
                ))}
              </div>

              <div className="btn-group-row">
                <button type="submit" className="add-btn">{editingAlarmId ? '수정 완료' : '알람 저장'}</button>
                {editingAlarmId && <button type="button" className="btn-close" onClick={() => setEditingAlarmId(null)}>취소</button>}
              </div>
            </form>

            <div className="alarm-list">
              <p className="sub-tip">💡 알람 카드를 누르면 수정할 수 있습니다.</p>
              {myAlarms.map(a => (
                <div key={a.id} className={`alarm-card ${a.enabled ? 'active-alarm' : 'disabled-alarm'}`} onClick={() => startEditAlarm(a)}>
                  <div>
                    <div className="alarm-time">{a.time}</div>
                    <div className="alarm-label">{a.label} ({a.days?.join(', ') || '매일'})</div>
                    <div className="alarm-music-tag">{a.currentMusic}</div>
                  </div>
                  <div className="alarm-right-controls" onClick={e => e.stopPropagation()}>
                    <label className="switch">
                      <input type="checkbox" checked={a.enabled} onChange={(e) => toggleAlarmEnabled(a.id, e)} />
                      <span className="slider round"></span>
                    </label>
                    <button className="btn-sm danger" onClick={() => setMyAlarms(myAlarms.filter(x => x.id !== a.id))}>삭제</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'stopwatch' && (
          <section className="tab-page stopwatch-page">
            <h2>⏱️ 스톱워치</h2>
            <div className="stopwatch-display">
              {formatSwTime(swTime)}
            </div>
            <div className="stopwatch-controls">
              <button className={`sw-btn ${swIsRunning ? 'pause' : 'start'}`} onClick={() => setSwIsRunning(!swIsRunning)}>
                {swIsRunning ? '일시정지' : '시작'}
              </button>
              <button className="sw-btn lap" onClick={handleLap} disabled={!swIsRunning}>랩 타임</button>
              <button className="sw-btn reset" onClick={resetSw}>초기화</button>
            </div>
            <div className="laps-container">
              {swLaps.map((lap, idx) => (
                <div key={idx} className="lap-item">
                  <span>랩 {swLaps.length - idx}</span>
                  <strong>{lap}</strong>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'free-board' && (
          <section className="tab-page">
            <h2>💬 자유게시판</h2>
            <form onSubmit={handleAddFreePost} className="card-form">
              <input type="text" placeholder="제목" value={freeTitle} onChange={e => setFreeTitle(e.target.value)} />
              <textarea placeholder="내용을 입력하세요..." value={freeContent} onChange={e => setFreeContent(e.target.value)} />
              <button type="submit" className="add-btn">글 작성</button>
            </form>

            <div className="list-group">
              {freePosts.map(fp => (
                <div key={fp.id} className="item-card">
                  <div className="card-top">
                    <div className="user-clickable" onClick={() => setViewedUserProfile(fp.authorProfile)}>
                      <strong>{fp.author}</strong>
                    </div>
                    <small>댓글 {fp.comments.length}개</small>
                  </div>
                  <div onClick={() => setSelectedPost(fp)} style={{ cursor: 'pointer' }}>
                    <h4>{fp.title}</h4>
                    <p className="card-snippet">{fp.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'quest' && (
          <section className="tab-page">
            <h2>🎯 일일 퀘스트</h2>
            <p className="quest-sub">퀘스트를 완료하고 코인을 받아가세요!</p>
            <div className="quest-list">
              {quests.map(q => {
                const isReady = q.progress >= q.maxProgress && !q.completed;
                return (
                  <div key={q.id} className="quest-card-new">
                    <div className="quest-info">
                      <h4>{q.title}</h4>
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${(q.progress / q.maxProgress) * 100}%` }}></div>
                      </div>
                      <span className="quest-reward-tag">+ {q.rewardXp} XP / + {q.rewardCoin} 코인</span>
                    </div>
                    <button 
                      className={`quest-status-btn ${q.completed ? 'completed' : isReady ? 'ready' : 'pending'}`}
                      onClick={() => claimQuestReward(q.id)}
                      disabled={!isReady}
                    >
                      {q.completed ? '완료됨' : isReady ? '보상 받기' : ` 진행중 (${q.progress}/${q.maxProgress})`}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'shop' && (
          <section className="tab-page">
            <h2>🛍️ 코인 상점</h2>
            <div className="coin-display-card">
              <span>내 잔여 코인:</span>
              <strong>💰 {userProfile.coins.toLocaleString()} 코인</strong>
            </div>
            <div className="shop-grid">
              {shopItems.map(item => {
                const isBought = userProfile.inventory.includes(item.id);
                return (
                  <div key={item.id} className="shop-item-card">
                    <div>
                      <span className="item-cat">{item.category}</span>
                      <h4>{item.name}</h4>
                      <div className="price-tag">💰 {item.price.toLocaleString()} 코인</div>
                    </div>
                    <button className={`add-btn ${isBought ? 'bought' : ''}`} onClick={() => buyShopItem(item)}>
                      {isBought ? '보유중' : '구매'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'profile' && (
          <section className="tab-page">
            <h2>👤 마이 프로필</h2>
            <div className="clean-profile-card">
              <div className="avatar-section">
                <div className={`avatar-frame-box large ${userProfile.equippedFrame}`}>
                  <img src={userProfile.avatarUrl} alt="내 프로필" className="large-avatar" />
                </div>
                <label htmlFor="avatar-file" className="upload-btn-clean">📸 사진 편집 및 위치 조절</label>
                <input type="file" id="avatar-file" accept="image/*" onChange={handleImageUpload} hidden />
              </div>

              <div className="profile-info-fields">
                <div className="info-row">
                  <label>연동 계정</label>
                  <input type="text" value={userProfile.email} disabled className="disabled-input" />
                </div>
                <div className="info-row">
                  <label>닉네임</label>
                  <input type="text" value={userProfile.name} onChange={e => setUserProfile({ ...userProfile, name: e.target.value })} />
                </div>
                <div className="info-row">
                  <label>한줄 자기소개</label>
                  <textarea rows="2" value={userProfile.bio} onChange={e => setUserProfile({ ...userProfile, bio: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="inventory-section">
              <h3>🎒 내 인벤토리 (테두리/스킨 착용)</h3>
              <div className="inventory-grid">
                {userProfile.inventory.map(itemId => {
                  const item = shopItems.find(s => s.id === itemId);
                  if (!item) return null;
                  const isEquipped = userProfile.equippedFrame === itemId || userProfile.equippedSkin === itemId || userProfile.equippedBadge === itemId;
                  return (
                    <div key={itemId} className="inventory-card">
                      <div>
                        <strong>{item.name}</strong>
                        <div className="item-cat">{item.category}</div>
                      </div>
                      <button 
                        className={`equip-btn ${isEquipped ? 'active' : ''}`}
                        onClick={() => toggleEquipItem(itemId, item.category)}
                      >
                        {isEquipped ? '해제' : '착용'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>

      {isCropModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card crop-modal">
            <h3>✂️ 프로필 사진 위치/크기 조절</h3>
            <div className="crop-preview-container">
              <img 
                src={tempImg} 
                alt="미리보기" 
                style={{ 
                  transform: `scale(${cropZoom}) translate(${cropX}px, ${cropY}px)` 
                }} 
                className="crop-target-img" 
              />
            </div>
            <div className="controls-column">
              <label>🔍 확대: {cropZoom}</label>
              <input type="range" min="1" max="3" step="0.1" value={cropZoom} onChange={e => setCropZoom(parseFloat(e.target.value))} />
              <label>↔️ 좌우: {cropX}px</label>
              <input type="range" min="-100" max="100" value={cropX} onChange={e => setCropX(parseInt(e.target.value))} />
              <label>↕️ 상하: {cropY}px</label>
              <input type="range" min="-100" max="100" value={cropY} onChange={e => setCropY(parseInt(e.target.value))} />
            </div>
            <div className="btn-group-row">
              <button className="add-btn" onClick={applyCroppedImage}>적용 완료</button>
              <button className="btn-close" onClick={() => setIsCropModalOpen(false)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {viewedUserProfile && (
        <div className="modal-backdrop" onClick={() => setViewedUserProfile(null)}>
          <div className="modal-card profile-view-modal" onClick={e => e.stopPropagation()}>
            <div className="profile-view-header">
              <img src={viewedUserProfile.avatarUrl} alt="avatar" className="large-avatar" />
              <h3>{viewedUserProfile.name} 님</h3>
            </div>
            <div className="profile-view-body">
              <p><strong>소개:</strong> {viewedUserProfile.bio || '자기소개가 없습니다.'}</p>
            </div>
            <button className="btn-close" onClick={() => setViewedUserProfile(null)}>닫기</button>
          </div>
        </div>
      )}

      {selectedPost && (
        <div className="modal-backdrop" onClick={() => setSelectedPost(null)}>
          <div className="modal-card cafe-post-modal" onClick={e => e.stopPropagation()}>
            <h3>{selectedPost.title || selectedPost.reason}</h3>
            <p>{selectedPost.content || selectedPost.reason}</p>
            <hr />
            <div className="comments-section">
              <h4>💬 댓글 ({selectedPost.comments?.length || 0})</h4>
              <div className="comments-list">
                {selectedPost.comments?.map(c => (
                  <div key={c.id} className="comment-item">
                    <strong>{c.author}:</strong> {c.text}
                  </div>
                ))}
              </div>
              <div className="comment-input-row">
                <input 
                  type="text" 
                  placeholder="댓글 입력..." 
                  value={commentInput} 
                  onChange={e => setCommentInput(e.target.value)} 
                />
                <button className="add-btn" onClick={handleAddComment}>등록</button>
              </div>
            </div>
            <button className="btn-close" onClick={() => setSelectedPost(null)}>닫기</button>
          </div>
        </div>
      )}

      <nav className="bottom-nav">
        <button className={activeTab === 'alarm-feed' ? 'active' : ''} onClick={() => setActiveTab('alarm-feed')}>
          <span className="icon">⏰</span><span className="label">피드</span>
        </button>
        <button className={activeTab === 'my-alarms' ? 'active' : ''} onClick={() => setActiveTab('my-alarms')}>
          <span className="icon">🔔</span><span className="label">알람</span>
        </button>
        <button className={activeTab === 'stopwatch' ? 'active' : ''} onClick={() => setActiveTab('stopwatch')}>
          <span className="icon">⏱️</span><span className="label">스톱워치</span>
        </button>
        <button className={activeTab === 'free-board' ? 'active' : ''} onClick={() => setActiveTab('free-board')}>
          <span className="icon">💬</span><span className="label">게시판</span>
        </button>
        <button className={activeTab === 'quest' ? 'active' : ''} onClick={() => setActiveTab('quest')}>
          <span className="icon">🎯</span><span className="label">퀘스트</span>
        </button>
        <button className={activeTab === 'shop' ? 'active' : ''} onClick={() => setActiveTab('shop')}>
          <span className="icon">🛍️</span><span className="label">상점</span>
        </button>
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
          <span className="icon">👤</span><span className="label">프로필</span>
        </button>
      </nav>
    </div>
  );
}