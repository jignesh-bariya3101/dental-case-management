import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateShadeDto } from './dto/create-shade.dto';
import { UpdateShadeDto } from './dto/update-shade.dto';
import { DatabaseService } from '../database/database.service';
import { QueryRequestInput } from './dto/pagination.dto';

@Injectable()
export class ShadesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    createShadeDto: CreateShadeDto,
  ): Promise<{ status?: boolean; data?: object; message?: string }> {
    try {
      const newShade = await this.databaseService.shades.create({
        data: createShadeDto,
      });

      if (!newShade) {
        throw {
          message: 'The shade cannot be created!',
          error: 'Unauthorized',
        };
      }
      return {
        status: true,
        message: 'Shade created successfully!',
        data: newShade,
      };
    } catch (error) {
      console.error('error in shaed create', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(query: QueryRequestInput) {
    try {
      const { pageNo, limit, queryString } = query;
      const offset = (pageNo - 1) * +limit;
      const searchQuery = `%${queryString || ''}%`;

      const whereCondition: any = {
        OR: [{ shadeName: { contains: searchQuery, mode: 'insensitive' } }],
        deletedAt: null,
      };

      const totalCount = await this.databaseService.shades.count({
        where: whereCondition,
      });

      const orderCheck = {
        orderBy: query.orderBy ? query.orderBy : 'createdAt',
        orderType: query.orderType ? query.orderType : 'desc',
      };
      const order = {
        [`${orderCheck.orderBy}`]: orderCheck.orderType,
      };
      console.info('order', order);

      const shadeData = await this.databaseService.shades.findMany({
        where: whereCondition,
        take: +limit,
        skip: offset,
        orderBy: order,
      });

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = pageNo < totalPages;
      if (!shadeData) {
        throw {
          message: 'Shade data not fetched!',
          error: 'Unauthorized',
        };
      }
      return {
        status: true,
        message: 'List of all shade data',
        data: {
          data: shadeData,
          total: totalCount,
          next: hasNextPage ? +pageNo + 1 : null,
        },
      };
    } catch (error) {
      console.error('error in shaed list', error);

      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      return await this.databaseService.shades.findFirst({ where: { id } });
    } catch (error) {
      console.error('error in shaed findOne', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: string, updateShadeDto: UpdateShadeDto) {
    try {
      const data: any = await this.databaseService.shades.findFirst({
        where: { id: id, deletedAt: null },
      });
      if (!data) {
        throw { message: 'Shade not found', error: 'not found' };
      }
      const shadeUpdate = await this.databaseService.shades.update({
        where: { id: id },
        data: updateShadeDto,
      });

      if (!shadeUpdate) {
        throw { message: 'Shade not updated!', error: 'not found' };
      }
      return {
        status: true,
        message: 'Shade details updated successfully!',
      };
    } catch (error) {
      console.error('error in shade update', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: string) {
    try {
      const data = await this.databaseService.shades.findUnique({
        where: { id, deletedAt: null },
      });
      if (!data) {
        throw { message: 'Shade not found', error: 'not found' };
      }
      const softDel = await this.databaseService.shades.update({
        data: { deletedAt: new Date() },
        where: {
          id,
        },
      });
      if (!softDel) {
        throw { message: 'Shade not deleted', error: 'not found' };
      }
      return {
        status: true,
        message: 'Shade has been successfully deleted!',
      };
    } catch (error) {
      console.error('error in shade remove', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
