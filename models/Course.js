const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  course_code: { type: String, required: true, unique: true }, 
  course_name: { type: String, required: true }, 
  type: { type: String, required: true },        
  credit: { type: Number, required: true }       
});

// ▼ 이 부분이 없으면 에러가 납니다! 꼭 확인하세요.
module.exports = mongoose.model('Course', courseSchema);