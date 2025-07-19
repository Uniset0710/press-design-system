import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { TreeNode } from './entities/TreeNode';
import { ChecklistItem } from './entities/ChecklistItem';
import { Attachment } from './entities/Attachment';
import { Comment } from './entities/Comment';
import { History } from './entities/History';
import { Model } from './entities/Model';
import { Option } from './entities/Option';
import { ModelOption } from './entities/ModelOption';
import { PasswordResetToken } from './entities/PasswordResetToken';
import { AddModelOptions1709123456792 } from './migrations/1709123456792-AddModelOptions';
import { SeedDefaultOptions1709123456793 } from './migrations/1709123456793-SeedDefaultOptions';
import { UpdateModelOptionModelId1709123456794 } from './migrations/1709123456794-UpdateModelOptionModelId';
import { ChangeModelOptionModelIdType1709123456795 } from './migrations/1709123456795-ChangeModelOptionModelIdType';
import { RemoveOptionTypeConstraint1709123456796 } from './migrations/1709123456796-RemoveOptionTypeConstraint';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './database.sqlite',
  synchronize: false,
  logging: true,
  entities: [User, TreeNode, ChecklistItem, Attachment, Comment, History, Model, Option, ModelOption, PasswordResetToken],
  subscribers: [],
  migrations: [AddModelOptions1709123456792, SeedDefaultOptions1709123456793, UpdateModelOptionModelId1709123456794, ChangeModelOptionModelIdType1709123456795, RemoveOptionTypeConstraint1709123456796],
});
