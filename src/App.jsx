import React, { useState, useCallback } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('alarm-feed'); // alarm-feed | my-alarms | free-board | tools | shop | profile

  // 1. 유저 정보 & 프로필 & 상점 장착 아이템
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '김알람',
    email: 'user@gmail.com',
    age: '20대',
    bio: '매일 아침 상쾌하게 일어나는 중입니다!',
    avatarUrl: 'https://via.placeholder.com/100',
    xp: 250,
    coins: 500,
    rating: 4.8,
    equippedFrame: 'none', // 착용 중인 테두리
    inventory: [], // 보유 아이템 목록
    reviews: [
      { id: 1, reviewer: '새벽우주선', score: 5, text: '제시간에 전화 걸어주셔서 안 늦었어요!' },
      { id: 2, reviewer: '모닝커피', score: 4.5, text: '친절하게 깨워주셔서 감사합니다~' }
    ]
  });

  const level = Math.floor(userProfile.xp / 100) + 1;

  const addReward = (xp, coin, msg) => {
    setUserProfile(prev => ({
      ...prev,
      xp: prev.xp + xp,
      coins: prev.coins + coin
    }));
    alert(`[${msg}] +${xp}XP / +${coin}코인 획득!`);
  };

  const handleGoogleLogin = () => {
    setIsLoggedIn(true);
    alert('Google 계정으로 성공적으로 로그인되었습니다!');
  };

  // 2. 이미지 크롭 기능 모달 관련 상태
  const [tempImageSrc, setTempImageSrc] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageSrc(reader.result);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // 자르기 완료 처리 (캔버스 기반 이미지 추출 모의)
  const applyCroppedImage = () => {
    setUserProfile(prev => ({ ...prev, avatarUrl: tempImageSrc }));
    setIsCropping(false);
    setTempImageSrc(null);
    alert('프로필 사진이 수정 및 자르기 되어 적용되었습니다!');
  };

  // 3. 커뮤니티 알람 피드
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: '새벽열공러',
      authorProfile: { name: '새벽열공러', age: '10대', bio: '열공 중입니다', rating: 4.9, avatarUrl: 'https://via.placeholder.com/100', reviews: [{ reviewer: '열공팬', score: 5, text: '확실하게 깨워줌' }] },
      time: '05:30',
      reason: '수능 대비 모의고사 풀기',
      music: 'Ditto - 뉴진스'
    }
  ]);
  const [feedTime, setFeedTime] = useState('06:00');
  const [feedReason, setFeedReason] = useState('');

  const handleAddFeedPost = (e) => {
    e.preventDefault();
    if (!feedReason.trim()) return alert('이유를 입력해 주세요.');
    setPosts([
      {
        id: Date.now(),
        author: userProfile.name,
        authorProfile: { name: userProfile.name, age: userProfile.age, bio: userProfile.bio, rating: userProfile.rating, avatarUrl: userProfile.avatarUrl, reviews: userProfile.reviews },
        time: feedTime,
        reason: feedReason,
        music: '✨ AI 추천 알람음'
      },
      ...posts
    ]);
    setFeedReason('');
    addReward(20, 30, '모닝콜 피드 등록');
  };

  // 4. 내 개별 알람 (등록/수정/삭제/ONOFF/요일/AI자동변경)
  const [myAlarms, setMyAlarms] = useState([
    { id: 101, time: '07:00', label: '평일 출근', days: ['월', '화', '수', '목', '금'], enabled: true, autoAiMusic: true, currentMusic: '✨ AI 추천: Hype Boy' },
    { id: 102, time: '09:00', label: '주말 운동', days: ['토', '일'], enabled: false, autoAiMusic: false, currentMusic: '기본 딩동 알람' }
  ]);
  const [alarmTimeInput, setAlarmTimeInput] = useState('08:00');
  const [alarmLabelInput, setAlarmLabelInput] = useState('');
  const [selectedDays, setSelectedDays] = useState(['월', '화', '수', '목', '금']);
  const [autoAiToggle, setAutoAiToggle] = useState(true);
  const [editingAlarmId, setEditingAlarmId] = useState(null);

  const daysList = ['월', '화', '수', '목', '금', '토', '일'];

  const toggleDay = (day) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSaveAlarm = (e) => {
    e.preventDefault();
    const song = autoAiToggle ? '✨ AI 추천: Supernova' : '기본 벨소리';

    if (editingAlarmId) {
      setMyAlarms(myAlarms.map(a => a.id === editingAlarmId ? {
        ...a,
        time: alarmTimeInput,
        label: alarmLabelInput || '개인 알람',
        days: selectedDays.length > 0 ? selectedDays : ['매일'],
        autoAiMusic: autoAiToggle,
        currentMusic: song
      } : a));
      setEditingAlarmId(null);
      alert('알람이 수정되었습니다!');
    } else {
      const newAlarm = {
        id: Date.now(),
        time: alarmTimeInput,
        label: alarmLabelInput || '개인 알람',
        days: selectedDays.length > 0 ? selectedDays : ['매일'],
        enabled: true,
        autoAiMusic: autoAiToggle,
        currentMusic: song
      };
      setMyAlarms([...myAlarms, newAlarm]);
      addReward(15, 20, '알람 추가');
    }
    setAlarmLabelInput('');
  };

  const startEditAlarm = (alarm) => {
    setEditingAlarmId(alarm.id);
    setAlarmTimeInput(alarm.time);
    setAlarmLabelInput(alarm.label);
    setSelectedDays(alarm.days);
    setAutoAiToggle(alarm.autoAiMusic);
  };

  const deleteAlarm = (id) => setMyAlarms(myAlarms.filter(a => a.id !== id));
  const toggleAlarmEnabled = (id) => setMyAlarms(myAlarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  const toggleAlarmAutoAi = (id) => setMyAlarms(myAlarms.map(a => a.id === id ? { ...a, autoAiMusic: !a.autoAiMusic, currentMusic: !a.autoAiMusic ? '✨ AI 추천음' : '기본 벨소리' } : a));

  // 5. 자유게시판
  const [freePosts, setFreePosts] = useState([
    { id: 1, author: '아침형인간', title: '다들 오늘 하루도 화이팅!', content: '오늘도 AI 알람 듣고 6시에 바로 일어났네요 ㅎㅎ' }
  ]);
  const [freeTitle, setFreeTitle] = useState('');
  const [freeContent, setFreeContent] = useState('');

  const handleAddFreePost = (e) => {
    e.preventDefault();
    if (!freeTitle.trim() || !freeContent.trim()) return alert('제목과 내용을 입력해 주세요.');
    setFreePosts([{ id: Date.now(), author: userProfile.name, title: freeTitle, content: freeContent }, ...freePosts]);
    setFreeTitle('');
    setFreeContent('');
    addReward(10, 10, '게시글 작성');
  };

  // 6. 상점 아이템 구매 및 착용
  const shopItems = [
    { id: 'frame-gold', name: '👑 골드 테두리', price: 150, type: 'frame' },
    { id: 'frame-neon', name: '✨ 네온 빛 테두리', price: 200, type: 'frame' },
    { id: 'voice-ai', name: '🎙️ AI 아이돌 프리미엄 음성', price: 300, type: 'voice' }
  ];

  const buyShopItem = (item) => {
    if (userProfile.coins < item.price) return alert('코인이 부족합니다!');
    if (userProfile.inventory.includes(item.id)) return alert('이미 보유한 아이템입니다.');

    setUserProfile(prev => ({
      ...prev,
      coins: prev.coins - item.price,
      inventory: [...prev.inventory, item.id],
      equippedFrame: item.type === 'frame' ? item.id : prev.equippedFrame
    }));
    alert(`${item.name} 아이템을 구매하고 장착했습니다!`);
  };

  // 7. 기타 평점/신고/모달
  const [viewingProfileUser, setViewingProfileUser] = useState(null);
  const [callEndedModal, setCallEndedModal] = useState(null);
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const handleSubmitReview = () => {
    if (!reviewComment.trim()) return alert('리뷰 내용을 입력해 주세요.');
    alert('평점과 리뷰가 제출되었습니다!');
    addReward(30, 50, '깨워주기 완료 보상');
    setCallEndedModal(null);
    setReviewComment('');
  };

  const handleReportUser = (targetUser) => {
    if (window.confirm(`${targetUser} 님을 신고하시겠습니까?`)) alert('신고 접수 완료 (누적 3회 시 7일 정지)');
  };

  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-box">
          <h1 className="logo">AllA.M.</h1>
          <p>소셜 모닝콜 & AI 자동 음악 알람 커뮤니티</p>
          <div className="login-hero-icon">⏰</div>
          <button className="google-login-btn" onClick={handleGoogleLogin}>
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" />
            Google 계정으로 로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 상단 프로필 헤더 */}
      <header className="top-header">
        <h1 className="logo">AllA.M.</h1>
        <div className="header-profile" onClick={() => setActiveTab('profile')}>
          <div className={`avatar-wrap ${userProfile.equippedFrame}`}>
            <img src={userProfile.avatarUrl} alt="Avatar" className="header-avatar" />
          </div>
          <span>{userProfile.name}</span>
          <span className="lvl">Lv.{level}</span>
          <span className="coin">💰{userProfile.coins}</span>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="content-body">

        {/* TAB 1: 알람 피드 */}
        {activeTab === 'alarm-feed' && (
          <section className="tab-page">
            <h2>⏰ 알람 피드 (서로 깨워주기)</h2>
            <form onSubmit={handleAddFeedPost} className="card-form">
              <h3>+ 모닝콜 요청하기</h3>
              <input type="time" value={feedTime} onChange={e => setFeedTime(e.target.value)} />
              <input type="text" placeholder="일어나는 이유" value={feedReason} onChange={e => setFeedReason(e.target.value)} />
              <button type="submit" className="add-btn">요청 피드 올리기 (+20XP/+30코인)</button>
            </form>

            <div className="list-group">
              {posts.map(post => (
                <div key={post.id} className="item-card">
                  <div className="card-top">
                    <div className="user-clickable" onClick={() => setViewingProfileUser(post.authorProfile)}>
                      <img src={post.authorProfile.avatarUrl} alt="avatar" className="mini-avatar" />
                      <strong>{post.author}</strong>
                      <span className="star-rating">⭐ {post.authorProfile.rating}</span>
                    </div>
                    <span className="badge">⏰ {post.time}</span>
                  </div>
                  <p>{post.reason}</p>
                  <small>🎵 {post.music}</small>
                  <div className="btn-group-row">
                    <button className="btn-call" onClick={() => setCallEndedModal(post.author)}>📞 전화로 깨워주기</button>
                    <button className="btn-report" onClick={() => handleReportUser(post.author)}>🚨 신고</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 2: 내 개별 알람 */}
        {activeTab === 'my-alarms' && (
          <section className="tab-page">
            <h2>🔔 내 개인 알람 설정</h2>

            <form onSubmit={handleSaveAlarm} className="card-form">
              <h3>{editingAlarmId ? '✏️ 알람 수정하기' : '+ 새 알람 추가하기'}</h3>
              <div className="time-picker-row">
                <input type="time" value={alarmTimeInput} onChange={e => setAlarmTimeInput(e.target.value)} className="time-input" />
                <input type="text" placeholder="알람 이름" value={alarmLabelInput} onChange={e => setAlarmLabelInput(e.target.value)} className="text-input" />
              </div>

              <div className="days-picker">
                {daysList.map(day => (
                  <button type="button" key={day} className={`day-chip ${selectedDays.includes(day) ? 'active' : ''}`} onClick={() => toggleDay(day)}>
                    {day}
                  </button>
                ))}
              </div>

              <div className="ai-toggle-box">
                <label>
                  <input type="checkbox" checked={autoAiToggle} onChange={e => setAutoAiToggle(e.target.checked)} />
                  <span> 🤖 매일 AI가 알아서 알람음 바꾸기</span>
                </label>
              </div>

              <div className="btn-group-row">
                <button type="submit" className="add-btn">{editingAlarmId ? '수정 완료' : '알람 저장'}</button>
                {editingAlarmId && <button type="button" className="btn-close" onClick={() => setEditingAlarmId(null)}>취소</button>}
              </div>
            </form>

            <div className="alarm-list">
              <h3>등록된 알람 ({myAlarms.length}개)</h3>
              {myAlarms.map(alarm => (
                <div key={alarm.id} className={`alarm-card ${alarm.enabled ? 'on' : 'off'}`}>
                  <div className="alarm-main">
                    <div className="alarm-time">{alarm.time}</div>
                    <div className="alarm-label">{alarm.label} ({alarm.days.join(', ')})</div>
                    <div className="alarm-music">{alarm.currentMusic}</div>
                  </div>

                  <div className="alarm-controls">
                    <button className={`switch-btn ${alarm.enabled ? 'active' : ''}`} onClick={() => toggleAlarmEnabled(alarm.id)}>
                      {alarm.enabled ? 'ON' : 'OFF'}
                    </button>
                    <button className={`ai-switch-btn ${alarm.autoAiMusic ? 'active' : ''}`} onClick={() => toggleAlarmAutoAi(alarm.id)}>
                      {alarm.autoAiMusic ? '🤖 AI매일변경 ON' : 'AI매일변경 OFF'}
                    </button>
                    <div className="edit-delete-row">
                      <button className="btn-sm" onClick={() => startEditAlarm(alarm)}>✏️ 수정</button>
                      <button className="btn-sm del" onClick={() => deleteAlarm(alarm.id)}>🗑️ 삭제</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: 자유게시판 */}
        {activeTab === 'free-board' && (
          <section className="tab-page">
            <h2>💬 자유게시판</h2>
            <form onSubmit={handleAddFreePost} className="card-form">
              <h3>글쓰기</h3>
              <input type="text" placeholder="제목" value={freeTitle} onChange={e => setFreeTitle(e.target.value)} />
              <textarea placeholder="내용을 작성하세요..." value={freeContent} onChange={e => setFreeContent(e.target.value)} />
              <button type="submit" className="add-btn">작성하기 (+10XP/+10코인)</button>
            </form>

            <div className="list-group">
              {freePosts.map(fp => (
                <div key={fp.id} className="item-card">
                  <h4>{fp.title}</h4>
                  <small>작성자: {fp.author}</small>
                  <p>{fp.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 4: 상점 (아이템 구매 & 보유관리) */}
        {activeTab === 'shop' && (
          <section className="tab-page">
            <h2>🛍️ 코인 상점</h2>
            <div className="card-form">
              <p>내 보유 코인: <b>💰 {userProfile.coins}개</b></p>
              <div className="shop-grid">
                {shopItems.map(item => {
                  const isBought = userProfile.inventory.includes(item.id);
                  return (
                    <div key={item.id} className="shop-item-card">
                      <div>
                        <strong>{item.name}</strong>
                        <div className="price-tag">💰 {item.price} 코인</div>
                      </div>
                      <button className={`add-btn ${isBought ? 'bought' : ''}`} onClick={() => buyShopItem(item)}>
                        {isBought ? '착용 중' : '구매하기'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* TAB 5: 프로필 설정 (사진 자르기 기능 포함) */}
        {activeTab === 'profile' && (
          <section className="tab-page">
            <h2>👤 내 프로필 & 사진 수정</h2>
            <div className="profile-edit-box">
              <div className="avatar-picker">
                <div className={`avatar-wrap large ${userProfile.equippedFrame}`}>
                  <img src={userProfile.avatarUrl} alt="내 아바타" className="large-avatar" />
                </div>
                <label htmlFor="avatar-file" className="upload-label">🖼️ 사진 선택 및 자르기 편집</label>
                <input type="file" id="avatar-file" accept="image/*" onChange={handleFileSelect} hidden />
              </div>

              <div className="input-field-group">
                <label>이름 / 닉네임</label>
                <input type="text" value={userProfile.name} onChange={e => setUserProfile({ ...userProfile, name: e.target.value })} />

                <label>나이대 선택</label>
                <select value={userProfile.age} onChange={e => setUserProfile({ ...userProfile, age: e.target.value })}>
                  <option>10대</option>
                  <option>20대</option>
                  <option>30대</option>
                  <option>40대 이상</option>
                </select>

                <label>자기소개 (한줄 소개)</label>
                <input type="text" value={userProfile.bio} onChange={e => setUserProfile({ ...userProfile, bio: e.target.value })} />
              </div>
            </div>

            <div className="reviews-section">
              <h3>⭐ 내가 받은 평점 ({userProfile.rating} / 5.0)</h3>
              <div className="review-list">
                {userProfile.reviews.map(r => (
                  <div key={r.id} className="review-card">
                    <div className="review-head">
                      <span><strong>{r.reviewer}</strong> 님의 평가</span>
                      <span className="star">★ {r.score}</span>
                    </div>
                    <p>{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* 🖼️ 프로필 사진 자르기/수정 모달 */}
      {isCropping && (
        <div className="modal-backdrop">
          <div className="modal-card crop-modal">
            <h3>✂️ 프로필 사진 위치/자르기 수정</h3>
            <div className="crop-preview-box">
              <img src={tempImageSrc} alt="Crop preview" className="crop-preview-img" />
            </div>
            <p className="crop-tip">사진을 알맞게 조정한 후 완료를 눌러주세요.</p>
            <div className="btn-group-row">
              <button className="add-btn" onClick={applyCroppedImage}>자르기 완료 및 저장</button>
              <button className="btn-close" onClick={() => setIsCropping(false)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 평가 및 후기 모달 */}
      {callEndedModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>📞 깨워주기 완료!</h3>
            <p><strong>{callEndedModal}</strong> 님에게 평점과 리뷰를 남겨주세요.</p>
            <select value={reviewScore} onChange={e => setReviewScore(Number(e.target.value))}>
              <option value="5">⭐⭐⭐⭐⭐ 5점</option>
              <option value="4">⭐⭐⭐⭐ 4점</option>
            </select>
            <textarea placeholder="후기를 작성하세요" value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
            <div className="btn-group-row">
              <button className="add-btn" onClick={handleSubmitReview}>제출하기</button>
              <button className="btn-close" onClick={() => setCallEndedModal(null)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 타 유저 프로필 모달 */}
      {viewingProfileUser && (
        <div className="modal-backdrop" onClick={() => setViewingProfileUser(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <img src={viewingProfileUser.avatarUrl} alt="avatar" className="large-avatar center" />
            <h3>{viewingProfileUser.name} ({viewingProfileUser.age})</h3>
            <p>"{viewingProfileUser.bio}"</p>
            <span className="star-rating">⭐ {viewingProfileUser.rating} / 5.0</span>
            <button className="btn-close" onClick={() => setViewingProfileUser(null)}>닫기</button>
          </div>
        </div>
      )}

      {/* 하단 카톡 스타일 네비게이션 */}
      <nav className="bottom-nav">
        <button className={activeTab === 'alarm-feed' ? 'active' : ''} onClick={() => setActiveTab('alarm-feed')}>
          <span className="icon">⏰</span><span className="label">피드</span>
        </button>
        <button className={activeTab === 'my-alarms' ? 'active' : ''} onClick={() => setActiveTab('my-alarms')}>
          <span className="icon">🔔</span><span className="label">개인알람</span>
        </button>
        <button className={activeTab === 'free-board' ? 'active' : ''} onClick={() => setActiveTab('free-board')}>
          <span className="icon">💬</span><span className="label">자유글</span>
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