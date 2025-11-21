require('dotenv').config();
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const readline = require('readline');
const Rule = require('./models/Rule');
const Course = require('./models/Course');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🔐 몽고디비 연결 성공'))
  .catch(err => console.log('연결 실패:', err));

const rl = readline.createInterface({
  input: process.stdin, output: process.stdout
});

console.log("\n🎓 상명대 졸업요건 검사기를 시작합니다.");
rl.question('1️⃣  학번 입력 (예: 2023) : ', (year) => {
  rl.question('2️⃣  학과 입력 (예: 소프트웨어학과) : ', (major) => {
    rl.question('3️⃣  과정 선택 (1:심화, 2:다전공, 3:부전공) : ', (track) => {
      let mode = "intensive"; let tName = "심화전공";
      if(track==="2") { mode="multi"; tName="다전공"; }
      else if(track==="3") { mode="minor"; tName="부전공"; }
      
      checkGraduation(parseInt(year), major.trim(), mode, tName);
      rl.close();
    });
  });
});

async function checkGraduation(entryYear, majorName, trackMode, trackName) {
  try {
    const workbook = xlsx.readFile('test_score.xlsx'); 
    const userData = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]); 
    const myCodes = userData.map(row => row['학수번호']);
    
    // DB에서 과목 정보 조회
    const dbCourses = await Course.find({ course_code: { $in: myCodes } });
    const courseMap = {};
    dbCourses.forEach(c => { courseMap[c.course_code] = c; });

    // 변수 초기화
    let myDeep = 0, myElec = 0;
    let totalGeneralCredit = 0; // 교양 총 학점 (기초+핵심+균형+일반)
    
    let coreAreas = new Set();  // 핵심역량
    let balAreas = new Set();   // 균형교양

    const rule = await Rule.findOne({ entry_year: entryYear, dept_name: majorName });
    if (!rule) { console.log("❌ 규칙 데이터 없음"); process.exit(); }
    
    const excluded = rule.general.balanced.excluded_areas || [];

    // 성적표 분석
    userData.forEach(row => {
      const code = row['학수번호'];
      const type = row['이수구분']; 
      const credit = row['학점'];
      const dbInfo = courseMap[code];
      const area = dbInfo ? dbInfo.area : ""; 

      // 전공
      if (type && type.includes('전심')) myDeep += credit;
      else if (type && type.includes('전선')) myElec += credit;
      
      // 교양 (이수구분 상관없이 영역으로 판단 + 교양 총점 계산)
      if (type && (type.includes('교필') || type.includes('교선') || type.includes('일선') || type.includes('교양'))) {
          totalGeneralCredit += credit;

          // 핵심역량 체크
          if (area && (area.includes("역량") || area.includes("전문") || area.includes("창의") || area.includes("융복합") || area.includes("다양성") || area.includes("윤리"))) {
             coreAreas.add(area);
          }
          // 균형교양 체크 (공학 제외)
          if (area && (area==="인문"||area==="사회"||area==="자연"||area==="예술"||area==="공학"||area==="브리지")) {
              if (!excluded.includes(area)) {
                 balAreas.add(area);
              }
          }
      }
    });

    const myTotalMajor = myDeep + myElec;

    console.log('=======================================');
    console.log(`🎓 졸업 심사 결과 (${entryYear}학번 ${trackName})`);
    console.log('=======================================');

    // [1] 전공 심사
    const mRule = rule.major_tracks[trackMode];
    if (trackMode === "intensive") {
        const p1 = myDeep >= mRule.deep_credit;
        const p2 = myElec >= mRule.elective_credit;
        console.log(`1️⃣  전공심화: ${p1?"✅ Pass":"🚨 Fail"} (${myDeep}/${mRule.deep_credit})`);
        console.log(`2️⃣  전공선택: ${p2?"✅ Pass":"🚨 Fail"} (${myElec}/${mRule.elective_credit})`);
    } else {
        const p = myTotalMajor >= mRule.total_credit;
        console.log(`1️⃣  전공이수: ${p?"✅ Pass":"🚨 Fail"} (${myTotalMajor}/${mRule.total_credit})`);
    }

    // [2] 기초교양 심사 (3필수 + 1택일)
    const fixedList = rule.general.basic.fixed_list;
    const choiceList = rule.general.basic.choice_list;

    // 고정 필수 체크
    const missingFixed = fixedList.filter(c => !myCodes.includes(c));
    // 선택 필수 체크 (하나라도 들었으면 OK)
    const takenChoice = choiceList.some(c => myCodes.includes(c));

    if (missingFixed.length === 0 && takenChoice) {
        console.log(`3️⃣  기초교양: ✅ Pass (4과목 충족)`);
    } else {
        console.log(`3️⃣  기초교양: 🚨 Fail`);
        if(missingFixed.length > 0) console.log(`    ❌ 고정필수 미이수: ${missingFixed.join(', ')}`);
        if(!takenChoice) console.log(`    ❌ 선택필수 미이수: 영어 또는 기초수학 중 1개 필수`);
    }

    // [3] 핵심역량
    const reqCore = rule.general.core_competency.area_count;
    if (coreAreas.size >= reqCore) {
        console.log(`4️⃣  핵심역량: ✅ Pass (${coreAreas.size}/${reqCore} 영역)`);
        console.log(`    - 이수: [${Array.from(coreAreas).join(', ')}]`);
    } else {
        console.log(`4️⃣  핵심역량: 🚨 Fail (${coreAreas.size}/${reqCore} 영역)`);
        console.log(`    - 현재: [${Array.from(coreAreas).join(', ')}]`);
    }

    // [4] 균형교양 (★ 여기가 중요)
    const reqBal = rule.general.balanced.area_count;
    if (balAreas.size >= reqBal) {
        console.log(`5️⃣  균형교양: ✅ Pass (${balAreas.size}/${reqBal} 영역)`);
        console.log(`    - 이수: [${Array.from(balAreas).join(', ')}]`);
    } else {
        console.log(`5️⃣  균형교양: 🚨 Fail (${balAreas.size}/${reqBal} 영역)`);
        console.log(`    - 현재: [${Array.from(balAreas).join(', ')}]`);
        console.log(`    - (※ 공학 영역은 인정되지 않습니다)`);
    }

    // [5] 교양 총 학점 (33점)
    const reqGenTotal = rule.general.total_credit;
    if (totalGeneralCredit >= reqGenTotal) {
        console.log(`6️⃣  교양총점: ✅ Pass (${totalGeneralCredit}/${reqGenTotal})`);
    } else {
        console.log(`6️⃣  교양총점: 🚨 Fail (${totalGeneralCredit}/${reqGenTotal})`);
    }

    console.log('=======================================');
    process.exit();

  } catch (e) { console.log(e); process.exit(); }
}