import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { TreeNode } from './entities/TreeNode';
import { ChecklistItem } from './entities/ChecklistItem';
import { Attachment } from './entities/Attachment';
import { Comment } from './entities/Comment';
import { History } from './entities/History';
import { Model } from './entities/Model';
import { Option } from './entities/Option';
import { PasswordResetToken } from './entities/PasswordResetToken';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './database.sqlite',
  synchronize: true,
  logging: true,
  entities: [User, TreeNode, ChecklistItem, Attachment, Comment, History, Model, Option, PasswordResetToken],
  subscribers: [],
  migrations: [],
});
