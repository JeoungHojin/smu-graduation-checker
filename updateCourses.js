const mongoose = require('mongoose');
const Rule = require('./models/Rule');
require('dotenv').config(); // 1. 이걸 맨 위에 추가 (금고 여는 기능)
const mongoose = require('mongoose');

// 2. process.env.변수이름 으로 가져오기
mongoose.connect(process.env.MONGODB_URI) 
  .then(() => console.log('몽고디비 연결 성공!'))
  .catch(err => console.log(err));

const courses24 = [
  // --- [이미지 1] ---
  { code: "HBJO2173", name: "컴퓨터프로그래밍 I (PBL)", type: "1전선", credit: 3 },
  { code: "HBJO2193", name: "소프트웨어개론(SW)", type: "1전선", credit: 3 },
  { code: "HBJO2216", name: "확률통계(Flip)", type: "1전선", credit: 3 },
  { code: "HBJO2230", name: "컴퓨터프로그래밍실습I(PBL)", type: "1전선", credit: 3 }, // NEW
  { code: "HBJO2161", name: "컴퓨터프로그래밍 II (PBL)", type: "1전선", credit: 3 },
  { code: "HBJO2225", name: "컴퓨터프로그래밍실습II(PBL)", type: "1전선", credit: 3 }, // 이름변경
  { code: "HBJW0001", name: "이산수학", type: "1전선", credit: 3 },
  { code: "HBJW0008", name: "웹프로그래밍", type: "1전선", credit: 3 },
  { code: "HBJO2122", name: "컴퓨터구조", type: "1전선", credit: 3 },
  { code: "HBJO2177", name: "객체지향프로그래밍", type: "1전선", credit: 3 },
  { code: "HBJO2226", name: "데이터구조실습(PBL)", type: "1전선", credit: 3 },
  { code: "HBJW0006", name: "데이터구조(PBL)", type: "1전선", credit: 3 },
  { code: "HBJW0012", name: "리눅스프로그래밍(PBL)", type: "1전선", credit: 3 }, // 이름변경
  { code: "HBJO2179", name: "알고리즘(PBL)", type: "1전선", credit: 3 },
  { code: "HBJO2184", name: "데이터베이스", type: "1전선", credit: 3 },
  { code: "HBJO2209", name: "모바일프로그래밍", type: "1전선", credit: 3 },
  { code: "HBJO2227", name: "알고리즘실습(PBL)", type: "1전선", credit: 3 },
  { code: "HBJO2233", name: "iOS 프로그래밍", type: "1전선", credit: 3 }, // NEW
  { code: "HBJW0021", name: "인간-컴퓨터 상호작용(PBL)", type: "1전선", credit: 3 },
  { code: "HBJO2174", name: "운영체제(PBL)", type: "1전선", credit: 3 }, // 전선으로 변경됨? (이미지 기준)
  { code: "HBJO2178", name: "네트워크(PBL)", type: "1전선", credit: 3 },
  { code: "HBJO2186", name: "프로그래밍트레이닝(PBL)", type: "1전선", credit: 3 },

  // --- [이미지 2] ---
  { code: "HBJO2219", name: "데이터과학개론(PBL)", type: "1전심", credit: 3 }, // 이름/타입 변경
  { code: "HBJO2221", name: "소프트웨어프로젝트I(PBL)", type: "1전선", credit: 3 },
  { code: "HBJO2223", name: "소프트웨어공학(PBL)", type: "1전선", credit: 3 },
  { code: "HBJO2236", name: "인공지능(PBL)", type: "1전선", credit: 3 }, // NEW
  { code: "HBJO0052", name: "웹서버프로그래밍(PBL)", type: "1전심", credit: 3 },
  { code: "HBJO0053", name: "영상처리(PBL)", type: "1전선", credit: 3 }, // 전심 -> 전선 변경
  { code: "HBJO2205", name: "임베디드IoT프로그래밍(PBL)", type: "1전심", credit: 3 }, // 전선 -> 전심 변경
  { code: "HBJO2222", name: "소프트웨어프로젝트II(PBL)", type: "1전선", credit: 3 },
  { code: "HBJO2229", name: "프로그래밍언어와컴파일러(PBL)", type: "1전선", credit: 3 }, // NEW
  { code: "HBJO2235", name: "심층학습(PBL)", type: "1전심", credit: 3 }, // NEW
  { code: "HBJW0018", name: "정보보호(PBL)", type: "1전심", credit: 3 },
  { code: "HBJO2175", name: "소프트웨어캡스톤디자인 I", type: "1전선", credit: 3 },
  { code: "HBJO2218", name: "병렬프로그래밍(PBL)", type: "1전심", credit: 3 }, // 시스템P -> 병렬P 변경
  { code: "HBJO2224", name: "컴퓨터그래픽스(PBL)", type: "1전심", credit: 3 }, // 전선 -> 전심 변경
  { code: "HBJO2228", name: "클라우드컴퓨팅(PBL)", type: "1전심", credit: 3 }, // NEW
  { code: "HBJO2232", name: "컴퓨터비전(PBL)", type: "1전심", credit: 3 }, // NEW
  { code: "HBJO2196", name: "소프트웨어캡스톤디자인 II", type: "1전선", credit: 3 },
  { code: "HBJO2207", name: "지능형소프트웨어(PBL)", type: "1전심", credit: 3 }, // 전선 -> 전심 변경
  { code: "HBJO2231", name: "고성능컴퓨팅(PBL)", type: "1전심", credit: 3 }, // NEW
  { code: "HBJW0022", name: "소프트웨어특강(PBL)", type: "1전심", credit: 3 } // 전선 -> 전심 변경
];

async function updateData() {
  try {
    const operations = courses24.map(course => ({
      updateOne: {
        filter: { course_code: course.code }, // 학수번호가 같으면
        update: { 
          $set: { 
            course_name: course.name, 
            type: course.type, 
            credit: course.credit 
          } 
        },
        upsert: true // 없으면 새로 만든다! (중요)
      }
    }));

    const result = await Course.bulkWrite(operations);
    console.log(`✅ 데이터 업데이트 완료!`);
    console.log(`- 수정됨(Matched): ${result.matchedCount}개`);
    console.log(`- 새로 추가됨(Upserted): ${result.upsertedCount}개`);
    
    process.exit();
  } catch (error) {
    console.error('업데이트 중 오류 발생:', error);
  }
}

updateData();