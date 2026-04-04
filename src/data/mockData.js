export const mockTestCases = {
  '공통TC': [
    {
      no: 1, tc_id: 'TC-COM-LOGIN-0001', depth1: '공통', depth2: '로그인', depth3: '로그인화면', depth4: '',
      scenario: '업무시스템 접속', priority: 'P1', precondition: '', procedure: '1. 리파인 업무시스템 접속',
      expected: '1. 로그인 화면이 노출됨', comment: '', result: 'N/A', tester: '', date: '', type: 'COM', defect_id: ''
    },
    {
      no: 2, tc_id: 'TC-COM-LOGIN-0002', depth1: '공통', depth2: '로그인', depth3: '로그인화면', depth4: '',
      scenario: '정상 로그인', priority: 'P1', precondition: '미로그인', procedure: '1. 유효 ID/PW 입력\n2. 로그인 버튼 클릭',
      expected: '1. 권한에 맞는 메인 화면으로 이동', comment: '빠른 응답속도 요망', result: 'Pass', tester: '홍길동', date: '2023-10-24', type: 'COM', defect_id: ''
    },
    {
      no: 3, tc_id: 'TC-COM-LOGIN-0004', depth1: '공통', depth2: '로그인', depth3: '로그인화면', depth4: '',
      scenario: 'ID 미입력 로그인 시도', priority: 'P2', precondition: '미로그인', procedure: '1. ID/PW 미입력\n2. 로그인 버튼 클릭',
      expected: '1. 팝업 안내 문구 노출', comment: '', result: 'Fail', tester: '김철수', date: '2023-10-24', type: 'COM', defect_id: 'DEF-001'
    }
  ],
  'JEONSE': [
    {
      no: 1, tc_id: 'TC-BIZ-JEONSE-0001', depth1: '전세', depth2: '리스트', depth3: '', depth4: '',
      scenario: '리스트 노출 화면 확인', priority: 'P1', precondition: '', procedure: '1. 전세 업무화면 진입',
      expected: '1. 정상적인 리스트 표출', comment: '', result: 'Pass', tester: '이영희', date: '2023-10-25', type: 'BIZ', defect_id: ''
    }
  ],
  'SEARCH': [
    {
      no: 1, tc_id: 'TC-SRC-0001', depth1: '통합업무검색', depth2: '기본검색', depth3: '', depth4: '',
      scenario: '검색어 없이 조회', priority: 'P2', precondition: '', procedure: '1. 조회 버튼 클릭',
      expected: '1. 검색어 입력 안내 메시지 표출', comment: '', result: 'Pass', tester: '박영수', date: '2023-10-25', type: 'BIZ', defect_id: ''
    }
  ]
};
