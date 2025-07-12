# Press Design System

프레스 설계 시스템을 위한 React/Next.js 기반 웹 애플리케이션입니다.

## 🚀 Features

- **체크리스트 관리**: 작업 항목 생성, 수정, 필터링, 정렬
- **트리 뷰**: 프레스 > 조립체 > 부품의 계층적 구조 표시
- **첨부파일**: 작업 항목에 파일 첨부 기능
- **실시간 검색**: 트리 뷰와 체크리스트 검색 기능
- **반응형 디자인**: 모바일/데스크톱 지원

## 🏗️ Architecture

```
press-design-system/
├── frontend/           # Next.js 프론트엔드
│   ├── app/           # Next.js App Router
│   ├── components/    # React 컴포넌트
│   │   ├── checklist/ # 체크리스트 관련 컴포넌트
│   │   ├── tree/      # 트리 뷰 컴포넌트
│   │   └── common/    # 공통 컴포넌트
│   ├── hooks/         # 커스텀 훅
│   ├── context/       # React Context
│   └── types/         # TypeScript 타입 정의
├── server/            # Express.js 백엔드
│   ├── src/
│   │   ├── routes/    # API 라우트
│   │   ├── entities/  # TypeORM 엔티티
│   │   └── middleware/# 미들웨어
└── database.sqlite    # SQLite 데이터베이스
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Express.js, TypeORM, SQLite
- **Styling**: Tailwind CSS
- **Testing**: Jest, React Testing Library
- **State Management**: React Context API

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
