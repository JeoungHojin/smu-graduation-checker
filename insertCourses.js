const mongoose = require('mongoose');
const Rule = require('./models/Rule');
require('dotenv').config(); // 1. 이걸 맨 위에 추가 (금고 여는 기능)
const mongoose = require('mongoose');

// 2. process.env.변수이름 으로 가져오기
mongoose.connect(process.env.MONGODB_URI) 
  .then(() => console.log('몽고디비 연결 성공!'))
  .catch(err => console.log(err));

const softwareCourses = [
  // --- [이미지 1] ---
  { course_code: "HBJO2173", course_name: "컴퓨터프로그래밍 I (PBL)", type: "1전선", credit: 3 },
  { course_code: "HBJO2193", course_name: "소프트웨어개론(SW)", type: "1전선", credit: 3 },
  { course_code: "HBJO2216", course_name: "확률통계(Flip)", type: "1전선", credit: 3 },
  { course_code: "HBJO2161", course_name: "컴퓨터프로그래밍 II (PBL)", type: "1전선", credit: 3 },
  { course_code: "HBJO2225", course_name: "컴퓨터프로그래밍실습(PBL)", type: "1전선", credit: 3 },
  { course_code: "HBJW0001", course_name: "이산수학", type: "1전선", credit: 3 },
  { course_code: "HBJW0008", course_name: "웹프로그래밍", type: "1전선", credit: 3 },
  { course_code: "HBJO2122", course_name: "컴퓨터구조", type: "1전선", credit: 3 },
  { course_code: "HBJO2177", course_name: "객체지향프로그래밍", type: "1전선", credit: 3 },
  { course_code: "HBJO2226", course_name: "데이터구조실습(PBL)", type: "1전선", credit: 3 },
  { course_code: "HBJW0006", course_name: "데이터구조(PBL)", type: "1전선", credit: 3 },
  { course_code: "HBJW0012", course_name: "오픈소스리눅스프로그래밍(PBL)", type: "1전선", credit: 3 },
  { course_code: "HBJO2179", course_name: "알고리즘(PBL)", type: "1전선", credit: 3 },
  { course_code: "HBJO2184", course_name: "데이터베이스", type: "1전선", credit: 3 },
  { course_code: "HBJO2205", course_name: "임베디드IoT프로그래밍", type: "1전선", credit: 3 },
  { course_code: "HBJO2209", course_name: "모바일프로그래밍", type: "1전선", credit: 3 },
  { course_code: "HBJO2227", course_name: "알고리즘실습(PBL)", type: "1전선", credit: 3 },
  { course_code: "HBJO2174", course_name: "운영체제(PBL)", type: "1전심", credit: 3 }, // 전심
  { course_code: "HBJO2178", course_name: "네트워크", type: "1전심", credit: 3 },   // 전심
  { course_code: "HBJO2217", course_name: "스마트웹프로그래밍(PBL)", type: "1전선", credit: 3 },
  { course_code: "HBJO2218", course_name: "시스템프로그래밍(PBL)", type: "1전심", credit: 3 }, // 전심
  { course_code: "HBJO2219", course_name: "빅데이터개론(PBL)", type: "1전선", credit: 3 },
  { course_code: "HBJO2221", course_name: "소프트웨어프로젝트I(PBL)", type: "1전선", credit: 3 },
  { course_code: "HBJO0052", course_name: "웹서버프로그래밍(PBL)", type: "1전심", credit: 3 }, // 전심
  { course_code: "HBJO0053", course_name: "영상처리(PBL)", type: "1전심", credit: 3 },       // 전심
  { course_code: "HBJO2186", course_name: "프로그래밍트레이닝(PBL)", type: "1전심", credit: 3 }, // 전심
  { course_code: "HBJO2215", course_name: "인턴십1(소프트웨어)", type: "1전선", credit: 2 },   // 2학점
  { course_code: "HBJO2222", course_name: "소프트웨어프로젝트II(PBL)", type: "1전선", credit: 3 },
  { course_code: "HBJW0018", course_name: "정보보호", type: "1전심", credit: 3 },             // 전심
  { course_code: "HBJO2175", course_name: "소프트웨어캡스톤디자인 I", type: "1전선", credit: 3 },
  { course_code: "HBJO2197", course_name: "설계패턴", type: "1전선", credit: 3 },
  { course_code: "HBJO2199", course_name: "시스템분석및설계", type: "1전선", credit: 3 },
  { course_code: "HBJO2214", course_name: "인턴십2(소프트웨어)", type: "1전선", credit: 2 },   // 2학점
  { course_code: "HBJO2223", course_name: "소프트웨어공학(PBL)", type: "1전선", credit: 3 },
  { course_code: "HBJO2224", course_name: "컴퓨터그래픽스(PBL)", type: "1전선", credit: 3 },
  { course_code: "HBJW0021", course_name: "인간-컴퓨터 상호작용", type: "1전선", credit: 3 },
  { course_code: "HBJO2196", course_name: "소프트웨어캡스톤디자인 II", type: "1전선", credit: 3 },
  { course_code: "HBJO2207", course_name: "지능형소프트웨어", type: "1전선", credit: 3 },
  { course_code: "HBJO2220", course_name: "전공세미나", type: "1전선", credit: 3 },
  { course_code: "HBJW0022", course_name: "소프트웨어특강", type: "1전선", credit: 3 }
];

async function insertData() {
  try {
    // 기존 데이터가 있다면 싹 비우고 다시 넣기 (중복 방지)
    await Course.deleteMany({});
    console.log('🧹 기존 과목 데이터 삭제 완료');

    // 데이터 삽입
    await Course.insertMany(softwareCourses);
    console.log(`✅ 총 ${softwareCourses.length}개의 과목 데이터 저장 성공!`);
    
    process.exit();
  } catch (error) {
    console.error('데이터 저장 중 오류 발생:', error);
  }
}

insertData();