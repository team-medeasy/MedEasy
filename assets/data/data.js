// data.js
import dayjs from 'dayjs';

// 시간 매핑에 시간값 추가 (정렬을 위한 숫자값 포함)
export const timeMapping = {
  MORNING: { label: '아침', time: '오전 8:00', sortValue: 800 },
  LUNCH: { label: '점심', time: '오후 12:30', sortValue: 1230 },
  DINNER: { label: '저녁', time: '오후 6:30', sortValue: 1830 },
  BEDTIME: { label: '자기 전', time: '오후 10:00', sortValue: 2200 }
};

// 병원 시간을 숫자값으로 변환하는 함수
export const getTimeValue = (timeString) => {
  if (!timeString) return 0;
  
  const isPM = timeString.includes('오후');
  let [hour, minute] = timeString.replace('오전 ', '').replace('오후 ', '').split(':').map(Number);
  
  if (isPM && hour !== 12) hour += 12;
  return hour * 100 + minute;
};

// 약 복용 루틴 임시 데이터
export const initialMedicineRoutines = [
  {
    medicine_id: 3594,
    nickname: '아스피린',
    dose: 1,
    total_quantity: 30,
    day_of_weeks: [1, 2, 3],
    types: ['MORNING', 'LUNCH', 'DINNER', 'BEDTIME']
  },
  {
    medicine_id: 9876,
    nickname: '타이레놀',
    dose: 2,
    total_quantity: 20,
    day_of_weeks: [2, 4, 6],
    types: ['MORNING', 'DINNER']
  }
];

// 병원 방문 루틴 임시 데이터
export const initialHospitalRoutines = [
  {
    hospital_id: 1001,
    name: '한성대병원 외래 진료',
    time: 'MORNING',
    specific_time: '오전 10:30',
    sortValue: 1030,
    day_of_weeks: [1, 3, 5]
  },
  {
    hospital_id: 1002,
    name: '연세세브란스병원',
    time: 'AFTERNOON',
    specific_time: '오후 2:00',
    sortValue: 1400,
    day_of_weeks: [2, 4]
  },
  {
    hospital_id: 1003,
    name: '고려대학병원',
    time: 'MORNING',
    specific_time: '오전 11:00',
    sortValue: 1100,
    day_of_weeks: [3, 6]
  }
];

// 요일 배열
export const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

// 현재 날짜 및 주간 날짜 생성 함수
export const getWeekDays = () => {
  const today = dayjs();
  
  return Array.from({ length: 7 }, (_, i) => {
    const date = today.startOf('week').add(i, 'day');
    return {
      day: weekDays[date.day()],
      date: date.date(),
      month: date.month() + 1,
      year: date.year(),
      fullDate: date,
      isToday: date.date() === today.date() &&
        date.month() === today.month() &&
        date.year() === today.year()
    };
  });
};

// 약 dummyData
export const dummyMedicineData = [
  {
    item_name: '지엘타이밍정(카페인무수물)',
    item_seq: '196500051',
    entp_name: '지엘파마(주)',
    entp_seq: '19650018',
    item_image:
      'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/1NAT_bwbZd9',
    class_name: '각성제',
    etc_otc_name: '일반의약품',
    chart: '노란색의 팔각형 정제',
    print_front: '마크',
    print_back: 'T1E',
    drug_shape: '팔각형',
    color_class1: '노랑',
    color_class2: '',
    leng_long: '7.9',
    leng_short: '7.9',
    thick: '3.9',
    efcy_qesitm: 
      '졸음',
    use_method_qesitm:
      '성인은 1회 2~6정(100~300 mg)씩, 1일 1~3회 복용합니다.연령, 증상에 따라 적절히 증감할 수 있습니다.',
    atpn_qesitm:
      '갈락토오스 불내성, Lapp 유당분해효소 결핍증 또는 포도당-갈락토오스 흡수장애 등의 유전적인 문제가 있는 환자는 이 약을 복용하지 마십시오.이 약을 복용하기 전에 임부 또는 임신하고 있을 가능성이 있는 여성 및 수유부, 고령자, 위궤양 환자 또는 경험자, 심질환, 녹내장 환자는 의사 또는 약사와 상의하십시오.',
    intrc_qesitm: 
      '',
    se_qesitm:
      '만성 녹내장을 악화시킬 경우 복용을 즉각 중지하고 의사 또는 약사와 상의하십시오.',
    deposit_method_qesitm:
      '실온에서 보관하십시오.어린이의 손이 닿지 않는 곳에 보관하십시오.',
  },
  {
    item_name: '베스타제당의정',
    item_seq: '196600012',
    entp_name: '동아제약(주)',
    entp_seq: '20133156',
    item_image:
      'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/1MoApPycZgS',
    class_name: '건위소화제',
    etc_otc_name: '일반의약품',
    chart: '분홍색의 원형 당의정이다.',
    print_front: 'BSS',
    print_back: '',
    drug_shape: '원형',
    color_class1: '분홍',
    color_class2: '',
    leng_long: '11.6',
    leng_short: '11.6',
    thick: '4.9',
    efcy_qesitm: 
      '이 약은 소화불량, 식욕감퇴(식욕부진), 과식, 식체(위체), 소화촉진, 소화불량으로 인한 위부팽만감에 사용합니다.',
    use_method_qesitm:
      '성인은 1회 2정, 11~14세는 1회 1~2정, 8~10세는 1회 1정을 1일 3회 식후에 복용합니다.',
    atpn_qesitm:
      '7세 미만의 영·유아, 갈락토오스 불내성, Lapp 유당분해효소 결핍증 또는 포도당-갈락토오스 흡수장애 등의 유전적인 문제가 있는 환자는 이 약을 복용하지 마십시오.정해진 용법과 용량을 잘 지키십시오.어린이에게 투여할 경우 보호자의 지도 감독하에 투여하십시오.',
    intrc_qesitm: 
      '',
    se_qesitm:
      '',
    deposit_method_qesitm:
      '습기와 빛을 피해 실온에서 보관하십시오.어린이의 손이 닿지 않는 곳에 보관하십시오.',
  },
  {
    item_name: '아네모정',
    item_seq: '195900043',
    entp_name: '삼진제약(주)',
    entp_seq: '19560011',
    item_image:
      'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/152035092098000085',
    class_name: '제산제',
    etc_otc_name: '일반의약품',
    chart: '백색의 원형필름제',
    print_front: 'SJΛ',
    print_back: '',
    drug_shape: '원형',
    color_class1: '하양',
    color_class2: '',
    leng_long: '11',
    leng_short: '11',
    thick: '4.9',
    efcy_qesitm: 
      '이 약은 위산과다, 속쓰림, 위부불쾌감, 위부팽만감, 체함, 구역, 구토, 위통, 신트림에 사용합니다.',
    use_method_qesitm:
      '성인 1회 2정, 1일 3회 식간(식사와 식사때 사이) 및 취침시에 복용합니다.',
    atpn_qesitm:
      '투석요법을 받고 있는 환자, 수유부, 만 7세 이하의 어린이, 갈락토오스 불내성, Lapp 유당분해효소 결핍증 또는 포도당-갈락토오스 흡수장애 등의 유전적인 문제가 있는 환자는 이 약을 복용하지 마십시오.이 약을 복용하기 전에 이 약에 과민증 환자, 알레르기 체질, 알레르기 증상(발진, 충혈되어 붉어짐, 가려움 등) 경험자, 신장장애 환자, 임부 또는 임신하고 있을 가능성이 있는 여성, 나트륨 제한 식이를 하는 사람은 의사 또는 약사와 상의하십시오.정해진 용법과 용량을 잘 지키십시오.',
    intrc_qesitm: 
      '위장진통ㆍ진경제, 테트라사이클린계 항생제와 함께 복용하지 마십시오.',
    se_qesitm:
      '발진, 충혈되어 붉어짐, 가려움, 드물게 입이 마르는 증상, 변비 또는 설사 등이 나타나는 경우 복용을 즉각 중지하고 의사 또는 약사와 상의하십시오.',
    deposit_method_qesitm:
      '습기와 빛을 피해 보관하십시오.어린이의 손이 닿지 않는 곳에 보관하십시오.',
  },
  {
    item_name: '에바치온캡슐(글루타티온)',
    item_seq: '199202273',
    entp_name: '조아제약(주)',
    entp_seq: '19640007',
    item_image:
      'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/151577167067000087',
    class_name: '해독제',
    etc_otc_name: '일반의약품',
    chart: '흰색～회백색의 가루가 든 상 농황색 하 농황색의 경질캡슐제',
    print_front: 'CHO-A EVA',
    print_back: '',
    drug_shape: '장방형',
    color_class1: '노랑',
    color_class2: '노랑',
    leng_long: '19.10',
    leng_short: '6.63',
    thick: '6.91',
    efcy_qesitm: 
      '이 약은 약물중독에 사용합니다.',
    use_method_qesitm:
      '성인은 1회 1~2캡슐(50~100 mg), 1일 1~3회 복용합니다. 연령, 증상에 따라 적절히 증감할 수 있습니다.',
    atpn_qesitm:
      'Lapp 유당분해효소 결핍증 또는 포도당-갈락토오스 흡수장애 등의 유전적인 문제가 있는 환자는 이 약을 복용하지 마십시오.',
    intrc_qesitm: 
      '',
    se_qesitm:
      '드물게 발진, 식욕부진, 구역, 구토, 위통 등이 나타나는 경우 복용을 즉각 중지하고 의사 또는 약사와 상의하십시오.',
    deposit_method_qesitm:
      '실온에서 보관하십시오. 어린이의 손이 닿지 않는 곳에 보관하십시오.',
  },
  {
    item_name: '삐콤정',
    item_seq: '196200034',
    entp_name: '(주)유한양행',
    entp_seq: '19560004',
    item_image:
      'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/153495248483300010',
    class_name: '혼합비타민제',
    etc_otc_name: '일반의약품',
    chart: '적갈색의 원형 필름코팅정',
    print_front: 'YH',
    print_back: 'B',
    drug_shape: '원형',
    color_class1: '갈색',
    color_class2: '',
    leng_long: '10.2',
    leng_short: '10.2',
    thick: '4.3',
    efcy_qesitm: 
      '이 약은 육체피로, 임신ㆍ수유기, 병중ㆍ병후의 체력 저하 시 비타민 B1, B2, B6, C의 보급에 사용합니다.',
    use_method_qesitm:
      '만 8세 이상 및 성인은 1회 1~3정씩, 1일 1회 복용합니다.',
    atpn_qesitm:
      '이 약에 과민증 환자, 만 3개월 이하의 젖먹이, 갈락토오스 불내성, Lapp 유당분해효소 결핍증 또는 포도당-갈락토오스 흡수장애 등의 유전적인 문제가 있는 환자는 이 약을 복용하지 마십시오.이 약을 복용하기 전에 고옥살산뇨증(요중에 과량의 수산염이 배설되는 상태), 임부 또는 임신하고 있을 가능성이 있는 여성 및 수유부, 미숙아, 유아, 통풍, 신장결석, 폴산이 부족한 환자는 의사 또는 약사와 상의하십시오.정해진 용법과 용량을 잘 지키십시오.어린이에게 투여할 경우 보호자의 지도 감독하에 투여하십시오.요를 황색으로 변하게 하여 임상검사치에 영향을 줄 수 있습니다.',
    intrc_qesitm: 
      '레보도파와 함께 복용하지 마십시오.',
    se_qesitm:
      '구역, 구토, 설사, 묽은 변 등이 나타나는 경우 복용을 즉각 중지하고 의사 또는 약사와 상의하십시오.',
    deposit_method_qesitm:
      '습기와 빛을 피해 실온에서 보관하십시오.어린이의 손이 닿지 않는 곳에 보관하십시오.',
  },
  {
    item_name: '게루삼정',
    item_seq: '196400046',
    entp_name: '삼남제약(주)',
    entp_seq: '19550017',
    item_image:
      'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/154307400984500104',
    class_name: '제산제',
    etc_otc_name: '일반의약품',
    chart: '흰색의 원형정제',
    print_front: 'G',
    print_back: 'G',
    drug_shape: '원형',
    color_class1: '하양',
    color_class2: '',
    leng_long: '11.1',
    leng_short: '11.1',
    thick: '3.5',
    efcy_qesitm: 
      '이 약은 위산과다, 속쓰림, 위부불쾌감, 위부팽만감, 체함, 구역, 구토, 위통, 신트림에 사용합니다.',
    use_method_qesitm:
      '만 15세 이상 및 성인은 1회 2정, 만 8세 이상 15세 미만은 1회 1정, 1일 3회 식간(식사때와 식사때 사이) 및 취침시 복용합니다.복용간격은 4시간 이상으로 합니다.',
    atpn_qesitm:
      '투석요법을 받고 있는 환자, 만 7세 이하의 어린이는 이 약을 복용하지 마십시오.이 약을 복용하기 전에 신장장애 환자, 나트륨 제한 식이를 하는 사람은 의사 또는 약사와 상의하십시오.정해진 용법과 용량을 잘 지키십시오.어린이에게 투여할 경우 보호자의 지도 감독하에 투여하십시오.',
    intrc_qesitm: 
      '테트라사이클린계 항생제와 함께 복용하지 마십시오.',
    se_qesitm:
      '변비, 설사 등이 나타나는 경우 복용을 즉각 중지하고 의사 또는 약사와 상의하십시오.',
    deposit_method_qesitm:
      '습기와 빛을 피해 실온에서 보관하십시오.어린이의 손이 닿지 않는 곳에 보관하십시오.',
  },
  {
    item_name: '페니라민정(클로르페니라민말레산염)',
    item_seq: '196000011',
    entp_name: '지엘파마(주)',
    entp_seq: '19560004',
    item_image:
      'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/1Orz9gcUHnw',
    class_name: '항히스타민제',
    etc_otc_name: '일반의약품',
    chart: '흰색～회백색의 가루가 든 상 농황색 하 농황색의 경질캡슐제',
    print_front: 'YH',
    print_back: '',
    drug_shape: '원형',
    color_class1: '노랑',
    color_class2: '',
    leng_long: '6.5',
    leng_short: '6.5',
    thick: '2.4',
    efcy_qesitm: 
      '이 약은 고초열(꽃가루 알레르기비염), 두드러기, 가려움성 피부질환(습진, 피부염, 피부가려움증, 약물발진), 알레르기 비염, 혈관운동성 코염, 코감기에 의한 재채기, 콧물, 기침, 혈관운동성 부기에 사용합니다.',
    use_method_qesitm:
      '성인은 1회 1~3정(2~6 mg)씩, 1일 2~4회 복용합니다. 1일 12정(24 mg)을 초과하지 마십시오.',
    atpn_qesitm:
      '이 약에 과민증 환자, 녹내장, 전립선비대 등 하부요로폐색(닫혀서 막힘)성 질환, 미숙아 및 신생아는 이 약을 복용하지 마십시오. 이 약을 복용하기 전에 3세 미만 유아, 임부 및 수유부, 고령자, 안내압(눈내부 압력)상승, 갑상샘기능항진, 협착(좁아짐)성소화성궤양 또는 유문십이지장 폐색(닫혀서 막힘), 순환계질환, 고혈압 등 심혈관계 질환, 기관지염, 기관지확장증 및 천식, 간질, 간질환, 뇌졸증, 중증(심한 증상) 관상동맥(심장동맥)부전, 발작 환자 또는 경험자는 의사 또는 약사와 상의하십시오. 이 약은 복용 후 졸음을 유발할 수 있으므로 운전 및 기계조작 시 주의하십시오.',
    intrc_qesitm: 
      '이 약을 복용하는 동안 MAO 억제제를 복용하지 마십시오. 알코올, 중추신경억제제, 페니토인을 함께 복용 시 의사 또는 약사와 상의하십시오.',
    se_qesitm:
      '청색증, 호흡곤란, 흉부불쾌감, 혈압저하, 경련, 착란, 재생불량성빈혈, 무과립구증, 발진, 햇빛 노출 시 피부 과민반응, 박리(벗겨짐)성 피부염, 두드러기, 연축(뒤당김/수축), 근허약, 협조불능, 진정, 졸음, 신경과민, 두통, 초조감, 복시(겹보임), 불면, 어지럼, 이명(귀울림), 전정장애(평형기능장애), 다행증(이상행복감), 정서불안, 히스테리, 진전(떨림), 신경염, 협조이상, 감각이상, 무시, 집중력감소, 권태감, 구갈(목마름), 가슴쓰림, 식욕부진, 소화불량, 구역, 구토, 복통(배아픔), 변비, 설사, 빈뇨, 배뇨곤란, 요폐(소변축적), 요저류(고임), 저혈압, 심계항진(두근거림), 빈맥(빠른맥), 부정맥, 기외수축(조기수축), 간염, 황달, 코 또는 기도의 건조, 기관분비액의 점성화, 천명(숨을 쌕쌕거림), 코막힘, 용혈성(적혈구 파괴성)빈혈, 혈소판감소, 간기능 장애, 오한(춥고 떨리는 증상), 발한(땀이 남)이상, 흉통(가슴통증), 피로감, 월경이상 등이 나타나는 경우 복용을 즉각 중지하고 의사 또는 약사와 상의하십시오.',
    deposit_method_qesitm:
      '실온에서 보관하십시오. 어린이의 손이 닿지 않는 곳에 보관하십시오.',
  },
]