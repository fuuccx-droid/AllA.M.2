import React, { useState } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('alarm-feed'); // alarm-feed | my-alarms | free-board | quest | shop | profile

  // 1. 유저 정보 & 프로필
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '김알람',
    email: 'user@gmail.com',
    age: '20대',
    bio: '매일 아침 상쾌하게 일어나는 중입니다!',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    xp: 250,
    coins: 600,
    rating: 4.8,
    equippedFrame: 'none',
    inventory: [],
    reviews: [
      { id: 1, reviewer: '새벽우주선', score: 5, text: '제시간에 전화 걸어주셔서 안 늦었어요!' },
      { id: 2, reviewer: '모닝커피', score: 4.5, text: '친절하게 깨워주셔서 감사합니다~' }
    ]
  });

  const level = Math.floor(userProfile.xp / 100) + 1;

  // 2. 일일 퀘스트 시스템 (글 작성 시 무한 보상 방지)
  const [quests, setQuests] = useState([
    { id: 1, title: '🌅 아침 알람 확인하기', rewardXp: 20, rewardCoin: 50, completed: false },
    { id: 2, title: '✍️ 게시판에 글 1개 작성하기', rewardXp: 30, rewardCoin: 100, completed: false },
    { id: 3, title: '📞 모닝콜 예약 1회 등록하기', rewardXp: 50, rewardCoin: 150, completed: false }
  ]);

  const claimQuestReward = (id) => {
    setQuests(quests.map(q => {
      if (q.id === id && !q.completed) {
        setUserProfile(prev => ({ ...prev, xp: prev.xp + q.rewardXp, coins: prev.coins + q.rewardCoin }));
        alert(`퀘스트 완료! +${q.rewardXp}XP / +${q.rewardCoin} 코인을 얻었습니다!`);
        return { ...q, completed: true };
      }
      return q;
    }));
  };

  // 3. 프로필 이미지 크롭 및 수정
  const [tempImg, setTempImg] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTempImg(url);
      setIsCropModalOpen(true);
    }
  };

  const applyCroppedImage = () => {
    setUserProfile(prev => ({ ...prev, avatarUrl: tempImg }));
    setIsCropModalOpen(false);
    alert('프로필 사진이 성공적으로 변경되었습니다!');
  };

  // 4. 게시글 상세보기 모달 (네이버 카페 스타일)
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentInput, setCommentInput] = useState('');

  // 5. 알람 피드 (예약 기능 포함)
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: '새벽열공러',
      authorProfile: { name: '새벽열공러', age: '10대', bio: '열공 중입니다', rating: 4.9, avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
      time: '06:30',
      reason: '수능 대비 모의고사 풀기',
      music: 'Ditto - 뉴진스',
      comments: [{ id: 1, author: '모닝커피', text: '화이팅입니다!' }],
      reservations: []
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
        authorProfile: { ...userProfile },
        time: feedTime,
        reason: feedReason,
        music: '✨ AI 추천 알람음',
        comments: [],
        reservations: []
      },
      ...posts
    ]);
    setFeedReason('');
    alert('모닝콜 요청 피드가 등록되었습니다!');
  };

  // 통화 예약 신청
  const handleReserveCall = (postId) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        if (p.reservations.includes(userProfile.name)) {
          alert('이미 통화 예약이 완료된 요청입니다.');
          return p;
        }
        alert(`${p.time} 시간 모닝콜 전화가 예약되었습니다! 해당 시간이 되면 통화창이 열립니다.`);
        return { ...p, reservations: [...p.reservations, userProfile.name] };
      }
      return p;
    }));
  };

  // 6. 실시간 예약 통화 모달 (음성 전용)
  const [activeCall, setActiveCall] = useState(null); // { targetUser, time }
  const [isMuted, setIsMuted] = useState(false);

  const startReservedCall = (targetUser, time) => {
    setActiveCall({ targetUser, time });
  };

  // 7. 내 개별 알람
  const [myAlarms, setMyAlarms] = useState([
    { id: 101, time: '07:00', label: '평일 출근', days: ['월', '화', '수', '목', '금'], enabled: true, autoAiMusic: true, currentMusic: '✨ AI 추천: Hype Boy' },
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
        ...a, time: alarmTimeInput, label: alarmLabelInput || '개인 알람', days: selectedDays, autoAiMusic: autoAiToggle, currentMusic: song
      } : a));
      setEditingAlarmId(null);
    } else {
      setMyAlarms([...myAlarms, { id: Date.now(), time: alarmTimeInput, label: alarmLabelInput || '개인 알람', days: selectedDays, enabled: true, autoAiMusic: autoAiToggle, currentMusic: song }]);
    }
    setAlarmLabelInput('');
  };

  // 8. 자유 게시판
  const [freePosts, setFreePosts] = useState([
    { id: 1, author: '아침형인간', title: '다들 오늘 하루도 화이팅!', content: '오늘도 AI 알람 듣고 6시에 바로 일어났네요 ㅎㅎ', comments: [{ id: 1, author: '열공러', text: '좋은 하루 보내세요!' }] }
  ]);
  const [freeTitle, setFreeTitle] = useState('');
  const [freeContent, setFreeContent] = useState('');

  const handleAddFreePost = (e) => {
    e.preventDefault();
    if (!freeTitle.trim() || !freeContent.trim()) return alert('제목과 내용을 입력하세요.');
    setFreePosts([{ id: Date.now(), author: userProfile.name, title: freeTitle, content: freeContent, comments: [] }, ...freePosts]);
    setFreeTitle('');
    setFreeContent('');
    alert('게시글이 작성되었습니다!');
  };

  const handleAddComment = () => {
    if (!commentInput.trim() || !selectedPost) return;
    const newComment = { id: Date.now(), author: userProfile.name, text: commentInput };
    setSelectedPost({ ...selectedPost, comments: [...selectedPost.comments, newComment] });
    setCommentInput('');
  };

  // 9. 다양해진 상점 상품들
  const shopItems = [
    { id: 'frame-gold', name: '👑 골드 테두리', price: 150, category: '테두리' },
    { id: 'frame-neon', name: '✨ 네온 빛 테두리', price: 200, category: '테두리' },
    { id: 'frame-rainbow', name: '🌈 무지개 테두리', price: 300, category: '테두리' },
    { id: 'voice-ai-idol', name: '🎙️ AI 아이돌 보이스', price: 250, category: '음성' },
    { id: 'voice-ai-robot', name: '🤖 SF 로봇 알람음', price: 180, category: '음성' },
    { id: 'badge-early', name: '🌅 얼리버드 칭호 배지', price: 120, category: '배지' },
    { id: 'skin-dark', name: '🌙 다크모드 테마 스킨', price: 400, category: '스킨' }
  ];

  const buyShopItem = (item) => {
    if (userProfile.coins < item.price) return alert('코인이 부족합니다! 일일 퀘스트를 달성해보세요.');
    if (userProfile.inventory.includes(item.id)) return alert('이미 보유한 아이템입니다.');
    setUserProfile(prev => ({
      ...prev,
      coins: prev.coins - item.price,
      inventory: [...prev.inventory, item.id],
      equippedFrame: item.category === '테두리' ? item.id : prev.equippedFrame
    }));
    alert(`${item.name}을(를) 구매했습니다!`);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-box">
          <h1 className="logo">AllA.M.</h1>
          <p>소셜 모닝콜 & AI 알람 커뮤니티</p>
          <div className="login-hero-icon">⏰</div>
          <button className="google-login-btn" onClick={() => setIsLoggedIn(true)}>
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
          <span className="user-name-text">{userProfile.name}</span>
          <span className="lvl">Lv.{level}</span>
          <span className="coin">💰{userProfile.coins}</span>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="content-body">

        {/* TAB 1: 알람 피드 */}
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
              {posts.map(post => (
                <div key={post.id} className="item-card clickable-card">
                  <div className="card-top" onClick={() => setSelectedPost(post)}>
                    <div className="user-clickable">
                      <img src={post.authorProfile.avatarUrl} alt="avatar" className="mini-avatar" />
                      <strong>{post.author}</strong>
                      <span className="star-rating">⭐ {post.authorProfile.rating}</span>
                    </div>
                    <span className="badge">⏰ {post.time}</span>
                  </div>
                  <p className="card-body-text" onClick={() => setSelectedPost(post)}>{post.reason}</p>
                  
                  <div className="btn-group-row">
                    <button className="btn-call" onClick={() => handleReserveCall(post.id)}>
                      {post.reservations.includes(userProfile.name) ? '✅ 예약 완료' : '📅 통화 예약하기'}
                    </button>
                    <button className="btn-demo-call" onClick={() => startReservedCall(post.author, post.time)}>
                      🎙️ 예약시간 알람 테스트
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 2: 내 알람 */}
        {activeTab === 'my-alarms' && (
          <section className="tab-page">
            <h2>🔔 개인 알람 설정</h2>
            <form onSubmit={handleSaveAlarm} className="card-form">
              <h3>{editingAlarmId ? '✏️ 알람 수정' : '+ 새 알람 추가'}</h3>
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
              <label className="ai-toggle-box">
                <input type="checkbox" checked={autoAiToggle} onChange={e => setAutoAiToggle(e.target.checked)} />
                <span> 🤖 매일 AI 자동 음악 변경</span>
              </label>
              <button type="submit" className="add-btn">알람 저장</button>
            </form>

            <div className="alarm-list">
              {myAlarms.map(a => (
                <div key={a.id} className="alarm-card">
                  <div>
                    <div className="alarm-time">{a.time}</div>
                    <div className="alarm-label">{a.label} ({a.days.join(', ')})</div>
                  </div>
                  <button className="btn-sm" onClick={() => setMyAlarms(myAlarms.filter(x => x.id !== a.id))}>삭제</button>
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
              <input type="text" placeholder="제목" value={freeTitle} onChange={e => setFreeTitle(e.target.value)} />
              <textarea placeholder="내용을 입력하세요..." value={freeContent} onChange={e => setFreeContent(e.target.value)} />
              <button type="submit" className="add-btn">글 작성</button>
            </form>

            <div className="list-group">
              {freePosts.map(fp => (
                <div key={fp.id} className="item-card clickable-card" onClick={() => setSelectedPost(fp)}>
                  <h4>{fp.title}</h4>
                  <p className="card-snippet">{fp.content}</p>
                  <small>작성자: {fp.author} | 댓글 {fp.comments.length}개</small>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 4: 일일 퀘스트 (신규 반영) */}
        {activeTab === 'quest' && (
          <section className="tab-page">
            <h2>🎯 일일 퀘스트</h2>
            <p className="quest-sub">매일 퀘스트를 수행하여 경험치와 코인을 획득하세요!</p>
            <div className="quest-list">
              {quests.map(q => (
                <div key={q.id} className="quest-card">
                  <div>
                    <h4>{q.title}</h4>
                    <span className="quest-reward">+ {q.rewardXp} XP / + {q.rewardCoin} 코인</span>
                  </div>
                  <button 
                    className={`quest-btn ${q.completed ? 'done' : ''}`}
                    onClick={() => claimQuestReward(q.id)}
                    disabled={q.completed}
                  >
                    {q.completed ? '완료됨' : '보상 받기'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 5: 상점 (확장됨) */}
        {activeTab === 'shop' && (
          <section className="tab-page">
            <h2>🛍️ 코인 상점</h2>
            <div className="coin-display-card">
              <span>내 잔여 코인:</span>
              <strong>💰 {userProfile.coins} 코인</strong>
            </div>
            <div className="shop-grid">
              {shopItems.map(item => {
                const isBought = userProfile.inventory.includes(item.id);
                return (
                  <div key={item.id} className="shop-item-card">
                    <div>
                      <span className="item-cat">{item.category}</span>
                      <h4>{item.name}</h4>
                      <div className="price-tag">💰 {item.price} 코인</div>
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

        {/* TAB 6: 프로필 (정돈된 깔끔한 디자인) */}
        {activeTab === 'profile' && (
          <section className="tab-page">
            <h2>👤 마이 프로필</h2>
            <div className="clean-profile-card">
              <div className="avatar-section">
                <div className={`avatar-wrap large ${userProfile.equippedFrame}`}>
                  <img src={userProfile.avatarUrl} alt="내 프로필" className="large-avatar" />
                </div>
                <label htmlFor="avatar-file" className="upload-btn-clean">📸 사진 편집 및 자르기</label>
                <input type="file" id="avatar-file" accept="image/*" onChange={handleImageUpload} hidden />
              </div>

              <div className="profile-info-fields">
                <div className="info-row">
                  <label>닉네임</label>
                  <input type="text" value={userProfile.name} onChange={e => setUserProfile({ ...userProfile, name: e.target.value })} />
                </div>
                <div className="info-row">
                  <label>연령대</label>
                  <select value={userProfile.age} onChange={e => setUserProfile({ ...userProfile, age: e.target.value })}>
                    <option>10대</option>
                    <option>20대</option>
                    <option>30대</option>
                    <option>40대 이상</option>
                  </select>
                </div>
                <div className="info-row">
                  <label>한줄 자기소개</label>
                  <textarea rows="2" value={userProfile.bio} onChange={e => setUserProfile({ ...userProfile, bio: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="reviews-section">
              <h3>⭐ 내 받은 리뷰 ({userProfile.rating})</h3>
              {userProfile.reviews.map(r => (
                <div key={r.id} className="review-card">
                  <strong>{r.reviewer}</strong> ★{r.score}
                  <p>{r.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* 🖼️ 프로필 사진 자르기 오류 수정 모달 */}
      {isCropModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card crop-modal">
            <h3>✂️ 프로필 사진 자르기 & 위치 조정</h3>
            <div className="crop-preview-container">
              <img 
                src={tempImg} 
                alt="미리보기" 
                style={{ transform: `scale(${cropZoom})` }} 
                className="crop-target-img" 
              />
            </div>
            <div className="zoom-control">
              <label>확대/축소:</label>
              <input type="range" min="1" max="2" step="0.1" value={cropZoom} onChange={e => setCropZoom(e.target.value)} />
            </div>
            <div className="btn-group-row">
              <button className="add-btn" onClick={applyCroppedImage}>자르기 적용</button>
              <button className="btn-close" onClick={() => setIsCropModalOpen(false)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 📖 게시글 상세보기 모달 (네이버 카페 스타일) */}
      {selectedPost && (
        <div className="modal-backdrop" onClick={() => setSelectedPost(null)}>
          <div className="modal-card cafe-post-modal" onClick={e => e.stopPropagation()}>
            <div className="cafe-header">
              <h3>{selectedPost.title || selectedPost.reason}</h3>
              <small>작성자: <b>{selectedPost.author}</b></small>
            </div>
            <hr />
            <div className="cafe-content">
              <p>{selectedPost.content || selectedPost.reason}</p>
              {selectedPost.music && <p className="music-tag">🎵 추천 알람음: {selectedPost.music}</p>}
            </div>
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
                  placeholder="댓글을 입력하세요..." 
                  value={commentInput} 
                  onChange={e => setCommentInput(e.target.value)} 
                />
                <button className="add-btn" onClick={handleAddComment}>등록</button>
              </div>
            </div>
            <button className="btn-close" onClick={() => setSelectedPost(null)}>창 닫기</button>
          </div>
        </div>
      )}

      {/* 🎙️ 실시간 예약 음성 전용 통화 모달 */}
      {activeCall && (
        <div className="modal-backdrop">
          <div className="modal-card voice-call-card">
            <div className="call-animation">
              <div className="pulse-ring"></div>
              <div className="call-avatar">🎙️</div>
            </div>
            <h3>{activeCall.targetUser} 님과의 예약 통화 연결 중</h3>
            <p className="call-status">음성 상호작용이 연결되었습니다. (목소리만 전달됨)</p>
            
            <div className="voice-controls">
              <button className={`voice-btn ${isMuted ? 'muted' : ''}`} onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? '🔇 음소거됨' : '🎙️ 마이크 ON'}
              </button>
            </div>

            <button className="btn-close danger" onClick={() => setActiveCall(null)}>통화 종료</button>
          </div>
        </div>
      )}

      {/* 하단 네비게이션 */}
      <nav className="bottom-nav">
        <button className={activeTab === 'alarm-feed' ? 'active' : ''} onClick={() => setActiveTab('alarm-feed')}>
          <span className="icon">⏰</span><span className="label">피드</span>
        </button>
        <button className={activeTab === 'my-alarms' ? 'active' : ''} onClick={() => setActiveTab('my-alarms')}>
          <span className="icon">🔔</span><span className="label">알람</span>
        </button>
        <button className={activeTab === 'free-board' ? 'active' : ''} onClick={() => setActiveTab('free-board')}>
          <span className="icon">💬</span><span className="label">자유글</span>
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