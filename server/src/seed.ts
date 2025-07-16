import { AppDataSource } from './database';
import { TreeNode } from './entities/TreeNode';
import { Model } from './entities/Model';
import { ChecklistItem } from './entities/ChecklistItem';

async function seed() {
  const dataSource = await AppDataSource.initialize();
  
  // 1. Create "대형 프레스" model
  const modelRepo = dataSource.getRepository(Model);
  let largePressModel = await modelRepo.findOneBy({ code: 'LARGE_PRESS' });
  
  if (!largePressModel) {
    largePressModel = modelRepo.create({
      name: '대형 프레스',
      code: 'LARGE_PRESS',
      description: '대형 프레스 기종',
      isActive: true
    });
    await modelRepo.save(largePressModel);
    console.log('Created Large Press model with id', largePressModel.id);
  }

  // 2. Create or update TreeNode with model association
  const treeRepo = dataSource.getRepository(TreeNode);
  let existingPress = await treeRepo.findOneBy({ type: 'press' });
  
  if (!existingPress) {
    existingPress = treeRepo.create({ 
      name: 'Press', 
      type: 'press', 
      parentId: null,
      model: 'LARGE_PRESS'
    });
    await treeRepo.save(existingPress);
    console.log('Created Press root with id', existingPress.id);
  } else {
    // Update existing press to associate with the model
    existingPress.model = 'LARGE_PRESS';
    await treeRepo.save(existingPress);
    console.log('Updated existing Press root to associate with Large Press model');
  }

  // 3. Update existing ChecklistItems to associate with the model
  const checklistRepo = dataSource.getRepository(ChecklistItem);
  const existingItems = await checklistRepo.find();
  
  for (const item of existingItems) {
    if (!item.model) {
      item.model = 'LARGE_PRESS';
      item.modelId = 'LARGE_PRESS';
      await checklistRepo.save(item);
    }
  }
  
  console.log(`Updated ${existingItems.length} checklist items to associate with Large Press model`);

  await dataSource.destroy();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
