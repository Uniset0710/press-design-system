import { AppDataSource } from './src/database';
import { TreeNode } from './src/entities/TreeNode';

async function fixModelNull() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(TreeNode);
  
  console.log('=== model 필드 NULL 수정 시작 ===');
  
  // 1. press 노드들의 model 필드를 확인
  const pressNodes = await repo.find({ where: { type: 'press' } });
  console.log('Press 노드들:', pressNodes.map(n => ({ id: n.id, name: n.name, model: n.model })));
  
  // 2. assembly와 part 노드들 중 model이 NULL인 것들을 확인
  const nullModelNodes = await repo.find({ 
    where: { type: 'assembly', model: null } 
  });
  console.log('Model이 NULL인 assembly 노드들:', nullModelNodes.length);
  
  const nullModelParts = await repo.find({ 
    where: { type: 'part', model: null } 
  });
  console.log('Model이 NULL인 part 노드들:', nullModelParts.length);
  
  // 3. assembly 노드들의 model을 부모 press 노드의 model로 설정
  const assembliesToUpdate = await repo.find({ 
    where: { type: 'assembly', model: null } 
  });
  
  for (const assembly of assembliesToUpdate) {
    const parentPress = await repo.findOne({ 
      where: { id: assembly.parentId, type: 'press' } 
    });
    
    if (parentPress && parentPress.model) {
      assembly.model = parentPress.model;
      await repo.save(assembly);
      console.log(`Assembly "${assembly.name}" (ID: ${assembly.id}) model을 "${parentPress.model}"로 설정`);
    }
  }
  
  // 4. part 노드들의 model을 부모 assembly 노드의 model로 설정
  const partsToUpdate = await repo.find({ 
    where: { type: 'part', model: null } 
  });
  
  for (const part of partsToUpdate) {
    const parentAssembly = await repo.findOne({ 
      where: { id: part.parentId, type: 'assembly' } 
    });
    
    if (parentAssembly && parentAssembly.model) {
      part.model = parentAssembly.model;
      await repo.save(part);
      console.log(`Part "${part.name}" (ID: ${part.id}) model을 "${parentAssembly.model}"로 설정`);
    }
  }
  
  // 5. 최종 확인
  const remainingNullAssemblies = await repo.find({ 
    where: { type: 'assembly', model: null } 
  });
  const remainingNullParts = await repo.find({ 
    where: { type: 'part', model: null } 
  });
  
  console.log('\n=== 수정 완료 ===');
  console.log('남은 NULL assembly:', remainingNullAssemblies.length);
  console.log('남은 NULL part:', remainingNullParts.length);
  
  await AppDataSource.destroy();
}

fixModelNull().catch(console.error); 