import { AppDataSource } from './src/database';
import { TreeNode } from './src/entities/TreeNode';
import { IsNull } from 'typeorm';

async function fixTreeData() {
  await AppDataSource.initialize();
  const treeRepo = AppDataSource.getRepository(TreeNode);
  
  console.log('=== 기존 Assembly들을 대형 프레스 모델로 업데이트 ===');
  
  // 대형 프레스 Press 노드 찾기
  const largePressNode = await treeRepo.findOne({ where: { type: 'press', model: 'LARGE_PRESS' } });
  if (!largePressNode) {
    console.error('대형 프레스 Press 노드를 찾을 수 없습니다.');
    return;
  }
  
  console.log('대형 프레스 Press 노드 ID:', largePressNode.id);
  
  // model이 null인 Assembly들을 찾아서 LARGE_PRESS로 업데이트
  const nullModelAssemblies = await treeRepo.find({ 
    where: { 
      type: 'assembly', 
      model: IsNull(),
      parentId: largePressNode.id 
    } 
  });
  
  console.log(`업데이트할 Assembly 수: ${nullModelAssemblies.length}`);
  
  for (const assembly of nullModelAssemblies) {
    assembly.model = 'LARGE_PRESS';
    await treeRepo.save(assembly);
    console.log(`Assembly "${assembly.name}" (ID: ${assembly.id}) 업데이트됨`);
  }
  
  // model이 null인 Part들도 업데이트
  const nullModelParts = await treeRepo.find({ 
    where: { 
      type: 'part', 
      model: IsNull()
    } 
  });
  
  console.log(`업데이트할 Part 수: ${nullModelParts.length}`);
  
  for (const part of nullModelParts) {
    part.model = 'LARGE_PRESS';
    await treeRepo.save(part);
    console.log(`Part "${part.name}" (ID: ${part.id}) 업데이트됨`);
  }
  
  console.log('=== 업데이트 완료 ===');
  
  // 결과 확인
  const updatedAssemblies = await treeRepo.find({ 
    where: { 
      type: 'assembly', 
      model: 'LARGE_PRESS' 
    } 
  });
  
  console.log(`LARGE_PRESS 모델의 Assembly 수: ${updatedAssemblies.length}`);
  
  await AppDataSource.destroy();
}

fixTreeData().catch(console.error); 