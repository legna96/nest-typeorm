import { Repository, EntityRepository } from 'typeorm';
import { User } from './entitys/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {}
