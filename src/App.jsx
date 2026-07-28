import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('community');
  const [currentUser] = useState('익명게스트_' + Math.floor(1000 + Math.random() * 9000));
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const [posts, setPosts] = useState([
    {
      id: 1,
      author: '새벽열공러',
      time: '05:30',
      reason: '기말고사 최종 복습해야 합니다! 꼭 좀 깨워주세요!',
      music: 'Ditto - 뉴진스',
      reservers: ['모닝엔젤_1', '아침형인간'],
      comments: [
        { id: 101, author: '아침형인간', text: '5시 30분에 맞춰서 전화 걸어드릴게요! 꼭 한 번에 일어나세요 화이팅!' },
        { id: 102, author: '열공러팬', text: '시험 응원합니다! 2단계 수다 전화로 확실하게 깨워드릴게요.' }
      ]
    },
    {
      id: 2,
      author: '혼자깨기고수',
      time: '07:00',
      reason: '주말 아침 독서 모임 참여하기',
      music: 'AI 자동 추천 알람음',
      reservers: [],
      comments: []
    }
  ]);

  const [selectedPost, setSelectedPost] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [activeAiAlarm, setActiveAiAlarm] = useState(null);

  const [newAuthor, setNewAuthor] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newMusic, setNewMusic] = useState('');
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    let interval = null;
    if (activeCall && activeCall.remainingSeconds > 0) {
      interval = setInterval(() => {
        setActiveCall((prev) => {
          if (!prev) return null;
          if (prev.remainingSeconds <= 1) {
            clearInterval(interval);
            return null;
          }
          return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall]);

  const handleSubmitAI = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) {
      setError('좋아하는 노래나 가수를 입력해 주세요.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: userInput.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '요청 처리 중 오류가 발생했습니다.');
      setResult(data.result);
    } catch (err) {
      setError(err.message || '서버와의 통신에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const parseResultToCards = (rawText) => {
    if (!rawText) return [];
    const lines = rawText.split('\n').filter(line => line.trim() !== '');
    const cards = [];
    let currentCard = { title: '', content: '' };

    lines.forEach((line) => {
      const trimmed = line.trim();
      const itemMatch = trimmed.match(/^(\d+[\.\)]\s*|[-*]\s*)(.+)/);
      if (itemMatch) {
        if (currentCard.title) cards.push(currentCard);
        const fullContent = itemMatch[2];
        const parts = fullContent.split(':');
        if (parts.length > 1) {
          currentCard = { title: parts[0].trim(), content: parts.slice(1).join(':').trim() };
        } else {
          currentCard = { title: `항목 ${cards.length + 1}`, content: fullContent.trim() };
        }
      } else {
        if (currentCard.title) {
          currentCard.content += ' ' + trimmed;
        } else {
          currentCard = { title: '안내 사항', content: trimmed };
        }
      }
    });
    if (currentCard.title) cards.push(currentCard);
    return cards;
  };

  const cardList = result ? parseResultToCards(result) : [];

  const handleSelectAiMusic = (musicText) => {
    setNewMusic(musicText);
    setActiveTab('community');
    alert(`[${musicText}]가 알람음으로 선택되었습니다.`);
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newTime || !newReason.trim()) {
      alert('닉네임, 알람 시간, 일어나는 이유를 모두 입력해 주세요.');
      return;
    }
    const newPostObj = {
      id: Date.now(),
      author: newAuthor.trim(),
      time: newTime,
      reason: newReason.trim(),
      music: newMusic.trim() || 'AI 취향 추천 음악',
      reservers: [],
      comments: []
    };
    setPosts([newPostObj, ...posts]);
    setNewAuthor(''); setNewTime(''); setNewReason(''); setNewMusic('');
  };

  const handleReserveCall = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const alreadyReserved = post.reservers.includes(currentUser);
        const updatedReservers = alreadyReserved
          ? post.reservers.filter(user => user !== currentUser)
          : [...post.reservers, currentUser];
        const updatedPost = { ...post, reservers: updatedReservers };
        if (selectedPost && selectedPost.id === postId) setSelectedPost(updatedPost);
        return updatedPost;
      }
      return post;
    }));
  };

  const triggerAlarm = (post) => {
    if (post.reservers.length > 0) {
      const isMultiple = post.reservers.length > 1;
      const timeLimit = isMultiple ? 20 : 30;
      setActiveCall({
        post,
        limitSeconds: timeLimit,
        remainingSeconds: timeLimit,
        callerName: currentUser,
        receiverName: post.author
      });
    } else {
      setActiveAiAlarm(post);
    }
  };

  const handleAddComment = (postId) => {
    if (!commentInput.trim()) return;
    const newCommentObj = { id: Date.now(), author: currentUser, text: commentInput.trim() };
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const updated = { ...post, comments: [...post.comments, newCommentObj] };
        if (selectedPost && selectedPost.id === postId) setSelectedPost(updated);
        return updated;
      }
      return post;
    }));
    setCommentInput('');
  };

  return (
    <div className="container">
      <header className="header">
        <h1 className="app-title">AllA.M.</h1>
        <p className="app-subtitle">깨워주는 사람이 없을 땐 AI가 추천한 음악으로 혼자서도 완벽하게!</p>
        <div className="user-badge">접속 계정: <strong>{currentUser}</strong></div>
      </header>

      <nav className="tab-nav">
        <button className={`tab-button ${activeTab === 'community' ? 'active' : ''}`} onClick={() => setActiveTab('community')}>⏰ 알람 피드 & 소통</button>
        <button className={`tab-button ${activeTab === 'ai-recommend' ? 'active' : ''}`} onClick={() => setActiveTab('ai-recommend')}>🎵 AI 알람음 추천받기</button>
      </nav>

      <main className="main-content">
        {activeTab === 'community' && (
          <section className="community-section">
            <form onSubmit={handleCreatePost} className="post-form">
              <h2 className="form-title">내 알람 등록하기</h2>
              <div className="form-row">
                <input type="text" className="input-field" placeholder="닉네임" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} />
                <input type="time" className="input-field" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
              </div>
              <textarea className="text-input" rows="3" placeholder="일어나는 이유" value={newReason} onChange={(e) => setNewReason(e.target.value)} />
              <div className="music-input-group">
                <input type="text" className="input-field" placeholder="설정할 알람음 (예약자 없을 때 AI 재생)" value={newMusic} onChange={(e) => setNewMusic(e.target.value)} />
                <button type="button" className="ai-recommend-link-btn" onClick={() => setActiveTab('ai-recommend')}>AI 추천받기</button>
              </div>
              <button type="submit" className="submit-button">알람 공유 및 게시물 올리기</button>
            </form>

            <div className="feed-list">
              <h2 className="section-title">실시간 알람 피드</h2>
              {posts.map((post) => {
                const isReservedByMe = post.reservers.includes(currentUser);
                const hasReservers = post.reservers.length > 0;
                return (
                  <div key={post.id} className="post-card">
                    <div className="post-header">
                      <span className="post-author">{post.author}</span>
                      <span className="post-time">⏰ {post.time}</span>
                    </div>
                    <p className="post-reason">{post.reason}</p>
                    <div className="post-music-info">🎵 설정 알람음: <span>{post.music}</span></div>
                    <div className={`call-info-badge ${hasReservers ? 'has-reservers' : 'no-reservers'}`}>
                      {hasReservers ? `🔒 전화 깨우기 대기 중 | 예약자 ${post.reservers.length}명` : '🎵 예약자 없음 | 알람 시간에 AI 추천 음악 발동'}
                    </div>
                    <div className="post-actions">
                      <button className={`reserve-button ${isReservedByMe ? 'reserved' : ''}`} onClick={() => handleReserveCall(post.id)}>
                        {isReservedByMe ? '✅ 깨우기 예약됨' : '📅 깨워주기 예약'}
                      </button>
                      <button className={`alarm-trigger-button ${hasReservers ? 'call-mode' : 'ai-mode'}`} onClick={() => triggerAlarm(post)}>
                        {hasReservers ? '📞 전화로 깨우기' : '🔔 AI 음악 알람 실행'}
                      </button>
                      <button className="detail-button" onClick={() => setSelectedPost(post)}>💬 수다/의견 ({post.comments.length})</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'ai-recommend' && (
          <section className="ai-section">
            <form onSubmit={handleSubmitAI} className="input-form">
              <h2 className="form-title">취향 맞춤 알람 음악 추천받기</h2>
              <textarea className="text-input" rows="4" placeholder="좋아하는 노래나 가수를 입력해 주세요." value={userInput} onChange={(e) => setUserInput(e.target.value)} disabled={loading} />
              <button type="submit" className="submit-button" disabled={loading || !userInput.trim()}>
                {loading ? '추천 찾는 중...' : '맞춤 알람음 추천받기'}
              </button>
            </form>
            {error && <div className="error-message">{error}</div>}
            <section className="result-section">
              <h2 className="result-heading">AI 추천 결과</h2>
              {loading && <div className="status-box">Gemini AI가 취향을 분석하고 있습니다...</div>}
              {!loading && result && (
                <div className="card-grid">
                  {cardList.map((card, idx) => (
                    <div key={idx} className="card">
                      <h3 className="card-title">{card.title}</h3>
                      <p className="card-content">{card.content}</p>
                      {card.title.includes('추천 노래') && (
                        <button className="use-as-alarm-btn" onClick={() => handleSelectAiMusic(card.content)}>이 곡을 알람음으로 설정</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </section>
        )}
      </main>

      {/* 모달 피드 및 알람 레이어 생략 (스타일 동일) */}
      {activeCall && (
        <div className="call-modal-backdrop">
          <div className="call-card">
            <h2>{activeCall.receiverName} 님을 깨우는 중</h2>
            <p className="call-timer">{activeCall.remainingSeconds}초 후 자동 종료</p>
            <button className="end-call-button" onClick={() => setActiveCall(null)}>통화 종료하기</button>
          </div>
        </div>
      )}

      {activeAiAlarm && (
        <div className="ai-alarm-backdrop">
          <div className="ai-alarm-card">
            <h2>🎵 깨워주는 사람이 없어 AI 알람 발동!</h2>
            <p className="ai-alarm-time">⏰ {activeAiAlarm.time}</p>
            <div className="ai-alarm-music-box">
              <p className="music-title">{activeAiAlarm.music}</p>
            </div>
            <button className="stop-alarm-button" onClick={() => setActiveAiAlarm(null)}>⏰ 알람 끄기</button>
          </div>
        </div>
      )}
    </div>
  );
}