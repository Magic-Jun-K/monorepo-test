import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

import { TableData } from './entities/table.entity';
import { SearchTableDto } from './dto/search-table.dto';

@Injectable()
export class TableService {
  private readonly logger = new Logger(TableService.name);

  constructor(
    @InjectRepository(TableData)
    private readonly tableRepo: Repository<TableData>,
  ) {}

  async search(query: SearchTableDto) {
    const { page = 1, pageSize = 10, ...filters } = query;
    const skip = (page - 1) * pageSize;
    this.logger.log('测试query', query);

    const queryBuilder = this.tableRepo.createQueryBuilder('table');

    // 动态添加筛选条件
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (key === 'createTime' && Array.isArray(value) && value.length === 2) {
          queryBuilder.andWhere({
            createTime: Between(new Date(value[0]), new Date(value[1])),
          });
        } else if (key === 'updateTime' && Array.isArray(value) && value.length === 2) {
          queryBuilder.andWhere({
            updateTime: Between(new Date(value[0]), new Date(value[1])),
          });
        } else if (typeof value === 'string') {
          queryBuilder.andWhere(`table.${key} ILIKE :${key}`, {
            [key]: `%${value}%`,
          });
        } else {
          queryBuilder.andWhere({ [key]: value });
        }
      }
    });

    const [data, total] = await queryBuilder.skip(skip).take(pageSize).getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
    };
  }
}
