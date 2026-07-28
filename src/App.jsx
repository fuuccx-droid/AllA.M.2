import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('alarm-feed'); // alarm-feed | my-alarms | free-board | tools | shop | profile

  // 1. 구글 연동 회원 프로필 데이터
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '김알람',
    email: 'user@gmail.com',
    age: '20대',
    bio: '매일 아침 6시 상쾌하게 일어나는 중입니다!',
    avatarUrl: 'https://via.placeholder.com/100',
    xp: 180,
    coins: 420,
    rating: 4.8,
    reportCount: 0,
    isSuspended: false,
    reviews: [
      { id: 1, reviewer: '새벽우주선', score: 5, text: '제시간에 전화 걸어주셔서 기말고사 안 늦었어요!' },
      { id: 2, reviewer: '모닝커피', score: 4.5, text: '친절하게 깨워주셔서 감사합니다~' }
    ]
  });

  // 선택된 대상 유저의 프로필을 볼 수 있는 모달 상태
  const [viewingProfileUser, setViewingProfileUser] = useState(null);

  // 구글 로그인 처리 함수
  const handleGoogleLogin = () => {
    setIsLoggedIn(true);
    alert('Google 계정으로 성공적으로 로그인되었습니다! 내 정보가 연동됩니다.');
  };

  // 프로필 이미지 업로드 (갤러리 선택)
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfile(prev => ({ ...prev, avatarUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 모닝콜 리뷰 & 평점 남기기
  const [reviewScore, setReviewScore] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [callEndedModal, setCallEndedModal] = useState(null); // 통화 종료 후 평가 모달

  const handleSubmitReview = () => {
    if (!reviewComment.trim()) return alert('리뷰 내용을 입력해 주세요.');
    alert('깨워준 사용자에게 평점과 리뷰가 전달되었습니다!');
    setCallEndedModal(null);
    setReviewComment('');
  };

  // 신고하기 (신고 3회 이상 시 7일 정지 제재)
  const handleReportUser = (targetUser) => {
    if (window.confirm(`${targetUser} 님을 부적절한 언행으로 신고하시겠습니까?`)) {
      alert('신고가 접수되었습니다. 누적 신고 기준(3회 이상) 초과 시 해당 유저는 7일간 서비스 이용이 정지됩니다.');
    }
  };

  // 2. 알람 피드
  const [posts] = useState([
    {
      id: 1,
      author: '새벽열공러',
      authorProfile: { name: '새벽열공러', age: '10대', bio: '고3 수험생입니다', rating: 4.9, avatarUrl: 'https://via.placeholder.com/100', reviews: [{ reviewer: '열공팬', score: 5, text: '확실하게 잘 깨워줌' }] },
      time: '05:30',
      reason: '수능 대비 모의고사 풀기',
      music: 'Ditto - 뉴진스',
      reservers: ['김알람']
    }
  ]);
  const [selectedPost, setSelectedPost] = useState(null);

  // 3. 내 개별 알람
  const [myAlarms, setMyAlarms] = useState([
    { id: 101, time: '07:00', label: '평일 출근 알람', days: ['월', '화', '수', '목', '금'], enabled: true, autoAiMusic: true, currentMusic: '✨ AI 자동 추천: 뉴진스 - Hype Boy' }
  ]);

  // 구글 로그인 미완료 상태일 때의 화면
  if (!isLoggedIn) {
    return (
      <div className="login-screen">
        <div className="login-box">
          <h1 className="logo">AllA.M.</h1>
          <p>소셜 모닝콜 & AI 자동 음악 알람 커뮤니티</p>
          <div className="login-hero-icon">⏰</div>
          <button className="google-login-btn" onClick={handleGoogleLogin}>
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" />
            Google 계정으로 계속하기
          </button>
        </div>
      </div>
    );
  }

  // 7일 정지 제재 회원 처리
  if (userProfile.isSuspended) {
    return (
      <div className="login-screen">
        <div className="login-box warning">
          <h2>🚫 계정 이용 정지 안내</h2>
          <p>누적 신고로 인해 <b>7일간 서비스 이용이 제한</b>되었습니다.</p>
          <small>클린한 커뮤니티 환경을 위해 협조해 주세요.</small>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 상단 헤더 */}
      <header className="top-header">
        <h1 className="logo">AllA.M.</h1>
        <div className="header-profile" onClick={() => setActiveTab('profile')}>
          <img src={userProfile.avatarUrl} alt="Avatar" className="header-avatar" />
          <span>{userProfile.name}</span>
          <span className="lvl">Lv.{Math.floor(userProfile.xp / 100) + 1}</span>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="content-body">
        {/* TAB 1: 알람 피드 */}
        {activeTab === 'alarm-feed' && (
          <section className="tab-page">
            <h2>⏰ 피드 (깨워주기/모닝콜)</h2>
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
                    <button className="btn-call" onClick={() => setCallEndedModal(post.author)}>📞 전화로 깨워주기 실행</button>
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
            <h2>🔔 내 알람 (AI 매일 자동 변경)</h2>
            {myAlarms.map(alarm => (
              <div key={alarm.id} className="alarm-card">
                <div>
                  <div className="alarm-time">{alarm.time}</div>
                  <div>{alarm.label} ({alarm.days.join(', ')})</div>
                  <small>{alarm.currentMusic}</small>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* TAB 3: 프로필 설정 & 리뷰 보기 */}
        {activeTab === 'profile' && (
          <section className="tab-page">
            <h2>👤 내 프로필 & 평점 관리</h2>
            <div className="profile-edit-box">
              <div className="avatar-picker">
                <img src={userProfile.avatarUrl} alt="내 아바타" className="large-avatar" />
                <label htmlFor="avatar-file" className="upload-label">🖼️ 갤러리에서 사진 변경</label>
                <input type="file" id="avatar-file" accept="image/*" onChange={handleAvatarUpload} hidden />
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

            {/* 받 평점 및 리뷰 목록 */}
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

      {/* 모닝콜 통화 완료 후 평점 & 리뷰 작성 모달 */}
      {callEndedModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>📞 모닝콜 완료!</h3>
            <p><strong>{callEndedModal}</strong> 님의 전화 깨워주기는 어떠셨나요?</p>

            <div className="rating-select">
              <label>평점 선택: </label>
              <select value={reviewScore} onChange={e => setReviewScore(Number(e.target.value))}>
                <option value="5">⭐⭐⭐⭐⭐ 5점 (완벽해요)</option>
                <option value="4">⭐⭐⭐⭐ 4점 (좋아요)</option>
                <option value="3">⭐⭐⭐ 3점 (보통이에요)</option>
                <option value="1">⭐ 1점 (별로예요)</option>
              </select>
            </div>

            <textarea placeholder="감사 인사나 후기를 남겨주세요" value={reviewComment} onChange={e => setReviewComment(e.target.value)} />

            <div className="modal-btn-row">
              <button className="btn-submit" onClick={handleSubmitReview}>리뷰 제출</button>
              <button className="btn-close" onClick={() => setCallEndedModal(null)}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* 타 유저 프로필 및 리뷰 보기 모달 */}
      {viewingProfileUser && (
        <div className="modal-backdrop" onClick={() => setViewingProfileUser(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="profile-modal-head">
              <img src={viewingProfileUser.avatarUrl} alt="avatar" className="large-avatar" />
              <h3>{viewingProfileUser.name} ({viewingProfileUser.age})</h3>
              <p className="bio-text">"{viewingProfileUser.bio}"</p>
              <span className="star-rating">⭐ 평점: {viewingProfileUser.rating} / 5.0</span>
            </div>
            <h4>받은 리뷰</h4>
            <div className="review-list">
              {viewingProfileUser.reviews.map((r, i) => (
                <div key={i} className="review-card">
                  <strong>{r.reviewer}</strong>: {r.text} (★{r.score})
                </div>
              ))}
            </div>
            <button className="btn-close-full" onClick={() => setViewingProfileUser(null)}>닫기</button>
          </div>
        </div>
      )}

      {/* 하단 고정 카카오톡 스타일 네비게이션 */}
      <nav className="bottom-nav">
        <button className={activeTab === 'alarm-feed' ? 'active' : ''} onClick={() => setActiveTab('alarm-feed')}>
          <span className="icon">⏰</span><span className="label">피드</span>
        </button>
        <button className={activeTab === 'my-alarms' ? 'active' : ''} onClick={() => setActiveTab('my-alarms')}>
          <span className="icon">🔔</span><span className="label">개인알람</span>
        </button>
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
          <span className="icon">👤</span><span className="label">프로필</span>
        </button>
      </nav>
    </div>
  );
}