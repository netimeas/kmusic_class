// App.tsx
import React, { useState } from 'react';
import './App.css';
import { playSong, playMelody, playSingleNote, Region, NoteName } from './audioEngine';

const App: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<Region>('western');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [customMelody, setCustomMelody] = useState<NoteName[]>([]);
  
  // 3번 활동 초기값을 'butterfly'로 설정
  const [selectedSong, setSelectedSong] = useState<string>('butterfly');

  const handleRegionChange = (region: Region) => setSelectedRegion(region);

  const handlePlaySong = (songId: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    playSong(songId, selectedRegion, () => setIsPlaying(false));
  };

  const handleNoteClick = (note: NoteName) => {
    playSingleNote(note, selectedRegion);
    setCustomMelody([...customMelody, note]);
  };

  const handlePlayCustom = () => {
    if (isPlaying || customMelody.length === 0) return;
    setIsPlaying(true);
    playMelody(customMelody, selectedRegion, () => setIsPlaying(false));
  };

  const clearCustomMelody = () => setCustomMelody([]);

  const getRegionExplanation = () => {
    switch (selectedRegion) {
      case 'western': return "기본 서양 음계입니다. 피아노와 같은 맑은 기계음(사인파)으로 들립니다.";
      case 'gyeonggi': return "경토리(경기도)입니다. 맑고 경쾌하게 차례대로 이어지는 것이 특징입니다.";
      case 'pyeongan': return "수심가토리(평안도)입니다. '라' 음에서 잘게 떨고, 애절한 느낌이 납니다.";
      case 'jeolla': return "육자배기토리(전라도)입니다. '미' 음을 굵게 떨고, '도'에서 '시'로 꺾어 부르는 구수한 특징이 있습니다.";
      default: return "";
    }
  };

  const noteLabels: Record<NoteName, string> = {
    do: '도', re: '레', mi: '미', fa: '파', sol: '솔', la: '라', ti: '시'
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>🎵 AI 팔도 민요 토리 변환기</h1>
        <p>서양 음악의 음계를 국악의 지역별 토리로 바꾸어 들어보세요.</p>
      </header>

      <main className="main-content">
        {/* 도입: 1. 학교종 */}
        <section className="section-card">
          <h2>1. 도입: 학교종 들어보기</h2>
          <p>우리가 잘 아는 '학교종'이 국악을 만나면 어떻게 변할까요? 아래 버튼을 눌러보세요.</p>
          <button 
            className="action-btn primary" 
            onClick={() => handlePlaySong('schoolBell')}
            disabled={isPlaying}
          >
            ▶ 학교종 재생하기 (현재 토리 적용)
          </button>
        </section>

        {/* 활동 1: 2. 토리 들어보기 */}
        <section className="section-card">
          <h2>2. 토리 들어보기 (지역 선택)</h2>
          <p>아래 버튼을 눌러 각 지역의 음악적 특징(토리)을 선택하세요. 선택 후 다른 활동을 진행하면 해당 토리가 적용됩니다.</p>
          
          <div className="region-buttons">
            <button className={`reg-btn ${selectedRegion === 'western' ? 'active' : ''}`} onClick={() => handleRegionChange('western')}>기본 음계 (서양)</button>
            <button className={`reg-btn ${selectedRegion === 'pyeongan' ? 'active' : ''}`} onClick={() => handleRegionChange('pyeongan')}>수심가토리 (평안도)</button>
            <button className={`reg-btn ${selectedRegion === 'gyeonggi' ? 'active' : ''}`} onClick={() => handleRegionChange('gyeonggi')}>경토리 (경기도)</button>
            <button className={`reg-btn ${selectedRegion === 'jeolla' ? 'active' : ''}`} onClick={() => handleRegionChange('jeolla')}>육자배기토리 (전라도)</button>
          </div>

          <div className="explanation-box">
            <strong>💡 음악적 특징: </strong> {getRegionExplanation()}
          </div>
        </section>

        {/* 활동 2-1: 3. 동요 선택하기 */}
        <section className="section-card">
          <h2>3. 동요 선택하여 감상하기</h2>
          <p>원하는 동요를 선택하고, 현재 적용된 토리로 어떻게 변하는지 감상해 봅시다.</p>
          <div className="song-selector">
            <select value={selectedSong} onChange={(e) => setSelectedSong(e.target.value)} className="dropdown">
              <option value="butterfly">나비야 (솔미미 파레레)</option>
              <option value="airplane">비행기 (미레도레 미미미)</option>
              <option value="littleStar">작은 별 (도도솔솔 라라솔)</option>
              <option value="threeBears">곰 세마리 (도도도도 도미솔)</option>
            </select>
            <button 
              className="action-btn secondary" 
              onClick={() => handlePlaySong(selectedSong)}
              disabled={isPlaying}
            >
              ▶ 선택한 곡 재생
            </button>
          </div>
        </section>

        {/* 활동 2-2: 4. 간단한 곡 만들기 */}
        <section className="section-card">
          <h2>4. 간단한 곡 만들기</h2>
          <p>직접 계이름 버튼을 눌러 가락을 입력해 봅시다. 입력한 가락이 선택된 토리의 시김새로 어떻게 표현되는지 확인하세요.</p>
          
          <div className="piano-keys">
            {(Object.keys(noteLabels) as NoteName[]).map(note => (
              <button key={note} className="key-btn" onClick={() => handleNoteClick(note)}>
                {noteLabels[note]}
              </button>
            ))}
          </div>

          <div className="melody-display">
            <strong>입력된 가락: </strong>
            {customMelody.length === 0 ? <span className="placeholder">버튼을 눌러 가락을 만들어보세요.</span> : null}
            {customMelody.map((n, i) => <span key={i} className="note-badge">{noteLabels[n]}</span>)}
          </div>

          <div className="custom-actions">
            <button className="action-btn primary" onClick={handlePlayCustom} disabled={isPlaying || customMelody.length === 0}>
              ▶ 내가 만든 곡 재생
            </button>
            <button className="action-btn danger" onClick={clearCustomMelody} disabled={isPlaying || customMelody.length === 0}>
              초기화
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;