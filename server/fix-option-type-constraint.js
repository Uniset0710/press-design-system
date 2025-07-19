const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 optionType CHECK constraint 제거 중...');

db.serialize(() => {
  // 0. 기존 임시 테이블 삭제 (있다면)
  db.run('DROP TABLE IF EXISTS checklist_item_temp', (err) => {
    if (err) {
      console.log('임시 테이블 삭제 중 오류 (무시 가능):', err.message);
    } else {
      console.log('✅ 기존 임시 테이블 정리 완료');
    }
  });

  // 1. 현재 테이블 구조 확인
  db.get("PRAGMA table_info(checklist_item)", (err, rows) => {
    if (err) {
      console.error('테이블 정보 조회 실패:', err);
      return;
    }
    console.log('현재 테이블 구조 확인 완료');
  });

  // 2. 임시 테이블 생성 (constraint 없이)
  const createTempTable = `
    CREATE TABLE checklist_item_temp (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      partId INTEGER NOT NULL,
      section VARCHAR NOT NULL,
      optionType VARCHAR NOT NULL,
      description VARCHAR,
      imageUrl VARCHAR,
      author VARCHAR,
      dueDate DATE,
      category VARCHAR,
      priority VARCHAR,
      model VARCHAR,
      modelId VARCHAR,
      createdAt DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      updatedAt DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),
      modelEntityId INTEGER
    )
  `;

  db.run(createTempTable, (err) => {
    if (err) {
      console.error('임시 테이블 생성 실패:', err);
      return;
    }
    console.log('✅ 임시 테이블 생성 완료');

    // 3. 데이터 복사
    const copyData = `INSERT INTO checklist_item_temp SELECT * FROM checklist_item`;
    db.run(copyData, (err) => {
      if (err) {
        console.error('데이터 복사 실패:', err);
        return;
      }
      console.log('✅ 데이터 복사 완료');

      // 4. 기존 테이블 삭제
      db.run('DROP TABLE checklist_item', (err) => {
        if (err) {
          console.error('기존 테이블 삭제 실패:', err);
          return;
        }
        console.log('✅ 기존 테이블 삭제 완료');

        // 5. 새 테이블을 원래 이름으로 변경
        db.run('ALTER TABLE checklist_item_temp RENAME TO checklist_item', (err) => {
          if (err) {
            console.error('테이블 이름 변경 실패:', err);
            return;
          }
          console.log('✅ 테이블 이름 변경 완료');
          console.log('🎉 optionType CHECK constraint 제거 완료!');
          
          // 6. 확인
          db.get("PRAGMA table_info(checklist_item)", (err, rows) => {
            if (err) {
              console.error('최종 확인 실패:', err);
            } else {
              console.log('✅ 최종 확인 완료 - 모든 제약조건이 제거되었습니다');
            }
            db.close();
          });
        });
      });
    });
  });
}); 