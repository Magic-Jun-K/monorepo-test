import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Repository, Connection } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private connection: Connection,
  ) {}

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
    const u = await this.usersRepository.findOne({ where: { username } });
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
    const queryRunner = this.connection.createQueryRunner();

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
}
