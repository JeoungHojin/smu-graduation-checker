require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const xlsx = require('xlsx'); // <-- 서버에선 엑셀 안 읽음 (리액트가 읽어서 줌)
const Rule = require('./models/Rule');
const Course = require('./models/Course');

const app = express();
const port = 5000;

// 데이터 용량 제한 늘리기 (성적표 데이터가 많을 수 있으므로)
app.use(cors());
app.use(express.json({ limit: '50mb' })); 

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🔐 Server: 몽고디비 연결 성공'))
  .catch(err => console.log('Server: DB 연결 실패', err));

app.post('/api/check', async (req, res) => {
  try {
    // ★ 변경점: 엑셀 파일 읽기가 사라지고, req.body에서 데이터를 직접 받음
    // courseList: 사용자가 업로드한 성적표 데이터(JSON)
    const { entryYear, majorName, trackMode, courseList } = req.body; 
    
    console.log(`📥 요청 수신: ${entryYear}학번 / ${majorName} / ${trackMode}`);
    console.log(`📄 과목 데이터: ${courseList.length}개 수신함`);

    const userData = courseList; // 리액트가 준 걸 그대로 씀
    
    // --- (이 아래 로직은 아까와 100% 동일) ---
    const myCodes = userData.map(row => row['학수번호']);
    const dbCourses = await Course.find({ course_code: { $in: myCodes } });
    const courseMap = {};
    dbCourses.forEach(c => { courseMap[c.course_code] = c; });

    let myDeep = 0, myElec = 0;
    let gyopilCredit = 0, gyoseonCredit = 0;
    let totalGeneralCredit = 0;
    let coreAreas = new Set();
    let balAreas = new Set();
    let balCredit = 0;

    const rule = await Rule.findOne({ entry_year: entryYear, dept_name: majorName });
    if (!rule) {
      return res.status(404).json({ message: "해당 학번의 졸업 요건 데이터가 없습니다." });
    }
    const excluded = rule.general.balanced.excluded_areas || [];

    userData.forEach(row => {
      const code = row['학수번호'];
      const type = row['이수구분']; 
      const credit = Number(row['학점']); // 숫자로 변환 안전장치
      const dbInfo = courseMap[code];
      const area = dbInfo ? dbInfo.area : ""; 

      // 전공
      if (type && type.includes('전심')) myDeep += credit;
      else if (type && type.includes('전선')) myElec += credit;
      
      // 교양
      if (type && (type.includes('교필') || type.includes('교선') || type.includes('일선') || type.includes('교양'))) {
          totalGeneralCredit += credit;
          
          if (area && (area.includes("역량") || area.includes("전문") || area.includes("창의") || area.includes("융복합") || area.includes("다양성") || area.includes("윤리"))) {
             gyopilCredit += credit;
             coreAreas.add(area);
          }
          if (area && (area==="인문"||area==="사회"||area==="자연"||area==="예술"||area==="공학"||area==="브리지")) {
              if (!excluded.includes(area)) {
                 gyoseonCredit += credit;
                 balAreas.add(area);
                 balCredit += credit;
              }
          }
      }
      // 기초교양 학점 합산
      if (type && type.includes('교필') && area && area.includes('기초')) {
          gyopilCredit += credit;
      }
    });

    const myTotalMajor = myDeep + myElec;

    // 결과 포장 (JSON)
    const result = {
      summary: { year: entryYear, major: majorName, track: trackMode },
      score: {
        major_deep: myDeep,
        major_elec: myElec,
        general_req: gyopilCredit,
        general_bal: gyoseonCredit,
        total_general: totalGeneralCredit
      },
      pass_status: {}
    };

    const mRule = rule.major_tracks[trackMode];
    const genRule = rule.general;

    // 판정 로직
    if (trackMode === "intensive") {
        result.pass_status.major_deep = myDeep >= mRule.deep_credit;
        result.pass_status.major_elec = myElec >= mRule.elective_credit;
    } else {
        result.pass_status.major_total = myTotalMajor >= mRule.total_credit;
    }

    const fixedList = genRule.basic.fixed_list;
    const choiceList = genRule.basic.choice_list;
    const missingFixed = fixedList.filter(c => !myCodes.includes(c));
    const takenChoice = choiceList.some(c => myCodes.includes(c));
    result.pass_status.basic = (missingFixed.length === 0 && takenChoice);
    result.missing_basic = missingFixed;

    result.pass_status.core = coreAreas.size >= genRule.core_competency.area_count;
    result.core_areas = Array.from(coreAreas);

    result.pass_status.balanced_area = balAreas.size >= genRule.balanced.area_count;
    result.pass_status.balanced_credit = balCredit >= genRule.balanced.credit;
    result.balanced_areas = Array.from(balAreas);

    result.pass_status.total_general = totalGeneralCredit >= genRule.total_credit;

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 에러 발생" });
  }
});

app.listen(port, () => {
  console.log(`🚀 서버가 http://localhost:${port} 에서 실행 중입니다!`);
});