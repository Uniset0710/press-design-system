# Git 복원 가이드 - 현재 안정화 시점으로 되돌아오기

---

## 📍 현재 저장된 시점 정보
- **커밋 해시**: `2006b99`
- **브랜치**: `backup-before-modify`
- **커밋 메시지**: "feat: 체크리스트 시스템 안정화 및 가이드 문서 개선"
- **저장 날짜**: 2024년 현재

---

## 🔄 되돌아오는 방법들

### 1. **완전히 되돌리기 (모든 변경사항 삭제)**
```bash
# 현재 브랜치에서 완전히 되돌리기
git reset --hard 2006b99

# 또는 브랜치명으로
git reset --hard backup-before-modify
```

### 2. **새 브랜치로 복원하기 (권장)**
```bash
# 현재 작업 내용을 임시 저장
git stash

# 새 브랜치 생성 후 복원
git checkout -b restore-stable-point
git reset --hard 2006b99

# 또는 한 번에
git checkout -b restore-stable-point 2006b99
```

### 3. **특정 파일만 되돌리기**
```bash
# 특정 파일만 되돌리기
git checkout 2006b99 -- frontend/components/checklist/ChecklistTable.tsx

# 여러 파일 되돌리기
git checkout 2006b99 -- frontend/ server/ 확장전_보완_가이드.md
```

### 4. **임시 저장 후 복원**
```bash
# 현재 작업 임시 저장
git stash push -m "작업 중인 내용"

# 안정화 시점으로 되돌리기
git reset --hard 2006b99

# 나중에 임시 저장 내용 복원
git stash list
git stash pop
```

---

## 🛡️ 안전한 복원 방법 (권장)

### 단계별 안전 복원
```bash
# 1. 현재 상태 백업
git branch backup-current-work

# 2. 현재 작업 임시 저장
git stash push -m "현재 작업 내용"

# 3. 안정화 시점으로 되돌리기
git reset --hard 2006b99

# 4. 확인
git log --oneline -5
git status

# 5. 필요시 이전 작업 복원
git checkout backup-current-work
git stash pop
```

---

## 📋 복원 전 체크리스트

### ✅ 복원 전 확인사항
- [ ] 현재 작업 내용이 중요한지 확인
- [ ] 백업 브랜치 생성 여부
- [ ] 임시 저장(stash) 여부
- [ ] 복원할 시점의 커밋 해시 확인

### ✅ 복원 후 확인사항
- [ ] 올바른 커밋으로 되돌아갔는지 확인
- [ ] 필요한 파일들이 모두 있는지 확인
- [ ] 프로젝트가 정상 실행되는지 확인

---

## 🚨 주의사항

### ⚠️ 위험한 명령어들
```bash
# 이 명령어들은 변경사항을 완전히 삭제합니다!
git reset --hard HEAD~1  # 마지막 커밋 삭제
git reset --hard 2006b99 # 특정 시점으로 완전 복원
git clean -fd             # 추적되지 않는 파일 삭제
```

### ✅ 안전한 명령어들
```bash
# 이 명령어들은 안전합니다
git reset --soft HEAD~1   # 커밋만 취소, 변경사항 유지
git checkout -- filename  # 특정 파일만 되돌리기
git stash                 # 임시 저장
```

---

## 🔍 현재 상태 확인 명령어들

```bash
# 현재 브랜치 확인
git branch

# 현재 커밋 확인
git log --oneline -5

# 변경사항 확인
git status

# 특정 커밋 상세 확인
git show 2006b99

# 브랜치 목록 확인
git branch -a
```

---

## 📝 복원 시나리오별 가이드

### 시나리오 1: 실험 중 문제 발생
```bash
# 현재 실험 내용 임시 저장
git stash push -m "실험 내용"

# 안정화 시점으로 복원
git reset --hard 2006b99

# 나중에 실험 내용 확인
git stash list
git stash show -p stash@{0}
```

### 시나리오 2: 특정 파일만 문제
```bash
# 문제가 있는 파일만 되돌리기
git checkout 2006b99 -- frontend/components/ChecklistTable.tsx

# 변경사항 확인
git diff
```

### 시나리오 3: 완전히 새로 시작
```bash
# 새 브랜치 생성
git checkout -b fresh-start 2006b99

# 기존 브랜치 삭제 (선택사항)
git branch -D backup-before-modify
```

---

## 💡 팁

### 1. **자주 백업하기**
```bash
# 작업 중간중간 백업
git add .
git commit -m "작업 중간 저장"
```

### 2. **태그 사용하기**
```bash
# 중요한 시점에 태그 생성
git tag stable-v1.0 2006b99

# 태그로 복원
git checkout stable-v1.0
```

### 3. **원격 저장소 활용**
```bash
# 현재 상태를 원격에 백업
git push origin backup-before-modify

# 나중에 복원
git fetch origin
git checkout origin/backup-before-modify
```

---

## 🎯 빠른 복원 명령어

### 가장 빠른 복원 (주의: 모든 변경사항 삭제)
```bash
git reset --hard 2006b99
```

### 안전한 복원 (권장)
```bash
git stash push -m "현재 작업"
git reset --hard 2006b99
```

### 특정 파일만 복원
```bash
git checkout 2006b99 -- 파일명
```

---

> **이 가이드를 참고하여 언제든 안전하게 이 시점으로 되돌아올 수 있습니다.**
> 복원 전에는 반드시 현재 작업 내용을 백업하거나 임시 저장하세요! 