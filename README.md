# 💊 MedEasy
![Thumbnail](docs/thumbnail.png)


**MedEasy**는 노년층, 장애인 및 만성 질환 환자를 위한 **간편하고 안전한 복약 관리 앱**입니다.  
처방전에서 약 정보를 자동으로 등록하고, NFC 태그를 통해 복용 여부를 쉽게 체크할 수 있습니다. 또한 AI 기반 챗봇을 통해 약 정보를 빠르고 정확하게 제공하며, 알림 기능으로 규칙적인 복약을 도와줍니다.

---

## 📱 프로젝트 개요
| 항목 | 내용 |
|-------|-------|
| **목적** | 간편하고 안전한 복약 관리 시스템 구축 |
| **주요 대상** | 노년층, 장애인, 만성 질환 환자 |
| **개발 플랫폼** | 모바일 앱 (Android, iOS) |
| **개발 기간** | 2025년 2월 ~ 2025년 5월 |

---

## 🚀 주요 기능
- 📸 **처방전 촬영** → OCR을 통한 약 정보 자동 등록  
- 🔎 **공공 API 기반 검색** → 정확한 약 정보 제공  
- 📆 **복약 일정 관리** → 사용자 루틴 기반 일정 관리  
- 🛜 **NFC 태그 인식** → 복약 상태 실시간 체크  
- 🔔 **알림 기능** → 복약 시간 알림 및 누락 방지  
- 🤖 **제약 정보 챗봇** → AI 기반 약 정보 질의응답  

---

## 🏆 기획 배경
- **평균 수명 증가**와 함께 **노년층 및 만성 질환 환자**의 비율 증가  
- 복약 일정 관리 및 약 정보 접근의 어려움  
- 약 오남용 방지 및 복약 일정 관리를 통해 **환자의 안전성 강화**  

---

## 🏗️ 기술 스택
### 💻 **Frontend**
- ![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=white)  

### 🛠️ **Backend**
- ![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring&logoColor=white)  
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)  
- ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)  

### 🤖 **AI & Data Processing**
- ![Gemini](https://img.shields.io/badge/Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)  
- ![LangChain](https://img.shields.io/badge/LangChain-0055A5?style=for-the-badge)  
- ![Naver Clova OCR](https://img.shields.io/badge/Naver_Clova_OCR-03C75A?style=for-the-badge&logo=ncloud&logoColor=white)  

### ☁️ **Cloud & Infrastructure**
- ![Amazon ECR](https://img.shields.io/badge/Amazon_ECR-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white)  
- ![Google Compute Engine](https://img.shields.io/badge/Google_Compute_Engine-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)  

### 🚀 **Deployment & Version Control**
- ![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)  
- ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)  

---

## 🌟 주요 화면
| 주요 화면 | 설명 |
|-----------|-------|
| ![처방전 촬영](https://via.placeholder.com/300) | 처방전을 촬영하면 OCR을 통해 약 정보를 자동 등록 |
| ![복약 일정 관리](https://via.placeholder.com/300) | 사용자 맞춤 복약 일정 등록 및 관리 |
| ![NFC 태그 체크](https://via.placeholder.com/300) | NFC 태그를 통해 복약 상태 체크 가능 |

---

## 📋 ERD 설계
```mermaid
erDiagram
    USER {
        BIGINT id PK
        VARCHAR(150) email "이메일"
        VARCHAR(50) name "이름"
        VARCHAR(150) password "비밀번호"
        ENUM gender "성별"
        DATE registered_at "회원가입 날짜"
        TIMESTAMP logined_at "마지막 로그인 날짜"
        DATE birthday "생년월일"
        BIGINT nok_id "보호자 PK"
        TIME morning "아침 복용 시간"
        TIME lunch "점심 복용 시간"
        TIME dinner "저녁 복용 시간"
        TIME bed_time "취침전 복용 시간"
    }

    ROUTINE {
        BIGINT id PK
        BIGINT user_id FK
        BIGINT medicine_id FK
        VARCHAR(150) nickname "약 이름 또는 커스텀 이름"
        TIMESTAMP take_time "약 복용 날짜/시간"
        BOOL is_taken "복용 여부"
        VARCHAR(150) type "아침, 점심, 저녁, 기타"
    }

    MEDICINE {
        BIGINT id PK
        VARCHAR(50) item_code "약 시퀀스 코드"
        VARCHAR(100) entp_name "제약회사 이름"
        VARCHAR(100) item_name "약품 이름"
        TEXT efficacy "효능"
        TEXT use_method "사용법"
        TEXT attention "주의사항"
        TEXT interaction "다른 약과의 상호작용"
        TEXT side_effect "부작용"
        TEXT deposite_method "보관 방법"
        DATE updated_at "약 정보 업데이트 시간"
        VARCHAR(150) image_url "약 이미지 URL"
        VARCHAR(50) bizrno "비즈니스 번호"
        DATE open_at "공개일자"
    }

    NOTIFICATION {
        BIGINT id PK
        VARCHAR(150) title "알림 제목"
        VARCHAR(300) content "알림 내용"
        BOOL is_read "읽음 여부"
        DATE created_at "생성 날짜"
    }

    USER ||--|{ ROUTINE : "복용 루틴 관리"
    ROUTINE ||--|{ MEDICINE : "복용 약품 정보"
    USER ||--|{ NOTIFICATION : "복용 알림 관리"
```
---
## ⭐️ 팀 소개

| Profile | Name | Role | Contact |
|----------------------|------|------|----------|
| <img src="https://github.com/HONGMOEJI.png" width="50" height="50"> | 👑 홍영준 | Backend Developer | Email: moejihong@gmail.com<br>GitHub: [@HONGMOEJI](https://github.com/HONGMOEJI) |
| <img src="https://github.com/jiwonp7747.png" width="50" height="50"> | 박지원 | Backend Developer | Email: angry9908@gmail.com<br>GitHub: [@jiwonp7747](https://github.com/jiwonp7747) |
| <img src="https://github.com/hyynjju.png" width="50" height="50"> | 조현주 | UX/UI 설계 / Frontend Developer | Email: hyynjju@gmail.com<br>GitHub: [@hyynjju](https://github.com/hyynjju) |
| <img src="https://github.com/kimgazii.png" width="50" height="50"> | 김가영 | Frontend Developer | Email: gy0424ya@gmail.com <br>GitHub: [@kimgazii](https://github.com/kimgazii) |
| <img src="https://github.com/hs-2171117-yeyoungyang.png" width="50" height="50"> | 양예영 | Frontend Developer | Email: yangyeyoung13@gmail.com<br>GitHub: [@hs-2171117-yeyoungyang](https://github.com/hs-2171117-yeyoungyang) |
