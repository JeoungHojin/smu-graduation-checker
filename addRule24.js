require('dotenv').config();
const mongoose = require('mongoose');
const Rule = require('./models/Rule');

// DB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🔐 몽고디비 연결 성공 (24학번 규칙 저장)'))
  .catch(err => console.log(err));

async function createRule24() {
  // 기존 24학번 데이터 초기화
  await Rule.deleteMany({ entry_year: 2024, dept_name: "소프트웨어학과" });

  const rule24 = new Rule({
    entry_year: 2024, // ★ 24학번
    dept_name: "소프트웨어학과",
    
    major_tracks: {
      // 1. 심화전공 (Intensive)
      // ❓ [질문] 24학번도 23학번처럼 (심화 15 / 전선 60) 인가요?
      // 아니면 심화 과목이 늘어난 만큼, 심화 학점 기준도 올랐나요? (예: 18학점?)
      // 일단 15/60으로 적어둘 테니, 다르면 숫자를 고쳐주세요!
      intensive: {
        deep_credit: 15,     
        elective_credit: 60 
      },
      
      // 2. 다전공
      multi: {
        total_credit: 45
      },
      
      // 3. 부전공
      minor: {
        total_credit: 21
      }
    },
    
    // 교양 (일단 공통값)
    general: {
      total_credit: 33
    }
  });

  await rule24.save();
  console.log("✅ 2024학번 졸업요건이 DB에 저장되었습니다!");
  process.exit();
}

createRule24();