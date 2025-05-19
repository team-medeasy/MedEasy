# 💊 메디지(MedEasy) - 디지털 소외 계층을 위한 대화형 복약 어플리케이션
![Cover](docs/cover.png)


<div align="center">
    
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/medeasy.dev)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:team.medeasy@gmail.com)
[![Google Play](https://img.shields.io/badge/Google_Play-414141?style=for-the-badge&logo=google-play&logoColor=white)](https://play.google.com/store)
[![App Store](https://img.shields.io/badge/App_Store-0D96F6?style=for-the-badge&logo=apple&logoColor=white)](https://apps.apple.com)
[![Website](https://img.shields.io/badge/Homepage-000000?style=for-the-badge&logo=homeadvisor&logoColor=white)](https://medeasy.dev)

</div>

> [!NOTE]
> 고령자와 같이 시력이 좋지 않은 **디지털 소외 계층**은 복약 관리 앱의 복잡한 사용법으로 인해 접근이 어려워, **약을 복용하지 않거나 중복 복용**하는 등의 문제가 자주 발생하며 보호자의 도움이 필요하다.
> 
> 메디지는 이러한 문제를 해결하기 위해 **MCP와 LangGraph 기반의 음성 대화 인터페이스**를 도입하여 사용자가 별도의 조작 없이도 복약 현황을 관리할 수 있도록 설계되었다.
> 
> 복약 누락 시 **보호자에게 실시간 알림**을 보내고, **보호자 계정과의 연동**을 통해 피보호자의 복약 상태를 원격으로 모니터링할 수 있다.
> 
> 또한 95% 이상의 정확도로 **알약 이미지 검색**이 가능해 약에 대한 정보가 부족하거나 시각적 구분이 어려운 사용자도 의약품 정보를 쉽게 확인할 수 있다.

---

## 🚀 주요 기능
| 💊 복용 루틴           | 💬 AI 채팅             | 🔎 의약품 검색         |
|--------------------|---------------------|----------------------|
| ![복용 루틴](docs/1.png) | ![AI 채팅](docs/2.png)   | ![의약품 검색](docs/3.png) |

| 🫂 보호 대상 관리           | 🚫 금기 정보         | 💬 NFC 태그            |
|--------------------|------------------------|----------------------|
| ![보호 대상 관리](docs/5.png) | ![금기 정보](docs/4.png) | ![NFC 태그](docs/6.png)   |

---

## 🎯 기대 효과

| 번호 | 내용 |
|------|------|
| **01** | 음성 대화를 통한 복약 관리로<br>**디지털 취약 계층의 정보 접근성 향상** |
| **02** | NFC 태그 기반 복약 체크와 푸시 알림으로<br>**백그라운드에서 복약 관리** |
| **03** | 약 95% 정확도의 의약품 촬영 기능으로<br>**약 이름 없이도 간편한 검색 가능** |
| **04** | 복용 금기 및 약물 간 상호작용 정보 제공으로<br>**부작용 및 오남용 예방** |
| **05** | 가족 또는 간병인의 실시간 복약 현황 확인으로<br>**돌봄 효율 향상** |

---

## 🏗️ 기술 스택
| 구분 | 기술 스택 |
|------|-----------|
| 💻 **Frontend** | ![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=white) |
| 🛠️ **Backend** | ![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) |
| 🤖 **AI & Data Processing** | ![Gemini](https://img.shields.io/badge/Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white) ![LangChain](https://img.shields.io/badge/LangChain-0055A5?style=for-the-badge) ![Naver Clova OCR](https://img.shields.io/badge/Naver_Clova_OCR-03C75A?style=for-the-badge&logo=ncloud&logoColor=white) |
| ☁️ **Cloud & Infrastructure** | ![Amazon ECR](https://img.shields.io/badge/Amazon_ECR-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white) ![Google Compute Engine](https://img.shields.io/badge/Google_Compute_Engine-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white) |
| 🚀 **Deployment & Version Control** | ![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white) |

---

## 🛠️ 시스템 아키텍처
![System Architecture](docs/architecture.jpg)

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

## 🌐 외부 API 및 서비스

| 구분 | 서비스 / API | 용도 |
|------|---------------|------|
| 🏥 **공공데이터 포털** | 의약품 정보 개방 시스템 API | 알약 이름, 성분, 금기사항 조회 |
| 🧠 **OpenAI GPT-4.1-Nano** | LangGraph 기반 대화형 복약 상담 | 자연어 이해 및 복약 루틴 추출 |
| 🧾 **Naver Clova OCR** | 처방전 이미지 문자 인식 | 약 이름, 용량 등 정보 추출 |
| 📷 **Vertex AI (GCP)** | 알약 이미지 분류 | 알약 이름, 제형, 색상 예측 |
| 🔈 **GCP Text-to-Speech** | 약 설명 음성 안내 | 시각장애 또는 고령자 지원 |
| 📲 **FCM / APNs** | 푸시 알림 발송 | 복약 시간, 누락 시 보호자 알림 |
| ☁️ **GCP Load Balancer** | 트래픽 분산 | 앱 안정성 확보 |
| 🐳 **K3S + Compute Engine** | 백엔드 운영 및 배포 | 경량 쿠버네티스 클러스터 기반 운영 |

---

## ⭐️ 팀 소개

| Profile | Name | Role | Contact |
|----------------------|------|------|----------|
| <img src="https://github.com/HONGMOEJI.png" width="50" height="50"> | 👑 홍영준 | Backend Developer | Email: moejihong@gmail.com<br>GitHub: [@HONGMOEJI](https://github.com/HONGMOEJI) |
| <img src="https://github.com/jiwonp7747.png" width="50" height="50"> | 박지원 | Backend Developer | Email: angry9908@gmail.com<br>GitHub: [@jiwonp7747](https://github.com/jiwonp7747) |
| <img src="https://github.com/hyynjju.png" width="50" height="50"> | 조현주 | UX/UI / Frontend Developer | Email: hyynjju@gmail.com<br>GitHub: [@hyynjju](https://github.com/hyynjju) |
| <img src="https://github.com/kimgazii.png" width="50" height="50"> | 김가영 | Frontend Developer | Email: gy0424ya@gmail.com <br>GitHub: [@kimgazii](https://github.com/kimgazii) |
| <img src="https://github.com/hs-2171117-yeyoungyang.png" width="50" height="50"> | 양예영 | Frontend Developer | Email: yangyeyoung13@gmail.com<br>GitHub: [@hs-2171117-yeyoungyang](https://github.com/hs-2171117-yeyoungyang) |
