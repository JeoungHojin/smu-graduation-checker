require('dotenv').config();
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const readline = require('readline');
const Rule = require('./models/Rule');

// DB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🔐 몽고디비 연결 성공'))
  .catch(err => console.log('연결 실패:', err));

// 키보드 입력을 받기 위한 설정
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ★ 프로그램 시작: 질문 던지기
rl.question('🎓 본인의 학번(입학년도)을 입력해주세요 (예: 2023) : ', (answer) => {
  
  const studentId = parseInt(answer); // 입력받은 값을 숫자로 변환
  
  if (isNaN(studentId)) {
    console.log("❌ 숫자로 된 학번을 입력해주세요!");
    process.exit();
  }

  console.log(`\n🔍 [${studentId}학번] 기준으로 졸업 요건을 조회합니다...\n`);
  
  // 질문 끝났으니 채점 시작 함수 호출
  checkGraduation(studentId);
  rl.close();
});

async function checkGraduation(entryYear) {
  try {
    // 1. 엑셀 파일 읽기
    const workbook = xlsx.readFile('test_score.xlsx'); 
    const sheetName = workbook.SheetNames[0]; 
    const userData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]); 
    
    console.log(`📂 성적표 로딩 완료: 총 ${userData.length}개 과목`);

    // 2. 학점 계산기 (엑셀 데이터 100% 신뢰)
    let myDeepCredit = 0;     // 전공심화
    let myElectiveCredit = 0; // 전공선택

    userData.forEach(row => {
      const type = row['이수구분']; 
      const credit = row['학점'];   
      
      // '전심'이라는 글자가 포함되어 있으면
      if (type && type.includes('전심')) {
        myDeepCredit += credit;
      } 
      // '전선'이라는 글자가 포함되어 있으면
      else if (type && type.includes('전선')) {
        myElectiveCredit += credit;
      }
    });
    
    // 아까 여기서 끊겼던 부분입니다!
    const myTotalMajor = myDeepCredit + myElectiveCredit;

    console.log('---------------------------------------');
    console.log(`📊 [내 학점 정산 결과]`);
    console.log(`- 전공심화: ${myDeepCredit}학점`);
    console.log(`- 전공선택: ${myElectiveCredit}학점`);
    console.log(`- 전공합계: ${myTotalMajor}학점`);

    // 3. 사용자가 입력한 학번(entryYear)으로 DB 조회
    const rule = await Rule.findOne({ entry_year: entryYear, dept_name: "소프트웨어학과" });
    
    if (!rule) {
      console.log('---------------------------------------');
      console.log(`❌ 죄송합니다. DB에 [${entryYear}학번] 졸업 요건 데이터가 없습니다.`);
      console.log("👉 addRule23.js 등을 실행해서 데이터를 먼저 넣어주세요.");
      process.exit();
    }

    console.log('---------------------------------------');
    console.log(`🎓 졸업 심사 결과 (기준: ${entryYear}학번 심화전공)`);

    const needDeep = rule.major_tracks.intensive.deep_credit;      
    const needElective = rule.major_tracks.intensive.elective_credit; 

    // (1) 전공심화 체크
    if (myDeepCredit >= needDeep) {
      console.log(`✅ [전공심화] 합격! (${myDeepCredit} / ${needDeep})`);
    } else {
      console.log(`🚨 [전공심화] ${needDeep - myDeepCredit}학점 부족! (현재 ${myDeepCredit}학점)`);
    }

    // (2) 전공선택 체크
    if (myElectiveCredit >= needElective) {
      console.log(`✅ [전공선택] 합격! (${myElectiveCredit} / ${needElective})`);
    } else {
      console.log(`🚨 [전공선택] ${needElective - myElectiveCredit}학점 부족! (현재 ${myElectiveCredit}학점)`);
    }

    console.log('---------------------------------------');
    process.exit();

  } catch (error) {
    console.error("오류 발생:", error);
    process.exit();
  }
}