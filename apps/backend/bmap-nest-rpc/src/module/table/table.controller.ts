import { Controller, Post, Body, Logger, UsePipes } from '@nestjs/common';

import { TableService } from './table.service';
import { SearchTableDto, searchTableSchema } from './dto/search-table.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@Controller('table')
export class TableController {
  // constructor(private readonly tableService: TableService) {}

  // @Post('search')
  // async search(@Body() dto: SearchTableDto) {
  //   return this.tableService.search(dto);
  // }
  private readonly logger = new Logger(TableController.name);
  
  constructor(private readonly tableService: TableService) {
    this.logger.log('TableController initialized');
  }

  @Public()
  @Post('search')
  @UsePipes(new ZodValidationPipe(searchTableSchema))
  async search(@Body() dto: SearchTableDto) {
    this.logger.log(`Received search request: ${JSON.stringify(dto)}`);
    return this.tableService.search(dto);
  }
}
