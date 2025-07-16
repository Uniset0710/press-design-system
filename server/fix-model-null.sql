-- 기존 model 필드가 NULL인 데이터들을 수정하는 스크립트

-- 1. press 노드들의 model 필드를 확인
SELECT id, name, type, model FROM tree_node WHERE type = 'press';

-- 2. assembly와 part 노드들 중 model이 NULL인 것들을 확인
SELECT id, name, type, parentId, model FROM tree_node 
WHERE type IN ('assembly', 'part') AND model IS NULL;

-- 3. assembly 노드들의 model을 부모 press 노드의 model로 설정
UPDATE tree_node 
SET model = (
  SELECT p.model 
  FROM tree_node p 
  WHERE p.id = tree_node.parentId AND p.type = 'press'
)
WHERE type = 'assembly' AND model IS NULL;

-- 4. part 노드들의 model을 부모 assembly 노드의 model로 설정
UPDATE tree_node 
SET model = (
  SELECT a.model 
  FROM tree_node a 
  WHERE a.id = tree_node.parentId AND a.type = 'assembly'
)
WHERE type = 'part' AND model IS NULL;

-- 5. 최종 확인
SELECT id, name, type, parentId, model FROM tree_node 
WHERE type IN ('assembly', 'part') AND model IS NULL; 