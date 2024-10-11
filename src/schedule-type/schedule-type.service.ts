import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateScheduleTypeDto,
  UpdateScheduleTypeDto,
  queryRequestInput,
} from './dto/schedule-type.dto';
import { modelTypeRoles } from 'src/helper/helper';
import { CreatePanDto, UpdatePanDto } from './dto/pan.dto';

@Injectable()
export class ScheduleTypeService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createScheduleTypeDto: CreateScheduleTypeDto, user: any) {
    try {
      if (user.modelType !== modelTypeRoles.USER) {
        throw new HttpException(
          'Cannot access this resource!',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const scheduleTypedata = await this.databaseService.scheduleType.create({
        data: createScheduleTypeDto,
      });

      if (!scheduleTypedata) {
        throw new HttpException(
          'Schedule type could not be created.',
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        status: true,
        data: scheduleTypedata,
        message: 'Schedule type created successfully.',
      };
    } catch (error) {
      console.info('error', error);
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

      const totalCount = await this.databaseService.scheduleType.count({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } }, // Use contains for case-insensitive search
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
      console.info('order', order);

      const recordsList = await this.databaseService.scheduleType.findMany({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } }, // Use contains for case-insensitive search
          ],
          deletedAt: null,
        },
        take: limit,
        skip: offset,
        orderBy: order,
      });
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = pageNo < totalPages;
      if (!recordsList) {
        throw {
          message: 'Records are not fetch!',
          error: 'Unauthorized',
        };
      }
      return {
        status: true,
        message: 'List of all Records',
        data: {
          data: recordsList,
          total: totalCount,
          next: hasNextPage ? +pageNo + 1 : null,
        },
      };
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAllPanNumber(query: queryRequestInput, user: any) {
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

      // Count the total number of records matching the search query
      const totalCount = await this.databaseService.pan.count({
        where: {
          OR: [
            { panNumber: { contains: searchQuery, mode: 'insensitive' } }, // Case-insensitive search
          ],
          deletedAt: null,
        },
      });

      // Handle sorting
      const orderCheck = {
        orderBy: query.orderBy ? query.orderBy : 'createdAt',
        orderType: query.orderType ? query.orderType : 'desc',
      };
      const order = {
        [`${orderCheck.orderBy}`]: orderCheck.orderType,
      };
      console.info('order', order);

      // Fetch the pan records with the related schedule type data
      const recordsList = await this.databaseService.pan.findMany({
        where: {
          OR: [
            { panNumber: { contains: searchQuery, mode: 'insensitive' } }, // Case-insensitive search
          ],
          deletedAt: null,
        },
        select: {
          id: true,
          panNumber: true,
          scheduleType: {
            select: {
              id: true,
              name: true,
              daysInLab: true,
              transitToDentalLab: true,
              transitToClient: true,
              inTransitToManufacturer: true,
            },
          },
        },
        take: limit,
        skip: offset,
        orderBy: order,
      });

      const currentDate = new Date();

      // Calculate shipDate and dueDate
      const pansWithDates = recordsList.map((pan) => {
        const { scheduleType } = pan;

        if (!scheduleType) {
          // Handle cases where scheduleType is not defined
          return {
            ...pan,
            shipDate: null,
            dueDate: null,
          };
        }

        const {
          daysInLab = 0,
          transitToDentalLab = 0,
          transitToClient = 0,
          inTransitToManufacturer = 0,
        } = scheduleType;

        const shipDate = new Date(currentDate);
        shipDate.setDate(
          shipDate.getDate() + daysInLab + transitToDentalLab + transitToClient,
        );

        const dueDate = new Date(currentDate);
        dueDate.setDate(
          dueDate.getDate() +
            daysInLab +
            transitToDentalLab +
            transitToClient +
            inTransitToManufacturer,
        );

        return {
          ...pan,
          shipDate,
          dueDate,
        };
      });

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = pageNo < totalPages;

      if (recordsList.length === 0) {
        throw new HttpException(
          'Records are not fetched!',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        status: true,
        message: 'List of all Records',
        data: {
          data: pansWithDates,
          total: totalCount,
          next: hasNextPage ? +pageNo + 1 : null,
        },
      };
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: string, user: any) {
    try {
      if (user.modelType !== modelTypeRoles.USER) {
        throw new HttpException(
          'Cannot access this resource!',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const getRecordById = await this.databaseService.scheduleType.findFirst({
        where: { id },
      });
      if (!getRecordById) {
        throw { message: 'Invalid Id', error: 'Unauthorized' };
      }

      return {
        status: true,
        data: getRecordById,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(
    id: string,
    updateScheduleTypeDto: UpdateScheduleTypeDto,
    user: any,
  ) {
    try {
      if (user.modelType !== modelTypeRoles.USER) {
        throw new HttpException(
          'Cannot access this resource!',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const getRecordById = await this.databaseService.scheduleType.findFirst({
        where: { id },
      });

      if (!getRecordById) {
        throw new HttpException('Invalid Id', HttpStatus.UNAUTHORIZED);
      }

      const updateRecord = await this.databaseService.scheduleType.update({
        where: { id },
        data: {
          name: updateScheduleTypeDto?.name,
          inTransitToManufacturer:
            updateScheduleTypeDto?.inTransitToManufacturer,
          daysInLab: updateScheduleTypeDto?.daysInLab,
          transitToDentalLab: updateScheduleTypeDto?.transitToDentalLab,
          transitToClient: updateScheduleTypeDto?.transitToClient,
        },
      });

      if (!updateRecord) {
        throw new HttpException(
          'The record could not be updated.',
          HttpStatus.UNAUTHORIZED,
        );
      }

      return {
        status: true,
        message: 'The record has been successfully updated',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(id: string, user: any) {
    try {
      if (user.modelType !== modelTypeRoles.USER) {
        throw new HttpException(
          'Cannot access this resource!',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const data = await this.databaseService.scheduleType.findUnique({
        where: { id },
      });

      if (!data || data.deletedAt) {
        throw new HttpException(
          'Schedule Type does not exist',
          HttpStatus.NOT_FOUND,
        );
      }

      const softDel = await this.databaseService.scheduleType.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      if (!softDel) {
        throw new HttpException(
          'The schedule type could not be deleted.',
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        message: 'Schedule type has been successfully deleted',
        data: softDel,
        success: true,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createpan(createPanDto: CreatePanDto, user: any) {
    try {
      if (user.modelType !== modelTypeRoles.USER) {
        throw new HttpException(
          'Cannot access this resource!',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const newPan = await this.databaseService.pan.create({
        data: {
          panNumber: createPanDto.panNumber,
          scheduleTypeId: createPanDto.scheduleTypeId,
        },
      });

      if (newPan === undefined || !newPan) {
        // TODO document why this block is empty
      
      }
      return {
        message: 'Pan created successfully',
        data: newPan,
        success: true,
      };
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updatepan(id: string, updatePanDto: UpdatePanDto, user: any) {
    try {
      if (user.modelType !== modelTypeRoles.USER) {
        throw new HttpException(
          'Cannot access this resource!',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const updatedPan = await this.databaseService.pan.update({
        where: { id },
        data: {
          panNumber: updatePanDto.panNumber,
          scheduleTypeId: updatePanDto.scheduleTypeId,
        },
      });
      if (updatedPan === undefined || !updatedPan) {
        throw new HttpException('Invalid Id', HttpStatus.UNAUTHORIZED);
      }

      return {
        message: 'Pan updated successfully',
        data: updatedPan,
        success: true,
      };
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
