const { AppDataSource } = require('./src/database');
const { TreeNode } = require('./src/entities/TreeNode');

async function checkModelData() {
  try {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(TreeNode);
    
    console.log('=== 모델 ID 1의 데이터 확인 ===');
    
    // Press 노드 확인
    const pressNodes = await repo.find({ 
      where: { type: 'press', parentId: null, model: '1' } 
    });
    console.log(`\nPress 노드 (model=1): ${pressNodes.length}개`);
    pressNodes.forEach(node => {
      console.log(`  - ID: ${node.id}, Name: ${node.name}, Model: ${node.model}`);
    });
    
    // Assembly 노드 확인
    const assemblies = await repo.find({ 
      where: { type: 'assembly', model: '1' } 
    });
    console.log(`\nAssembly 노드 (model=1): ${assemblies.length}개`);
    assemblies.forEach(asm => {
      console.log(`  - ID: ${asm.id}, Name: ${asm.name}, Model: ${asm.model}, Parent: ${asm.parentId}`);
    });
    
    // Part 노드 확인
    const parts = await repo.find({ 
      where: { type: 'part', model: '1' } 
    });
    console.log(`\nPart 노드 (model=1): ${parts.length}개`);
    parts.forEach(part => {
      console.log(`  - ID: ${part.id}, Name: ${part.name}, Model: ${part.model}, Parent: ${part.parentId}`);
    });
    
    // 전체 Press 노드 확인 (모델 필터 없이)
    const allPressNodes = await repo.find({ 
      where: { type: 'press', parentId: null } 
    });
    console.log(`\n전체 Press 노드: ${allPressNodes.length}개`);
    allPressNodes.forEach(node => {
      console.log(`  - ID: ${node.id}, Name: ${node.name}, Model: ${node.model}`);
    });
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkModelData(); 