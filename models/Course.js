const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  course_code: { type: String, required: true, unique: true }, 
  course_name: { type: String, required: true }, 
  type: { type: String, required: true },        
  credit: { type: Number, required: true },
  
  // ★ 새로 추가된 필드: 교양 영역 (예: "인문", "사회", "창의" 등)
  area: { type: String, default: "" } 
});

module.exports = mongoose.model('Course', courseSchema);