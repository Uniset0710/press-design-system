import { AppDataSource } from './database';
import { TreeNode } from './entities/TreeNode';

async function seed() {
  const dataSource = await AppDataSource.initialize();
  const repo = dataSource.getRepository(TreeNode);
  // Check if a press root already exists
  const existing = await repo.findOneBy({ type: 'press' });
  if (existing) {
    console.log('Root press node already exists:', existing);
    process.exit(0);
  }
  // Create a default Press root
  const press = repo.create({ name: 'Press', type: 'press', parentId: null });
  await repo.save(press);
  console.log('Seeded default Press root with id', press.id);
  await dataSource.destroy();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
}); 