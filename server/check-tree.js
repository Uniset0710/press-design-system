const { AppDataSource } = require('./src/database');
const { TreeNode } = require('./src/entities/TreeNode');

async function checkTreeData() {
  await AppDataSource.initialize();
  const treeRepo = AppDataSource.getRepository(TreeNode);
  
  console.log('=== 모든 트리 노드 ===');
  const allNodes = await treeRepo.find();
  console.log('총 노드 수:', allNodes.length);
  
  console.log('\n=== Press 루트 노드들 ===');
  const pressNodes = await treeRepo.find({ where: { type: 'press', parentId: null } });
  pressNodes.forEach(node => {
    console.log(`ID: ${node.id}, Name: ${node.name}, Model: ${node.model}`);
  });
  
  console.log('\n=== Assembly 노드들 ===');
  const assemblyNodes = await treeRepo.find({ where: { type: 'assembly' } });
  assemblyNodes.forEach(node => {
    console.log(`ID: ${node.id}, Name: ${node.name}, Parent: ${node.parentId}, Model: ${node.model}`);
  });
  
  await AppDataSource.destroy();
}

checkTreeData().catch(console.error); 