const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  entry_year: { type: Number, required: true },
  dept_name: { type: String, required: true },
  
  // 전공 (기존과 동일)
  major_tracks: {
    intensive: { deep_credit: { type: Number, default: 15 }, elective_credit: { type: Number, default: 60 } },
    multi: { total_credit: { type: Number, default: 45 } },
    minor: { total_credit: { type: Number, default: 21 } }
  },

  // 교양 (23학번 기준 업데이트)
  general: {
    total_credit: { type: Number, default: 33 }, // ★ 교양 총 학점 33점 이상

    // 1. 기초교양 (4과목)
    basic: {
      fixed_list: [String],  // 무조건 들어야 하는 3개 (사고, 컴퓨팅, 알고리즘)
      choice_list: [String]  // 둘 중 하나만 들으면 되는 그룹 (영어 or 수학)
    },
    // 2. 핵심역량 (2개 영역)
    core_competency: {
      area_count: { type: Number, default: 2 }
    },
    // 3. 균형교양 (3개 영역, 공학 제외)
    balanced: {
      area_count: { type: Number, default: 3 },
      excluded_areas: [String]
    }
  }
});

module.exports = mongoose.model('Rule', ruleSchema);