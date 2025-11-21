import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './App.css'; // 스타일 파일 (아래에서 만들 예정)

function App() {
  // 기본 설정값 (사용자가 귀찮지 않게 기본값 세팅)
  const [entryYear, setEntryYear] = useState('2023');
  const [major, setMajor] = useState('소프트웨어학과');
  const [track, setTrack] = useState('intensive'); // intensive, multi, minor
  const [result, setResult] = useState(null); // 결과 데이터
  const [loading, setLoading] = useState(false); // 로딩 상태

  // 엑셀 파일 처리 함수
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true); // 로딩 시작

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      // 서버로 전송
      sendToServer(data);
    };
    reader.readAsBinaryString(file);
  };

  const sendToServer = async (courseList) => {
    try {
      const response = await axios.post('http://localhost:5000/api/check', {
        entryYear: parseInt(entryYear),
        majorName: major,
        trackMode: track,
        courseList: courseList
      });
      setResult(response.data);
    } catch (error) {
      alert("서버 통신 중 오류가 발생했습니다. (서버가 켜져 있는지 확인하세요)");
      console.error(error);
    } finally {
      setLoading(false); // 로딩 끝
    }
  };

  return (
    <div className="app-container">
      {/* 1. 헤더 영역 */}
      <header className="app-header">
        <div className="header-content">
          <h1>🎓 상명대 졸업요건 검사기</h1>
          <p>로그인 없이 엑셀 파일만 올리면 바로 확인 가능합니다.</p>
        </div>
      </header>

      {/* 2. 메인 컨텐츠 영역 */}
      <main className="main-content">
        
        {/* 입력 카드 */}
        <div className="card input-card">
          <h2>1️⃣ 기본 정보 입력</h2>
          <div className="input-group">
            <div className="input-item">
              <label>학번(입학년도)</label>
              <input 
                type="number" 
                value={entryYear} 
                onChange={(e) => setEntryYear(e.target.value)} 
              />
            </div>
            <div className="input-item">
              <label>학과</label>
              <input 
                type="text" 
                value={major} 
                onChange={(e) => setMajor(e.target.value)} 
              />
            </div>
            <div className="input-item">
              <label>전공 과정</label>
              <select value={track} onChange={(e) => setTrack(e.target.value)}>
                <option value="intensive">심화전공</option>
                <option value="multi">다전공 (복수전공)</option>
                <option value="minor">부전공</option>
              </select>
            </div>
          </div>
        </div>

        {/* 업로드 카드 */}
        <div className="card upload-card">
          <h2>2️⃣ 성적표 업로드</h2>
          <p className="upload-desc">학교 포털에서 다운받은 엑셀 파일(.xlsx)을 업로드해주세요.</p>
          
          <div className="file-upload-wrapper">
            <input 
              id="file-upload" 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
            <label htmlFor="file-upload" className="custom-file-upload">
              {loading ? "⏳ 분석 중..." : "📂 엑셀 파일 선택하기"}
            </label>
          </div>
        </div>

        {/* 3. 결과 리포트 (결과가 있을 때만 표시) */}
        {result && (
          <div className="result-container">
            <h2 className="result-title">📊 졸업 요건 분석 결과</h2>
            
            <div className="result-grid">
              {/* 전공 결과 */}
              <div className="result-card">
                <h3>전공 영역</h3>
                {track === 'intensive' ? (
                  <>
                    <ResultItem label="전공심화" pass={result.pass_status.major_deep} 
                      score={result.score.major_deep} />
                    <ResultItem label="전공선택" pass={result.pass_status.major_elec} 
                      score={result.score.major_elec} />
                  </>
                ) : (
                  <ResultItem label="전공이수" pass={result.pass_status.major_total} 
                    score={result.score.major_deep + result.score.major_elec} />
                )}
              </div>

              {/* 교양 결과 */}
              <div className="result-card">
                <h3>교양 영역</h3>
                <ResultItem label="기초교양" pass={result.pass_status.basic} 
                  msg={result.pass_status.basic ? "4과목 이수" : `미이수: ${result.missing_basic.join(', ')}`} />
                
                <ResultItem label="핵심역량" pass={result.pass_status.core} 
                  msg={`${result.core_areas.length}개 영역 충족`} />
                
                <ResultItem label="균형교양" pass={result.pass_status.balanced_area && result.pass_status.balanced_credit} 
                  msg={`${result.balanced_areas.length}개 영역 충족`} />
                
                <ResultItem label="교양총점" pass={result.pass_status.total_general} 
                  score={result.score.total_general} target="/ 33" />
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// 결과 표시용 작은 컴포넌트 (코드 깔끔하게 하려고 분리)
function ResultItem({ label, pass, score, target = "", msg }) {
  return (
    <div className={`result-item ${pass ? 'pass' : 'fail'}`}>
      <span className="label">{label}</span>
      <div className="status">
        {pass ? <span className="badge pass">PASS</span> : <span className="badge fail">FAIL</span>}
        <span className="detail">
          {msg ? msg : `${score}학점 ${target}`}
        </span>
      </div>
    </div>
  );
}

export default App;