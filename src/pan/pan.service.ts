import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePanDto } from './dto/create-pan.dto';
import { UpdatePanDto } from './dto/update-pan.dto';
import { DatabaseService } from 'src/database/database.service';
import { modelTypeRoles } from 'src/helper/helper';
import { queryRequestInput } from './dto/pagination.dto';

@Injectable()
export class PanService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createPanDto: CreatePanDto, user: any) {
    try {
      if (user.modelType !== modelTypeRoles.USER) {
        throw new HttpException(
          'Cannot access this resource!',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const panNameCheck = await this.databaseService.pan.findUnique({
        where: {
          panNumber: createPanDto.panNumber,
        },
      });

      if (panNameCheck) {
        throw {
          message: 'Pan already exists',
          error: 'already exists',
        };
      }

      let schedule;
      if (createPanDto.scheduleTypeId) {
        schedule = await this.databaseService.scheduleType.findUnique({
          where: { id: createPanDto.scheduleTypeId },
        });
        if (!schedule) {
          throw {
            message: 'Schedule Type not found',
            error: 'not found',
          };
        }
      } else if (createPanDto.scheduleType) {
        schedule = await this.databaseService.scheduleType.create({
          data: createPanDto.scheduleType,
        });
      } else {
        throw {
          message: 'Either scheduleTypeId or scheduleType must be provided',
          error: 'invalid data',
        };
      }
      const panData = await this.databaseService.pan.create({
        data: {
          panNumber: createPanDto.panNumber,
          scheduleTypeId: schedule.id,
        },
      });
      return {
        status: true,
        message: 'Pan created successfully',
        data: panData,
      };
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(query: queryRequestInput, user: any) {
    try {
      if (user.modelType !== modelTypeRoles.USER) {
        throw new HttpException(
          'Cannot access this resource!',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const pageNo = query?.pageNo || 1;
      const limit = +query?.limit || 25;
      const queryString = query?.queryString;

      const offset = (pageNo - 1) * limit;
      const searchQuery = `%${queryString || ''}%`;
      const totalCount = await this.databaseService.pan.count({
        where: {
          OR: [
            { panNumber: { contains: searchQuery, mode: 'insensitive' } }, // Case-insensitive search
          ],
          deletedAt: null,
        },
      });

      const orderCheck = {
        orderBy: query.orderBy ? query.orderBy : 'createdAt',
        orderType: query.orderType ? query.orderType : 'desc',
      };
      const order = {
        [`${orderCheck.orderBy}`]: orderCheck.orderType,
      };
      const panData = await this.databaseService.pan.findMany({
        include: {
          scheduleType: true,
        },
        where: {
          OR: [
            { panNumber: { contains: searchQuery, mode: 'insensitive' } }, // Case-insensitive search
          ],
          deletedAt: null,
        },
        skip: offset,
        take: limit,
        orderBy: order,
      });

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = pageNo < totalPages;

      return {
        status: true,
        message: 'Pan records retrieved successfully',
        data: {
          data: panData,
          total: totalCount,
          next: hasNextPage ? +pageNo + 1 : null,
        },
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  findOne(id: string, user: any) {
    try {
      if (user.modelType !== modelTypeRoles.USER) {
        throw new HttpException(
          'Cannot access this resource!',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const panData = this.databaseService.pan.findUnique({
        where: {
          id: id,
        },
      });

      if (!panData) {
        throw { message: 'Pan not found', error: 'not found' };
      }

      return {
        status: true,
        message: 'Pan retrieved successfully',
        data: panData,
      };
    } catch (error) {
      console.error('Error retrieving Pan:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: string, updatePanDto: UpdatePanDto, user: any) {
    try {
      if (user.modelType !== modelTypeRoles.USER) {
        throw new HttpException(
          'Cannot access this resource!',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const panData = await this.databaseService.pan.findUnique({
        where: {
          id: id,
        },
      });

      if (!panData) {
        throw { message: 'Pan not found', error: 'not found' };
      }

      const updatedPan = this.databaseService.pan.update({
        where: {
          id: id,
        },
        data: {
          panNumber: updatePanDto.panNumber,
        },
      });

      if (updatePanDto.scheduleTypeId) {
        this.databaseService.pan.update({
          where: {
            id: id,
          },
          data: {
            scheduleTypeId: updatePanDto.scheduleTypeId,
          },
        });
      }
      // Update scheduleType if scheduleType is provided
      if (updatePanDto.scheduleType && panData.scheduleTypeId) {
        await this.databaseService.scheduleType.update({
          where: {
            id: panData.scheduleTypeId,
          },
          data: updatePanDto.scheduleType,
        });
      }

      return {
        status: true,
        message: 'Pan updated successfully',
        data: updatedPan,
      };
    } catch (error) {
      console.error('Error updating Pan:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
