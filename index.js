const mongoose = require('mongoose');
const Rule = require('./models/Rule');
require('dotenv').config(); // 1. 이걸 맨 위에 추가 (금고 여는 기능)
const mongoose = require('mongoose');

// 2. process.env.변수이름 으로 가져오기
mongoose.connect(process.env.MONGODB_URI) 
  .then(() => console.log('몽고디비 연결 성공!'))
  .catch(err => console.log(err));

async function createSampleRule() {
  await Rule.deleteMany({}); 

  const sample = new Rule({
    entry_year: 2021,
    dept_name: "소프트웨어학과",
    
    // 교양 (공통)
    general: {
      essential_credit: 14,
      total_credit: 33,
      essential_list: ["사고와표현", "EnglishFoundation"]
    },

    // 전공 (트랙별로 다름!)
    major_tracks: {
      // 1. 심화전공 선택 시: 75학점 필요
      intensive: {
        required_credit: 75,
        essential_list: ["SW101", "SW102", "SW103"] 
      },
      // 2. 복수전공(다전공) 선택 시: 내 전공은 45학점만 들으면 됨
      multi: {
        required_credit: 45,
        essential_list: ["SW101", "SW102"] // 다전공자는 전필이 줄어들 수도 있음
      },
      // 3. 부전공 선택 시: 내 전공은 60학점 필요
      minor: {
        required_credit: 60,
        essential_list: ["SW101", "SW102"]
      }
    }
  });

  await sample.save();
  console.log("✅ 트랙별 졸업요건 데이터 저장 완료!");
}

createSampleRule();