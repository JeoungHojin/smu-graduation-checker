require('dotenv').config(); // ★ .env 사용
const mongoose = require('mongoose');
const Rule = require('./models/Rule');

// .env에서 주소 가져오기
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🔐 몽고디비 연결 성공 (규칙 저장용)'))
  .catch(err => console.log(err));

async function createRule23() {
  // 혹시 남아있을지 모를 찌꺼기 데이터 삭제
  await Rule.deleteMany({ entry_year: 2023, dept_name: "소프트웨어학과" });

  // 23학번 채점 기준표 생성
  const rule23 = new Rule({
    entry_year: 2023,
    dept_name: "소프트웨어학과",
    
    major_tracks: {
      // 심화전공: 전심 15 + 전선 60
      intensive: {
        deep_credit: 15, 
        elective_credit: 60
      },
      // 다전공: 합쳐서 45
      multi: {
        total_credit: 45
      },
      // 부전공: 합쳐서 21
      minor: {
        total_credit: 21
      }
    },
    
    // 교양 (일단 임시값)
    general: {
      total_credit: 33
    }
  });

  await rule23.save();
  console.log("✅ 2023학번 졸업요건(Rule)이 DB에 저장되었습니다!");
  process.exit();
}

createRule23();