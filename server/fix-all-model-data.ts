import { AppDataSource } from './src/database';
import { TreeNode } from './src/entities/TreeNode';
import { ChecklistItem } from './src/entities/ChecklistItem';
import { Model } from './src/entities/Model';
import { IsNull } from 'typeorm';

async function fixAllModelData() {
  await AppDataSource.initialize();
  
  console.log('=== 전체 모델 데이터 정리 시작 ===');
  
  const treeRepo = AppDataSource.getRepository(TreeNode);
  const checklistRepo = AppDataSource.getRepository(ChecklistItem);
  const modelRepo = AppDataSource.getRepository(Model);
  
  // 1. 현재 모델 목록 확인
  const models = await modelRepo.find({ where: { isActive: true } });
  console.log('\n=== 현재 활성 모델 목록 ===');
  models.forEach(model => {
    console.log(`ID: ${model.id}, Name: ${model.name}, Code: ${model.code}`);
  });
  
  // 2. 트리 데이터 현황 확인
  console.log('\n=== 트리 데이터 현황 ===');
  const pressNodes = await treeRepo.find({ where: { type: 'press' } });
  console.log(`Press 노드 수: ${pressNodes.length}`);
  pressNodes.forEach(node => {
    console.log(`Press: ${node.name}, Model: ${node.model}, ID: ${node.id}`);
  });
  
  const assemblies = await treeRepo.find({ where: { type: 'assembly' } });
  console.log(`Assembly 노드 수: ${assemblies.length}`);
  
  const parts = await treeRepo.find({ where: { type: 'part' } });
  console.log(`Part 노드 수: ${parts.length}`);
  
  // 3. 체크리스트 데이터 현황 확인
  console.log('\n=== 체크리스트 데이터 현황 ===');
  const checklistItems = await checklistRepo.find();
  console.log(`총 체크리스트 항목 수: ${checklistItems.length}`);
  
  const modelIdGroups = await checklistRepo
    .createQueryBuilder('item')
    .select('item.modelId, COUNT(*) as count')
    .groupBy('item.modelId')
    .getRawMany();
  
  console.log('ModelId별 체크리스트 항목 수:');
  modelIdGroups.forEach(group => {
    console.log(`ModelId: ${group.modelId || 'NULL'}, Count: ${group.count}`);
  });
  
  // 4. 트리 데이터 정리
  console.log('\n=== 트리 데이터 정리 시작 ===');
  
  // 4-1. Press 노드 정리
  for (const model of models) {
    let pressNode = await treeRepo.findOne({ 
      where: { type: 'press', model: model.code } 
    }) || null;
    
    if (!pressNode) {
      // 해당 모델의 Press 노드가 없으면 생성
      pressNode = treeRepo.create({
        name: 'Press',
        type: 'press',
        parentId: null,
        order: 0,
        model: model.code
      });
      await treeRepo.save(pressNode);
      console.log(`새 Press 노드 생성: ${model.name} (${model.code})`);
    } else {
      // 기존 Press 노드의 model 필드 업데이트
      if (pressNode.model !== model.code) {
        pressNode.model = model.code;
        await treeRepo.save(pressNode);
        console.log(`Press 노드 model 업데이트: ${model.name} (${model.code})`);
      }
    }
  }
  
  // 4-2. Assembly/Part 노드 정리
  const allAssemblies = await treeRepo.find({ where: { type: 'assembly' } });
  for (const assembly of allAssemblies) {
    if (assembly.parentId) {
      const parentPress = await treeRepo.findOne({ where: { id: assembly.parentId } });
      if (parentPress && assembly.model !== parentPress.model) {
        assembly.model = parentPress.model;
        await treeRepo.save(assembly);
        console.log(`Assembly "${assembly.name}" model 업데이트: ${parentPress.model}`);
      }
    }
  }
  
  const allParts = await treeRepo.find({ where: { type: 'part' } });
  for (const part of allParts) {
    if (part.parentId) {
      const parentAssembly = await treeRepo.findOne({ where: { id: part.parentId } });
      if (parentAssembly && part.model !== parentAssembly.model) {
        part.model = parentAssembly.model;
        await treeRepo.save(part);
        console.log(`Part "${part.name}" model 업데이트: ${parentAssembly.model}`);
      }
    }
  }
  
  // 5. 체크리스트 데이터 정리
  console.log('\n=== 체크리스트 데이터 정리 시작 ===');
  
  // 5-1. modelId가 null이거나 잘못된 체크리스트 항목들을 올바른 모델로 연결
  const invalidChecklistItems = await checklistRepo.find({
    where: [
      { modelId: IsNull() },
      { modelId: '' },
      { modelId: 'PRESS' } // 기본값을 실제 모델 코드로 변경
    ]
  });
  
  console.log(`수정할 체크리스트 항목 수: ${invalidChecklistItems.length}`);
  
  for (const item of invalidChecklistItems) {
    // partId를 통해 해당 part의 model을 찾아서 modelId 설정
    const part = await treeRepo.findOne({ where: { id: item.partId } });
    if (part && part.model) {
      item.modelId = part.model;
      await checklistRepo.save(item);
      console.log(`체크리스트 항목 "${item.description}" modelId 업데이트: ${part.model}`);
    } else {
      // part가 없거나 model이 없는 경우 기본값 설정
      if (models.length > 0) {
        item.modelId = models[0].code;
        await checklistRepo.save(item);
        console.log(`체크리스트 항목 "${item.description}" modelId 기본값 설정: ${models[0].code}`);
      }
    }
  }
  
  // 6. 결과 확인
  console.log('\n=== 정리 후 결과 확인 ===');
  
  const finalPressNodes = await treeRepo.find({ where: { type: 'press' } });
  console.log(`최종 Press 노드 수: ${finalPressNodes.length}`);
  finalPressNodes.forEach(node => {
    console.log(`Press: ${node.name}, Model: ${node.model}, ID: ${node.id}`);
  });
  
  const finalChecklistItems = await checklistRepo.find();
  const finalModelIdGroups = await checklistRepo
    .createQueryBuilder('item')
    .select('item.modelId, COUNT(*) as count')
    .groupBy('item.modelId')
    .getRawMany();
  
  console.log('최종 ModelId별 체크리스트 항목 수:');
  finalModelIdGroups.forEach(group => {
    console.log(`ModelId: ${group.modelId || 'NULL'}, Count: ${group.count}`);
  });
  
  // 7. 모델별 트리 구조 확인
  console.log('\n=== 모델별 트리 구조 확인 ===');
  for (const model of models) {
    const modelPressNodes = await treeRepo.find({ 
      where: { type: 'press', model: model.code } 
    });
    const modelAssemblies = await treeRepo.find({ 
      where: { type: 'assembly', model: model.code } 
    });
    const modelParts = await treeRepo.find({ 
      where: { type: 'part', model: model.code } 
    });
    
    console.log(`${model.name} (${model.code}):`);
    console.log(`  - Press: ${modelPressNodes.length}개`);
    console.log(`  - Assembly: ${modelAssemblies.length}개`);
    console.log(`  - Part: ${modelParts.length}개`);
  }
  
  console.log('\n=== 전체 모델 데이터 정리 완료 ===');
  
  await AppDataSource.destroy();
  process.exit(0);
}

fixAllModelData().catch(error => {
  console.error('Error during model data fix:', error);
  process.exit(1);
}); 