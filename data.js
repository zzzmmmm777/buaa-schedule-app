/* 2026-2027 学年秋季学期内置数据（来源：北航校历 + 个人课表 Excel） */

const SEMESTER = {
  name: '2026—2027学年秋季学期',
  startMonday: '2026-09-07', // 第1周周一
  totalWeeks: 19,
  examWeeks: [18, 19], // 考试周
};

// 教学作息时间表（节次 -> 起止时间）
const PERIODS = [
  { n: 1,  start: '08:00', end: '08:45' },
  { n: 2,  start: '08:50', end: '09:35' },
  { n: 3,  start: '09:50', end: '10:35' },
  { n: 4,  start: '10:40', end: '11:25' },
  { n: 5,  start: '11:30', end: '12:15' },
  { n: 6,  start: '14:00', end: '14:45' },
  { n: 7,  start: '14:50', end: '15:35' },
  { n: 8,  start: '15:50', end: '16:35' },
  { n: 9,  start: '16:40', end: '17:25' },
  { n: 10, start: '17:30', end: '18:15' },
  { n: 11, start: '19:00', end: '19:45' },
  { n: 12, start: '19:50', end: '20:35' },
  { n: 13, start: '20:40', end: '21:25' },
  { n: 14, start: '21:30', end: '22:15' },
];

// 法定节假日（v1 手工维护）
const HOLIDAYS = {
  '2026-09-25': '中秋节',
  '2026-10-01': '国庆节',
  '2026-10-02': '国庆节',
  '2026-10-03': '国庆节',
  '2026-10-04': '国庆节',
  '2026-10-05': '国庆节',
  '2026-10-06': '国庆节',
  '2026-10-07': '国庆节',
  '2027-01-01': '元旦',
  '2027-01-02': '元旦',
  '2027-01-03': '元旦',
};

// 课表（day: 1=周一 ... 7=周日；weeks: [起, 止] 周次闭区间）
const COURSES = [
  { day: 1, start: 1,  end: 1,  name: '综合法语实训(1)', teacher: 'LAURENT Laure MarieVictoria', loc: '教学一号楼B1001', weeks: [2, 17] },
  { day: 1, start: 6,  end: 7,  name: '综合法语(1)',     teacher: 'David Xavier Boudon',         loc: '教学一号楼5006',  weeks: [2, 17] },
  { day: 1, start: 8,  end: 9,  name: '体育(1)',         teacher: '贾金赛',                      loc: '杭州田径场',      weeks: [2, 17] },
  { day: 2, start: 1,  end: 2,  name: '数学基础',        teacher: '蔡毓麟',                      loc: '科研一号楼1040',  weeks: [2, 17] },
  { day: 2, start: 3,  end: 4,  name: '基础英语(1)',     teacher: '张乐兴',                      loc: '教学二号楼4004',  weeks: [2, 17] },
  { day: 2, start: 6,  end: 7,  name: '综合法语(1)',     teacher: 'David Xavier Boudon',         loc: '教学一号楼5006',  weeks: [2, 17] },
  { day: 2, start: 8,  end: 9,  name: '工程化学基础',    teacher: '唐珊珊',                      loc: '科研一号楼1043',  weeks: [2, 15] },
  { day: 3, start: 1,  end: 2,  name: '综合法语实训(1)', teacher: 'David Xavier Boudon',         loc: '教学一号楼4007',  weeks: [2, 17] },
  { day: 3, start: 3,  end: 4,  name: '综合法语(1)',     teacher: '夏雯',                        loc: '教学二号楼5005',  weeks: [2, 17] },
  { day: 4, start: 3,  end: 5,  name: '大学计算机基础',  teacher: '王歆',                        loc: '教学二号楼2003',  weeks: [2, 9]  },
  { day: 4, start: 6,  end: 9,  name: '习近平新时代中国特色社会主义思想概论', teacher: '董卓宁', loc: '科研一号楼1040',  weeks: [3, 3]  },
  { day: 4, start: 11, end: 12, name: '综合法语(1)',     teacher: '夏雯',                        loc: '教学二号楼5005',  weeks: [2, 17] },
  { day: 5, start: 3,  end: 4,  name: '航空航天概论A',   teacher: '贾玉红',                      loc: '教学一号楼2004',  weeks: [2, 17] },
];
