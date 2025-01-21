import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private dataSource: DataSource,
  ) {}

  async validateUser(username: string): Promise<{id: number, username: string} | null> {
    const user = await this.usersRepository.findOne({ 
      where: { nickname: username },
      select: ['id', 'nickname']
    });

    if (!user) return null;

    // Return user info without password if validation succeeds
    return {
      id: user.id,
      username: user.nickname
    };
  }

  async findAll(): Promise<UserEntity[]> {
    // relations: ['photos']， 联合查询
    return await this.usersRepository.find({ relations: ['photos'] });

    // 或者使用queryBuilder
    // return await getRepository(UserEntity)
    //   .createQueryBuilder("user")
    //   .leftJoinAndSelect("user.photos", "photo")
    //   .getMany()
  }

  async create(user): Promise<UserEntity[]> {
    const { username } = user;
    const u = await this.usersRepository.findOne({ where: { nickname: username } });
    //   .createQueryBuilder('users')
    //   .where('users.name = :name', { name });
    // const u = await qb.getOne();
    if (u) {
      throw new HttpException(
        {
          message: 'Input data validation failed',
          error: 'name must be unique.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.usersRepository.save(user);
  }

  async createMany(users: UserEntity[]) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      users.forEach(async (user) => {
        await queryRunner.manager.getRepository(UserEntity).save(user);
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      console.log(err);
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }

  async findOneById(id: number): Promise<UserEntity | null> {
    return await this.usersRepository.findOne({ 
      where: { id },
      select: ['id', 'nickname']
    });
  }
}
