require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🔐 몽고디비 연결 성공'));

const allCourses = [
  // ==================================================
  // [1] 기초교양 (무조건 들어야 하는 4대장)
  // ==================================================
  { code: "HBLA5001", name: "사고와표현", area: "기초교양", credit: 3, type: "교필" }, 
  { code: "HBLA5210", name: "EnglishForAcademicPurposes", area: "기초교양", credit: 3, type: "교필" },
  { code: "HBLA5201", name: "컴퓨팅사고와데이터의이해", area: "기초교양", credit: 2, type: "교필" }, 
  { code: "HBLA5202", name: "알고리즘과게임콘텐츠", area: "기초교양", credit: 2, type: "교필" }, 

  // ==================================================
  // [2] 상명핵심역량교양 (5개 영역)
  // ==================================================
  // 전문지식탐구
  { code: "HBLB5070", name: "지식재산권법입문", area: "전문지식탐구역량", credit: 3, type: "교필" },
  { code: "HBLB5071", name: "빅히스토리와인공지능", area: "전문지식탐구역량", credit: 3, type: "교필" },
  { code: "HBLB5072", name: "이미지시대의테크놀로지와예술", area: "전문지식탐구역량", credit: 3, type: "교필" },
  // 창의적문제해결
  { code: "HBLB5060", name: "상상속의아이디어", area: "창의적문제해결역량", credit: 2, type: "교필" },
  { code: "HBLB5075", name: "컴퓨테이셔널씽킹", area: "창의적문제해결역량", credit: 2, type: "교필" },
  { code: "HBLB5076", name: "창의적문제해결", area: "창의적문제해결역량", credit: 2, type: "교필" },
  { code: "HBLD5031", name: "창의적디자인상상", area: "창의적문제해결역량", credit: 3, type: "교필" },
  // 융복합
  { code: "HBLA5052", name: "융합창의수학", area: "융복합역량", credit: 2, type: "교필" },
  { code: "HBLB5080", name: "K-culture와예술산업", area: "융복합역량", credit: 3, type: "교필" },
  { code: "HBLD0051", name: "색채심리학", area: "융복합역량", credit: 3, type: "교필" },
  { code: "HBLD5009", name: "영화속의건축여행", area: "융복합역량", credit: 3, type: "교필" },
  // 다양성존중
  { code: "HBLA0272", name: "문화다양성과미디어", area: "다양성존중역량", credit: 3, type: "교필" },
  { code: "HBLA5060", name: "다른곳의세계와나", area: "다양성존중역량", credit: 2, type: "교필" },
  { code: "HBLB5058", name: "문화감수성의이해와실천", area: "다양성존중역량", credit: 3, type: "교필" },
  { code: "HBLB5085", name: "치유와공간", area: "다양성존중역량", credit: 2, type: "교필" },
  // 윤리실천
  { code: "HBLA5063", name: "호모엠파티쿠스", area: "윤리실천역량", credit: 2, type: "교필" },
  { code: "HBLB5090", name: "상명정신과윤리적삶", area: "윤리실천역량", credit: 2, type: "교필" },
  { code: "HBLG2017", name: "과학기술자의직업윤리", area: "윤리실천역량", credit: 3, type: "교필" },

  // ==================================================
  // [3] 균형교양 (★ NEW! 보내주신 데이터 반영)
  // ==================================================
  // 인문
  { code: "HBLA0340", name: "TOEFL I", area: "인문", credit: 2, type: "교선" },
  { code: "HBLA0343", name: "TOEFL II", area: "인문", credit: 2, type: "교선" },
  { code: "HBLA0364", name: "협력적의사소통", area: "인문", credit: 3, type: "교선" },
  { code: "HBLA5004", name: "AI시대의호모로렌스", area: "인문", credit: 3, type: "교선" },
  { code: "HBLA5008", name: "언어와사회", area: "인문", credit: 3, type: "교선" },
  { code: "HBLA5021", name: "문학과삶의철학", area: "인문", credit: 3, type: "교선" },
  { code: "HBLA5022", name: "한국고전명저읽기", area: "인문", credit: 3, type: "교선" },
  { code: "HBLA5053", name: "인간사랑의이해", area: "인문", credit: 2, type: "교선" },
  { code: "HBLA5059", name: "명작속의캐릭터와공감인문학", area: "인문", credit: 2, type: "교선" },
  { code: "HBLA5204", name: "융복합시대의사유와물음", area: "인문", credit: 3, type: "교선" },
  { code: "HBLG1007", name: "상상력과문학", area: "인문", credit: 3, type: "교선" },
  { code: "HBLG9040", name: "인물로보는역사", area: "인문", credit: 3, type: "교선" },
  { code: "HBLR5003", name: "세계신화의이해", area: "인문", credit: 3, type: "교선" },
  // 사회
  { code: "HBLA5035", name: "현대사회와윤리", area: "사회", credit: 2, type: "교선" },
  { code: "HBLB1036", name: "생활과경제", area: "사회", credit: 3, type: "교선" },
  { code: "HBLB5002", name: "국제사회와정치", area: "사회", credit: 3, type: "교선" },
  { code: "HBLB5032", name: "경영학개론", area: "사회", credit: 3, type: "교선" },
  { code: "HBLG1009", name: "법학의세계", area: "사회", credit: 3, type: "교선" },
  { code: "HBLG2015", name: "문화사회학", area: "사회", credit: 3, type: "교선" },
  { code: "HBLG9042", name: "쉽고재미있는교육입문", area: "사회", credit: 3, type: "교선" },
  { code: "HBLB5093", name: "문화콘텐츠기반지속가능한미래...", area: "사회", credit: 3, type: "교선" },
  { code: "HBLF7828", name: "지역사회와리빙랩", area: "사회", credit: 3, type: "교선" },
  // 자연
  { code: "HBLB5061", name: "수학의길잡이", area: "자연", credit: 3, type: "교선" },
  { code: "HBLC5003", name: "생명과학의이해", area: "자연", credit: 3, type: "교선" },
  { code: "HBLC5046", name: "재미있는화학이야기", area: "자연", credit: 3, type: "교선" },
  // 공학 (소프트웨어학과는 인정 X, 하지만 DB엔 있어야 함)
  { code: "HBLB5059", name: "빅데이터와소셜마케팅", area: "공학", credit: 3, type: "교선" },
  { code: "HBLC1003", name: "컴퓨터와정보사회", area: "공학", credit: 3, type: "교선" },
  { code: "HBLC5044", name: "유비쿼터스컴퓨팅과미래사회", area: "공학", credit: 3, type: "교선" },
  { code: "HBLC5049", name: "영화속의과학", area: "공학", credit: 3, type: "교선" },
  { code: "HBLC5061", name: "코딩기초", area: "공학", credit: 2, type: "교선" },
  { code: "HBLG2021", name: "디지털리터러시", area: "공학", credit: 3, type: "교선" },
  { code: "HBLF7815", name: "미래사회와디지털기술", area: "공학", credit: 3, type: "교선" },
  { code: "HBLA5070", name: "IT트렌드와이슈", area: "공학", credit: 3, type: "교선" },
  { code: "HBLA5071", name: "모바일비즈니스와앱", area: "공학", credit: 3, type: "교선" },
  // 예술
  { code: "HBLD0072", name: "영화와사회", area: "예술", credit: 3, type: "교선" },
  { code: "HBLD0081", name: "연극의이해", area: "예술", credit: 3, type: "교선" },
  { code: "HBLD5034", name: "현대미술의이해", area: "예술", credit: 3, type: "교선" },
  { code: "HBLD5040", name: "예술세계의탐구", area: "예술", credit: 3, type: "교선" },
  { code: "HBLD5041", name: "음악의세계", area: "예술", credit: 3, type: "교선" },
  { code: "HBLD5055", name: "지역문화예술콘텐츠개발", area: "예술", credit: 3, type: "교선" },
  { code: "HBLB1025", name: "디자인과생활", area: "예술", credit: 3, type: "교선" },
  { code: "HBLD5042", name: "교향곡의이해", area: "예술", credit: 3, type: "교선" },
  { code: "HBLD5056", name: "소설디자인랩", area: "예술", credit: 3, type: "교선" },
  { code: "HBLB5020", name: "현대사회와공간", area: "예술", credit: 3, type: "교선" },
  { code: "HBLD1020", name: "사진과사회학", area: "예술", credit: 3, type: "교선" },
  { code: "HBLD5023", name: "애니메이션의감상과이해", area: "예술", credit: 3, type: "교선" },
  { code: "HBLF7818", name: "현대미술사와이론", area: "예술", credit: 3, type: "교선" },
  { code: "HBLF7825", name: "우리없는세계포스트휴먼되기", area: "예술", credit: 3, type: "교선" },
  // 브리지 (Bridge)
  { code: "HBLA5065", name: "문학과문화콘텐츠", area: "브리지", credit: 3, type: "교선" },
  { code: "HBLA5041", name: "문명속의수학", area: "브리지", credit: 2, type: "교선" },
  { code: "HBLD5060", name: "뉴스와리터러시", area: "브리지", credit: 3, type: "교선" },
  { code: "HBLD5061", name: "중국대중문화와융합산업", area: "브리지", credit: 3, type: "교선" },
  { code: "HBLD5062", name: "다문화사회와지속가능한도시", area: "브리지", credit: 3, type: "교선" },
  { code: "HBLD5063", name: "SF콘텐츠와사회문화의관계", area: "브리지", credit: 3, type: "교선" },
  { code: "HBLD5064", name: "게임&메타버스콘텐츠이해", area: "브리지", credit: 3, type: "교선" },
  { code: "HBLD5065", name: "인공지능시대의컬처테크", area: "브리지", credit: 3, type: "교선" },
  { code: "HBLF7826", name: "AI시대의컬처리터러시", area: "브리지", credit: 3, type: "교선" },
  { code: "HBLF7827", name: "스타트업제품디자인", area: "브리지", credit: 3, type: "교선" },
  { code: "HBLG2048", name: "영상으로보는국제개발협력이슈", area: "브리지", credit: 3, type: "교선" },
  { code: "HBLF7829", name: "생성형AI와텍스트리터러시", area: "브리지", credit: 3, type: "교선" },
];

async function updateAreas() {
  console.log("⏳ 기초/핵심/균형 교양 데이터 통합 업데이트 중...");

  const operations = allCourses.map(item => ({
    updateOne: {
      filter: { course_code: item.code },
      update: { 
        $set: { 
          area: item.area,
          course_name: item.name, 
          type: item.type, 
          credit: item.credit 
        } 
      },
      upsert: true // 없는 과목은 새로 만든다! (가장 중요)
    }
  }));

  try {
    const result = await Course.bulkWrite(operations);
    console.log(`✅ 업데이트 완료!`);
    console.log(`- 수정/추가된 과목 수: ${result.upsertedCount + result.matchedCount}개`);
  } catch (err) {
    console.log("❌ 오류 발생:", err);
  }
  process.exit();
}

updateAreas();