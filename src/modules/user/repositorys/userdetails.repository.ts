import { Repository, EntityRepository } from 'typeorm';
import { UserDetails } from '../entitys/user.details.entity';

@EntityRepository(UserDetails)
export class UserDetailsRepository extends Repository<UserDetails> {}
