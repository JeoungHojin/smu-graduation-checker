const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  entry_year: { type: Number, required: true }, // 학번
  dept_name: { type: String, required: true },  // 학과
  
  // 전공 트랙별 학점 요건 (신버전)
  major_tracks: {
    // 1. 심화전공 (전심/전선 구분)
    intensive: {
      deep_credit: { type: Number, default: 15 },     // 전공심화 최소 학점
      elective_credit: { type: Number, default: 60 }, // 전공선택 최소 학점
    },
    
    // 2. 다전공 (총점 기준)
    multi: {
      total_credit: { type: Number, default: 45 } 
    },
    
    // 3. 부전공 (총점 기준)
    minor: {
      total_credit: { type: Number, default: 21 } 
    }
  },

  // 교양 요건
  general: {
    total_credit: { type: Number, default: 33 }
  }
});

module.exports = mongoose.model('Rule', ruleSchema);