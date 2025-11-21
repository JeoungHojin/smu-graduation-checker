require('dotenv').config();
const mongoose = require('mongoose');
const Rule = require('./models/Rule');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🔐 몽고디비 연결 성공'));

async function createRule23() {
  await Rule.deleteMany({ entry_year: 2023, dept_name: "소프트웨어학과" });

  const rule23 = new Rule({
    entry_year: 2023,
    dept_name: "소프트웨어학과",
    
    major_tracks: {
      intensive: { deep_credit: 15, elective_credit: 60 },
      multi: { total_credit: 45 },
      minor: { total_credit: 21 }
    },
    
    general: {
      total_credit: 33, // ★ 교양 총 33학점 이상 필수

      basic: {
        // 1. 고정 필수 (3과목)
        fixed_list: [
          "HBLA5001", // 사고와표현
          "HBLA5201", // 컴퓨팅사고와데이터의이해
          "HBLA5202"  // 알고리즘과게임콘텐츠
        ],
        // 2. 택 1 필수 (영어 or 기초수학)
        choice_list: [
          "HBLA5210", // EnglishForAcademicPurposes
          "HBLA5004"  // 기초수학 (코드 확인 필요하나 일단 예시로 넣음)
        ]
      },

      core_competency: {
        area_count: 2 // 핵심역량 2개 영역
      },

      balanced: {
        area_count: 3, // 균형교양 3개 영역
        excluded_areas: ["공학"] // 공학 제외
      }
    }
  });

  await rule23.save();
  console.log("✅ 2023학번 졸업요건(기초교양 택1 로직 포함) 저장 완료!");
  process.exit();
}

createRule23();