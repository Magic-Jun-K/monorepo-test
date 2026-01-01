import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AdminEntity } from '../../entities/admin.entity';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly tableRepo: Repository<AdminEntity>,
  ) {}

  async findAll() {
    return this.tableRepo.find();
  }

  async create(data: unknown) {
    const entity = this.tableRepo.create(data as Record<string, unknown>);
    return this.tableRepo.save(entity);
  }

  async search(_dto: unknown) {
    // 实现搜索逻辑
    return { data: [], total: 0 };
  }
}
