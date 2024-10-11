import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateCaseDto,
  CreateCaseNotesDto,
  CreateCaseInstructionsDto,
} from './dto/create-case.dto';
import {
  UpdateCaseDto,
  UpdateCaseNotesDto,
  UpdateCaseInstructionsDto,
} from './dto/update-case.dto';
import { DatabaseService } from '../database/database.service';
import {
  queryRequestInput,
  getPatientDto,
  queryRequestInputExport,
  queryRemakeCaseRequestInput,
} from './dto/pagination.dto';
import * as bwipjs from 'bwip-js';
import * as path from 'path';
import { AwsService } from 'src/aws/aws.service';
import { CreateRxCaseDto } from './dto/rx-case.dto';
import { UpdateRxCaseDto } from './dto/update-rx-case.dto';
import {
  DentistCaseStatus,
  ManufacturingCaseStatus,
  modelTypeRoles,
  PRODUCTTYPE,
} from 'src/helper/helper';
import { ImportCaseDto, caseStatusMap } from './dto/import-case.dto';
import {
  CaseStatus,
  InvoiceStatusType,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import { EmailService } from 'src/helper/Emailservice';
import { CreateUpdateMessageCenterDto } from './dto/create-update-caseMessage.dto';
import * as moment from 'moment';
import { TaxjarService } from 'src/taxjar/taxjar.service';
import { CreateAttachmentArrayDto } from './dto/create-Attachment.dto';

@Injectable()
export class CaseService {
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  private statusMap = caseStatusMap;

  generateString(length) {
    let result = ' ';
    const charactersLength = this.characters.length;
    for (let i = 0; i < length; i++) {
      result += this.characters.charAt(
        Math.floor(Math.random() * charactersLength),
      );
    }

    return result;
  }

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly awsServices: AwsService,
    private readonly emailService: EmailService,
    private readonly taxjarService: TaxjarService,
  ) {}
  async create(createCaseDto: CreateCaseDto, userId: string) {
    try {
      const createPatient = await this.databaseService.patient.create({
        data: {
          firstName: createCaseDto.firstName,
          lastName: createCaseDto.lastName,
          addressOne: '',
          addressTwo: '',
          city: '',
          country: '',
          email: '',
          phonne: '',
          postalCode: '',
          province: '',
          state: '',
          dateOfBirth: null,
          age: null,
          dentistId: createCaseDto.dentistId,
        },
      });

      const getPatient = await this.databaseService.patient.findFirst({
        where: {
          firstName: createCaseDto.firstName,
          lastName: createCaseDto.lastName,
          dentistId: createCaseDto.dentistId,
          deletedAt: null,
        },
      });
      if (getPatient) {
        createCaseDto['patientId'] = getPatient.id;
      } else {
        createCaseDto['patientId'] = createPatient.id;
      }
      createCaseDto['barcodeData'] = '';
      createCaseDto['createdBy'] = userId;
      createCaseDto['updatedBy'] = userId;
      let caseItems = createCaseDto.caseItems;
      let caseNotes = createCaseDto.caseNotes;
      let caseInstructions = createCaseDto.caseInstructions;
      delete createCaseDto.caseItems;
      delete createCaseDto.firstName;
      delete createCaseDto.lastName;
      delete createCaseDto.caseNotes;
      delete createCaseDto.caseInstructions;
      const createCaseObject = {
        createdBy: createCaseDto?.createdBy,
        panNum: createCaseDto?.panNum,
        updatedBy: createCaseDto?.updatedBy,
        dentistId: createCaseDto.dentistId,
        dueDate: createCaseDto.dueDate,
        dueShipDate: createCaseDto.dueShipDate,
        receivedDate: createCaseDto.receivedDate,
        level: createCaseDto.level,
        flag: createCaseDto.flag,
        patientId: createPatient.id,
        remakeCaseId: createCaseDto?.remakeCaseId,
        caseTags: createCaseDto?.caseTags,
        doctorId: createCaseDto?.doctorId,
      };

      const tags = createCaseDto.caseTags
        ? createCaseDto.caseTags.split(',').map((tag) => tag.trim())
        : [];

      await Promise.all(
        tags.map((tag) =>
          this.databaseService.caseTag.upsert({
            where: { tags: tag },
            update: {},
            create: { tags: tag },
          }),
        ),
      );
      if (createCaseDto.manufactureId) {
        createCaseObject['manufactureId'] = createCaseDto.manufactureId;
      }

      if (createCaseDto.status) {
        createCaseObject['status'] = createCaseDto.status;
      }
      if (createCaseDto.remakeCaseId) {
        createCaseObject['remakeCaseId'] = createCaseDto.remakeCaseId;
        createCaseObject['status'] = 'RemakeRequest';
      }

      const createCase = await this.databaseService.case.create({
        data: createCaseObject,
      });
      if (createCaseDto.remakeCaseId) {
        createCaseObject['remakeCaseId'] = createCaseDto.remakeCaseId;
        createCaseObject['status'] = 'RemakeRequest';
        await this.databaseService.notification.create({
          data: {
            modelId: createCase.dentistId,
            modelType: modelTypeRoles.DENTIST,
            subject: 'Remake Request Aproved',
            message: `Remake request approved for case ${createCase.caseId}.`,
            notificationType: 'Case',
            notificationTypeId: createCase.id,
            isRead: false,
          },
        });
      }
      try {
        const getBarcdeBuffer = await bwipjs.toBuffer({
          bcid: 'code128',
          text: JSON.stringify(createCase.id),
          scale: 3, // Adjust scale as needed
          includetext: true, // Include human-readable text below the barcode
          textxalign: 'center', // Text alignment
        });
        if (getBarcdeBuffer && getBarcdeBuffer.buffer) {
          const base64Image = getBarcdeBuffer.toString('base64');
          await this.databaseService.case.update({
            where: {
              id: createCase.id,
            },
            data: {
              barcodeData: base64Image,
            },
          });
        }
      } catch (error) {
        console.error('Error in Creating Barcode', error);
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }

      if (caseItems && caseItems.length > 0) {
        for (let index = 0; index < caseItems.length; index++) {
          try {
            const caseItemData = {
              caseId: createCase.id,
              // shadeOne: caseItems[index]?.shadeOne,
              // shadeTwo: caseItems[index]?.shadeTwo,
              // shadeThree: caseItems[index]?.shadeThree,
              shadeType: caseItems[index]?.shadeType,
              // stumpShade: caseItems[index]?.stumpShade,
              tooth: caseItems[index]?.tooth,
              itemId: caseItems[index]?.itemId,
              productTypeId: caseItems[index]?.productTypeId,
            };
            if (
              caseItems[index]?.shadeType === 'No Shade' ||
              caseItems[index]?.shadeType === 'Provide Later'
            ) {
              caseItemData['shadeOne'] = null;
              caseItemData['shadeTwo'] = null;
              caseItemData['shadeThree'] = null;
            } else {
              if (
                caseItems[index]?.shadeOne &&
                caseItems[index]?.shadeOne !== null
              ) {
                caseItemData['shadeOne'] = caseItems[index]?.shadeOne;
              }

              if (
                caseItems[index]?.shadeTwo &&
                caseItems[index]?.shadeTwo !== null
              ) {
                caseItemData['shadeTwo'] = caseItems[index]?.shadeTwo;
              }

              if (
                caseItems[index]?.shadeThree &&
                caseItems[index]?.shadeThree !== null
              ) {
                caseItemData['shadeThree'] = caseItems[index]?.shadeThree;
              }
            }
            caseItemData['stumpShade'] =
              caseItems[index] && caseItems[index].stumpShade
                ? caseItems[index].stumpShade
                : null;

            await this.databaseService.caseItem.create({
              data: caseItemData,
            });
          } catch (error) {
            /** Rollback if case items not create */
            await this.databaseService.case.delete({
              where: { id: createCase.id },
            });

            await this.databaseService.patient.delete({
              where: { id: createPatient.id },
            });

            await this.databaseService.caseItem.deleteMany({
              where: { caseId: createCase.id },
            });
            throw new HttpException(
              'Something went wrong. Please try after sometimes',
              HttpStatus.BAD_REQUEST,
            );
          }
        }
      }

      if (caseNotes && caseNotes.length > 0) {
        for (let index = 0; index < caseNotes.length; index++) {
          try {
            const caseNote = {
              note: caseNotes[index].note,
              caseId: createCase.id,
              createdBy: userId,
              updatedBy: userId,
              updatedAt: new Date(),
            };

            await this.databaseService.caseNotes.create({
              data: caseNote,
            });
          } catch (error) {
            /** Rollback if case items not create */
            await this.databaseService.caseNotes.delete({
              where: { id: createCase.id },
            });

            await this.databaseService.patient.delete({
              where: { id: createPatient.id },
            });

            await this.databaseService.caseItem.deleteMany({
              where: { caseId: createCase.id },
            });

            throw new HttpException(
              'Something went wrong. Please try after sometimes',
              HttpStatus.BAD_REQUEST,
            );
          }
        }
      }

      if (caseInstructions && caseInstructions.length > 0) {
        for (let index = 0; index < caseInstructions.length; index++) {
          try {
            const caseInstruction = {
              note: caseInstructions[index].note,
              caseId: createCase.id,
              createdBy: userId,
              updatedBy: userId,
              updatedAt: new Date(),
            };

            await this.databaseService.caseInstruction.create({
              data: caseInstruction,
            });
          } catch (error) {
            /** Rollback if case items not create */
            await this.databaseService.caseInstruction.delete({
              where: { id: createCase.id },
            });

            await this.databaseService.patient.delete({
              where: { id: createPatient.id },
            });

            await this.databaseService.caseItem.deleteMany({
              where: { caseId: createCase.id },
            });
            throw new HttpException(
              'Something went wrong. Please try after sometimes',
              HttpStatus.BAD_REQUEST,
            );
          }
        }
      }
      this.emailService.caseEntry(createCase);
      this.AutoInvoice(createCase.id);
      return createCase;
    } catch (error) {
      console.error('error in create case service', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async rxcreate(createRxCaseDto: CreateRxCaseDto, userId: any) {
    try {
      const dentistExist = await this.databaseService.dentist.findUnique({
        where: {
          id: createRxCaseDto.dentistId,
        },
      });

      if (!dentistExist) {
        throw { message: 'Dentist is not exist!', error: 'Unauthorized' };
      }

      const newCase = await this.databaseService.case.create({
        data: {
          createdBy: userId,
          updatedBy: userId,
          dentistId: createRxCaseDto.dentistId,
          level: createRxCaseDto.level,
        },
      });

      const getBarcodeBuffer = await bwipjs.toBuffer({
        bcid: 'code128',
        text: JSON.stringify(newCase.id),
        scale: 3,
        includetext: true,
        textxalign: 'center',
      });
      let updateCase;
      if (getBarcodeBuffer && getBarcodeBuffer.buffer) {
        const base64Image = getBarcodeBuffer.toString('base64');
        updateCase = await this.databaseService.case.update({
          where: {
            id: newCase.id,
          },
          data: {
            barcodeData: base64Image,
          },
        });
      }

      this.emailService.sendRxcreatesuccess(updateCase);

      return {
        status: true,
        message: 'Rx-case created successfully',
        data: updateCase,
      };
    } catch (error) {
      console.error('error in create case service', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(query: queryRequestInput, user: any) {
    try {
      const { pageNo, limit, queryString } = query;
      const offset = (pageNo - 1) * +limit;

      const isComplexSearch = queryString && queryString.includes('+');

      const terms = isComplexSearch
        ? queryString.split('+').map((term) => term.trim())
        : [queryString];

      const statusFilter =
        query.status && query.status.length > 0
          ? Array.isArray(query.status)
            ? query.status
            : [query.status]
          : [
              'Draft',
              'IntransitfromClient',
              'DetailsPending',
              'PendingLabQuestion',
              'CheckIn',
              'RemakeRequest',
              'IntransittoManufacturingDept',
              'ReceivedbyManufacturingDept',
              'InManufacturing',
              'ReadyforShipmenttoNextDentalLab',
              'IntransitfromManufacturingDept',
              'ReceivedfromManufacturingDept',
              'InQC',
              'PendingClientShipment',
              'InTransitToClient',
              'OnHold',
              'Cancelled',
              'DuplicateCase',
              'LateCase',
            ];

      const flagFilter =
        query.flag && query.flag.length > 0
          ? Array.isArray(query?.flag)
            ? query.flag
            : [query.flag]
          : [''];

      const searchConditions = terms.map((term) => ({
        OR: [
          { manNotes: { contains: term, mode: 'insensitive' } },
          {
            Pan: {
              panNumber: { contains: term, mode: 'insensitive' },
            },
          },
          { reason: { contains: term, mode: 'insensitive' } },
          { referenceNum: { contains: term, mode: 'insensitive' } },
          { caseId: { contains: term, mode: 'insensitive' } },
          {
            Dentist: {
              accountId: { contains: term, mode: 'insensitive' },
            },
          },
          {
            Patient: {
              OR: [
                { firstName: { contains: term, mode: 'insensitive' } },
                { lastName: { contains: term, mode: 'insensitive' } },
              ],
            },
          },
          { caseTags: { contains: term } },
        ],
      }));

      let whereCondition: any = {
        AND: [],
      };

      if (isComplexSearch) {
        whereCondition.AND.push(...searchConditions);
      } else {
        whereCondition.AND.push({ OR: searchConditions });
      }

      whereCondition.AND.push({ deletedAt: null });

      if (query.startDate && query.endDate) {
        const startDate = moment(query.startDate).toDate();
        const endDate = moment(query.endDate).toDate();
        whereCondition.AND.push({
          OR: [
            { dueDate: { gte: startDate, lte: endDate } },
            { dueShipDate: { gte: startDate, lte: endDate } },
            { createdAt: { gte: startDate, lte: endDate } },
          ],
        });
      }

      if (user.modelType === modelTypeRoles.DENTIST) {
        whereCondition.dentistId = user.modelId;
      } else if (user.modelType === modelTypeRoles.MANUFACTURE) {
        whereCondition.manufactureId = user.modelId;
      }

      if (query.status) {
        whereCondition['status'] = { in: statusFilter };
      }

      if (query.flag) {
        whereCondition['flag'] = { in: flagFilter };
      }

      if (query.dentistId) {
        whereCondition['dentistId'] = query.dentistId;
      }

      if (query.shippingFlagtimeStamp) {
        whereCondition['shippingFlagtimeStamp'] = null;
      }

      if (query.manufactureId) {
        whereCondition['manufactureId'] = query.manufactureId;
      }

      const totalCount = await this.databaseService.case.count({
        where: whereCondition,
      });

      const dentistSelectField = {
        id: true,
        accountId: true,
      };

      const caseInstructionSelectField = {
        id: true,
        note: true,
      };

      const orderCheck = {
        orderBy: query.orderBy ? query.orderBy : 'createdAt',
        orderType: query.orderType ? query.orderType : 'desc',
      };
      const order = {
        [`${orderCheck.orderBy}`]: orderCheck.orderType,
      };
      this.databaseService.case.findMany({
        where: {
          Manufacture: {},
        },
      });
      const casesData = await this.databaseService.case.findMany({
        where: whereCondition,
        include: {
          Dentist: { select: dentistSelectField },
          Manufacture: true,
          Patient: true,
          Pan: true,
          // ScheduleType: true,
          // CaseInstruction: true,
          remakeCase: true,
          CaseItem: {
            include: {
              Item: true,
              ProductType: true,
              shadeOneId: true,
              shadeTwoId: true,
              shadeThreeId: true,
              stumpShadeId: true,
            },
          },
          CaseNotes: {
            where: {
              deletedAt: null,
            },
          },
          CaseAttachments: {
            include: {
              Attachments: true,
            },
          },
          CaseDoctorPreferences: true,
          CaseInstruction: {
            where: {
              deletedAt: null,
            },
          },
          CaseMasseageCenter: {
            include: {
              Dentist: true,
              Manufacture: true,
            },
          },
        },
        take: +limit,
        skip: offset,
        orderBy: order,
      });

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = pageNo < totalPages;
      if (!casesData) {
        throw {
          message: 'Cases are not fetch!',
          error: 'Unauthorized',
        };
      }
      return {
        status: true,
        message: 'List of all Cases',
        data: {
          data: casesData,
          total: totalCount,
          next: hasNextPage ? +pageNo + 1 : null,
        },
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: string) {
    try {
      const dentistSelectField = {
        id: true,
        accountId: true,
      };

      const caseInstructionSelectField = {
        id: true,
        note: true,
      };
      return await this.databaseService.case.findFirst({
        where: { id },
        include: {
          Dentist: { select: dentistSelectField },
          Patient: true,
          CaseAttachments: {
            select: {
              id: true,
              count: true,
            },
            include: {
              Attachments: true,
            },
          },
          // ScheduleType: true,
          // CaseInstruction: { select: caseInstructionSelectField },
        },
      });
    } catch (error) {
      console.error('error in get one case service', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateRx(id: string, updateRxCase: UpdateRxCaseDto, userId: string) {
    try {
      const getCase = await this.databaseService.case.findFirst({
        where: { id },
      });
      if (!getCase) {
        throw { message: 'Case is not exist!', error: 'Unauthorized' };
      }

      if (!updateRxCase.patientId || updateRxCase.patientId === null) {
        const newPatient = await this.databaseService.patient.create({
          data: {
            firstName: updateRxCase.firstName || '',
            lastName: updateRxCase.lastName || '',
            dentistId: getCase.dentistId,
            dateOfBirth: updateRxCase?.dateOfBirth || null,
            age: updateRxCase?.age || null,
            gender: updateRxCase.gender || 'MALE',
          },
        });

        updateRxCase.patientId = newPatient.id;
      }

      const UpdateRxCase = await this.databaseService.case.update({
        where: {
          id: id,
        },
        data: {
          patientId: updateRxCase.patientId,
          dueDate: updateRxCase?.deliverBy || new Date(),
          receivedDate: updateRxCase?.rxDate || new Date(),
          updatedBy: userId,
        },
      });

      let caseItems = updateRxCase.caseItems;
      if (caseItems && caseItems.length > 0) {
        for (let index = 0; index < caseItems.length; index++) {
          await this.databaseService.caseItem.create({
            data: {
              caseId: getCase.id,
              shadeOne: caseItems[index]?.shadeOne,
              shadeTwo: caseItems[index]?.shadeTwo,
              shadeThree: caseItems[index]?.shadeThree,
              shadeType: caseItems[index]?.shadeType,
              stumpShade: caseItems[index]?.stumpShade,
              tooth: caseItems[index]?.tooth,
              itemId: caseItems[index]?.itemId,
              productTypeId: caseItems[index]?.productTypeId,
              updatedAt: new Date(),
            },
          });
        }
      }

      let caseInstructions = updateRxCase.caseInstructions;
      if (caseInstructions && caseInstructions.length > 0) {
        for (let index = 0; index < caseInstructions.length; index++) {
          const caseInstruction = {
            note: caseInstructions[index]?.note,
            caseId: getCase.id,
            createdBy: userId,
            updatedBy: userId,
            updatedAt: new Date(),
          };

          await this.databaseService.caseInstruction.create({
            data: caseInstruction,
          });
        }
      }

      return {
        status: true,
        message: 'Rx created successfully!',
        data: UpdateRxCase,
      };
    } catch (error) {
      console.error('error in update case service', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  async update(id: string, updateCaseDto: UpdateCaseDto, userId: String) {
    try {
      const getCase = await this.databaseService.case.findFirst({
        where: { id },
      });
      if (getCase) {
        let updateObject = new Object();

        if (updateCaseDto.firstName && updateCaseDto.lastName) {
          if (getCase.patientId) {
            await this.databaseService.patient.update({
              where: {
                id: getCase.patientId,
              },
              data: {
                firstName: updateCaseDto.firstName,
                lastName: updateCaseDto.lastName,
                updatedAt: new Date(),
              },
            });
          } else {
            const newPatient = await this.databaseService.patient.create({
              data: {
                firstName: updateCaseDto.firstName,
                lastName: updateCaseDto.lastName,
                addressOne: '',
                addressTwo: '',
                city: '',
                country: '',
                email: '',
                phonne: '',
                postalCode: '',
                province: '',
                state: '',
                dateOfBirth: null,
                age: null,
                dentistId: getCase.dentistId,
                updatedAt: new Date(),
              },
            });
            updateObject['patientId'] = newPatient.id;
          }
        }

        if (updateCaseDto && updateCaseDto.isRemakeCase === true) {
          let caseNotesForRemake = updateCaseDto?.caseNotes;
          if (caseNotesForRemake && caseNotesForRemake?.length > 0) {
            for (let index = 0; index < caseNotesForRemake.length; index++) {
              try {
                const createNotes = await this.databaseService.caseNotes.create(
                  {
                    data: {
                      caseId: id,
                      note: caseNotesForRemake[index]?.note,
                      createdAt: new Date(),
                      createdBy: userId as string,
                    },
                  },
                );
              } catch (error) {
                throw new HttpException(
                  'Something went wrong. Please try after sometimes',
                  HttpStatus.BAD_REQUEST,
                );
              }
            }
          } else {
            throw new HttpException(
              'Provide at least one notes for remake request.',
              HttpStatus.BAD_REQUEST,
            );
          }
          const caseUpdateRemakeRequest =
            await this.databaseService.case.update({
              where: { id },
              data: { status: 'RemakeRequest' },
            });
          await this.databaseService.notification.create({
            data: {
              modelId: userId as string,
              modelType: modelTypeRoles.USER,
              subject: 'Remake Request',
              message: `Remake request created for case ${getCase.caseId}.`,
              notificationType: 'Case',
              notificationTypeId: getCase.id,
              isRead: false,
            },
          });
          return {
            data: caseUpdateRemakeRequest,
            message: 'Case remake requeste created successfully.',
          };
        }

        if (updateCaseDto.remakeStatus) {
          updateObject['remakeStatus'] = updateCaseDto.remakeStatus;
        }
        if (updateCaseDto.level) {
          updateObject['level'] = updateCaseDto.level;
        }
        if (
          updateCaseDto.status === CaseStatus.PendingForNextDentalLabshipment ||
          updateCaseDto.status ===
            CaseStatus.PendingManufacturingDepartmentShipment ||
          updateCaseDto.status === CaseStatus.PendingClientShipment ||
          updateCaseDto.status === CaseStatus.ReadyforShipmenttoNextDentalLab
        ) {
          updateObject['shippingFlagtimeStamp'] = null;
        }
        if (updateCaseDto.dentistId) {
          updateObject['dentistId'] = updateCaseDto.dentistId;
        }
        if (updateCaseDto.doctorId) {
          updateObject['doctorId'] = updateCaseDto.doctorId;
        }

        if (updateCaseDto.manufactureId) {
          updateObject['manufactureId'] = updateCaseDto.manufactureId;
        }

        if (updateCaseDto.remakeCaseId) {
          updateObject['remakeCaseId'] = updateCaseDto.remakeCaseId;
        }

        if (updateCaseDto.caseTags) {
          updateObject['caseTags'] = updateCaseDto.caseTags;
        }

        if (updateCaseDto.onHoldDate) {
          updateObject['onHoldDate'] = updateCaseDto.onHoldDate;
        }

        if (updateCaseDto.holdActionDate) {
          updateObject['holdActionDate'] = updateCaseDto.holdActionDate;
          updateObject['onHoldDate'] = new Date();
        }

        if (updateCaseDto.onHoldReason) {
          updateObject['onHoldReason'] = updateCaseDto.onHoldReason;
        }

        if (updateCaseDto.holdResolveReason) {
          updateObject['holdResolveReason'] = updateCaseDto.holdResolveReason;
        }
        if (updateCaseDto.receivedDate) {
          updateObject['receivedDate'] = updateCaseDto.receivedDate;
        }

        if (updateCaseDto.dueShipDate) {
          updateObject['dueShipDate'] = updateCaseDto.dueShipDate;
        }

        if (updateCaseDto.dueDate) {
          updateObject['dueDate'] = updateCaseDto.dueDate;
        }

        if (updateCaseDto.completedDate) {
          updateObject['completedDate'] = updateCaseDto.completedDate;
        }

        if (updateCaseDto.flag) {
          updateObject['flag'] = updateCaseDto.flag;
        }

        if (updateCaseDto.panNum) {
          updateObject['panNum'] = updateCaseDto.panNum;
        }

        if (updateCaseDto.status) {
          updateObject['status'] = updateCaseDto.status;
          const processMap = {
            [CaseStatus.CheckIn]: 'Received',
            [CaseStatus.IntransittoManufacturingDept]: 'Starting Procedure',
            [CaseStatus.ReceivedbyManufacturingDept]: 'Starting Procedure',
            [CaseStatus.InManufacturing]: 'In Manufacturing',
            [CaseStatus.IntransitfromManufacturingDept]: 'Final Procedure',
            [CaseStatus.ReceivedfromManufacturingDept]: 'Final Procedure',
            [CaseStatus.InTransitToClient]: 'Completed',
          };

          const processName = processMap[updateCaseDto.status];

          if (processName) {
            console.info(
              '<<<<<<<<<<update status?>>>>>>>>>>>',
              updateCaseDto.status,
            );

            const caseHistory = {
              caseId: id,
              status: updateCaseDto.status,
              processName,
            };

            const caseHistoryExist =
              await this.databaseService.caseStatusHistory.findFirst({
                where: {
                  caseId: id,
                  status: updateCaseDto.status,
                },
              });

            if (!caseHistoryExist) {
              await this.databaseService.caseStatusHistory.create({
                data: caseHistory,
              });
              console.info('Case history added:', caseHistory);
            }
          }
        }

        if (updateCaseDto.scheduleTypeId) {
          updateObject['scheduleTypeId'] = updateCaseDto.scheduleTypeId;
        }

        if (updateCaseDto.reason) {
          updateObject['reason'] = updateCaseDto.reason;
        }

        if (updateCaseDto.manNotes) {
          updateObject['manNotes'] = updateCaseDto.manNotes;
        }

        if (updateCaseDto.isCanceledFromOnHold) {
          updateObject['isCanceledFromOnHold'] =
            updateCaseDto.isCanceledFromOnHold;
        }

        updateObject['updatedBy'] = userId;

        const caseUpdate = await this.databaseService.case.update({
          where: { id },
          data: updateObject,
        });

        console.info(
          '<<<<<<<<<<update status?>>>>>>>>>>>',
          updateCaseDto.status,
        );

        if (updateCaseDto.status) {
          if (
            updateCaseDto.status === CaseStatus.InTransitToClient ||
            updateCaseDto.status === CaseStatus.Completed
          ) {
            const invoiceStatusUpdate =
              await this.databaseService.invoice.updateMany({
                where: {
                  caseId: id,
                },
                data: {
                  status: InvoiceStatusType.OPEN,
                  updatedAt: new Date(),
                },
              });
            console.info(
              '<<<<<<<<<<update status?>>>>>>>>>>>',
              invoiceStatusUpdate,
            );
          }
          this.emailService.caseStatusUpdate(userId, caseUpdate);
        }

        if (caseUpdate) {
          let caseInstructions = updateCaseDto?.caseInstructions;

          if (caseInstructions && caseInstructions?.length > 0) {
            for (let index = 0; index < caseInstructions.length; index++) {
              if (caseInstructions[index].id) {
                const updateInstruction =
                  await this.databaseService.caseInstruction.update({
                    where: {
                      id: caseInstructions[index].id,
                    },
                    data: {
                      note: caseInstructions[index].note,
                      updatedBy: `${userId}`,
                      updatedAt: new Date(),
                    },
                  });
              } else {
                const createInstruction =
                  await this.databaseService.caseInstruction.create({
                    data: {
                      note: caseInstructions[index].note,
                      caseId: id,
                      createdBy: `${userId}`,
                      createdAt: new Date(),
                    },
                  });
              }
            }
          }
          let caseItems = updateCaseDto?.caseItems;

          if (caseItems && caseItems?.length > 0) {
            for (let index = 0; index < caseItems.length; index++) {
              try {
                if (caseItems[index].id) {
                  const caseItemUpdateObject = {
                    caseId: caseUpdate.id,
                    tooth: caseItems[index]?.tooth,
                    itemId: caseItems[index]?.itemId,
                    productTypeId: caseItems[index]?.productTypeId,
                    shadeType: caseItems[index]?.shadeType,
                  };
                  if (
                    caseItems[index]?.shadeType === 'No Shade' ||
                    caseItems[index]?.shadeType === 'Provide Later'
                  ) {
                    caseItemUpdateObject['shadeOne'] = null;
                    caseItemUpdateObject['shadeTwo'] = null;
                    caseItemUpdateObject['shadeThree'] = null;
                  } else {
                    if (
                      caseItems[index]?.shadeOne &&
                      caseItems[index]?.shadeOne !== null
                    ) {
                      caseItemUpdateObject['shadeOne'] =
                        caseItems[index]?.shadeOne;
                    }

                    if (
                      caseItems[index]?.shadeTwo &&
                      caseItems[index]?.shadeTwo !== null
                    ) {
                      caseItemUpdateObject['shadeTwo'] =
                        caseItems[index]?.shadeTwo;
                    }

                    if (
                      caseItems[index]?.shadeThree &&
                      caseItems[index]?.shadeThree !== null
                    ) {
                      caseItemUpdateObject['shadeThree'] =
                        caseItems[index]?.shadeThree;
                    }
                  }
                  caseItemUpdateObject['stumpShade'] =
                    caseItems[index] && caseItems[index].stumpShade
                      ? caseItems[index].stumpShade
                      : null;

                  const updateCaseItem =
                    await this.databaseService.caseItem.update({
                      where: { id: caseItems[index].id },
                      data: caseItemUpdateObject,
                    });
                } else {
                  const caseItemCreateObject = {
                    caseId: caseUpdate.id,
                    tooth: caseItems[index]?.tooth,
                    itemId: caseItems[index]?.itemId,
                    productTypeId: caseItems[index]?.productTypeId,
                    shadeType: caseItems[index]?.shadeType,
                  };

                  if (
                    caseItems[index]?.shadeType === 'No Shade' ||
                    caseItems[index]?.shadeType === 'Provide Later'
                  ) {
                    caseItemCreateObject['shadeOne'] = null;
                    caseItemCreateObject['shadeTwo'] = null;
                    caseItemCreateObject['shadeThree'] = null;
                  } else {
                    if (
                      caseItems[index]?.shadeOne &&
                      caseItems[index]?.shadeOne !== null
                    ) {
                      caseItemCreateObject['shadeOne'] =
                        caseItems[index]?.shadeOne;
                    }

                    if (
                      caseItems[index]?.shadeTwo &&
                      caseItems[index]?.shadeTwo !== null
                    ) {
                      caseItemCreateObject['shadeTwo'] =
                        caseItems[index]?.shadeTwo;
                    }

                    if (
                      caseItems[index]?.shadeThree &&
                      caseItems[index]?.shadeThree !== null
                    ) {
                      caseItemCreateObject['shadeThree'] =
                        caseItems[index]?.shadeThree;
                    }
                  }
                  caseItemCreateObject['stumpShade'] =
                    caseItems[index] && caseItems[index].stumpShade
                      ? caseItems[index].stumpShade
                      : null;

                  const createCaseItem =
                    await this.databaseService.caseItem.create({
                      data: caseItemCreateObject,
                    });
                }
              } catch (error) {
                console.info('Error In update CaseItems', error);
                throw new HttpException(
                  'Something went wrong. Please try after sometimes',
                  HttpStatus.BAD_REQUEST,
                );
              }
            }
          }

          let caseNotes = updateCaseDto?.caseNotes;

          if (caseNotes && caseNotes?.length > 0) {
            for (let index = 0; index < caseNotes.length; index++) {
              try {
                if (caseNotes[index].id) {
                  const updateNotes =
                    await this.databaseService.caseNotes.update({
                      where: { id: caseNotes[index].id },
                      data: {
                        note: caseNotes[index]?.note,
                        updatedAt: new Date(),
                        updatedBy: userId as string,
                      },
                    });
                } else {
                  const createNotes =
                    await this.databaseService.caseNotes.create({
                      data: {
                        caseId: id,
                        note: caseNotes[index]?.note,
                        createdAt: new Date(),
                        createdBy: userId as string,
                      },
                    });
                }
              } catch (error) {
                console.info('Error In update Case Notes', error);
                throw new HttpException(
                  'Something went wrong. Please try after sometimes',
                  HttpStatus.BAD_REQUEST,
                );
              }
            }
          }

          await this.AutoInvoice(caseUpdate.id);

          return {
            data: caseUpdate,
            message: 'Case Updated successfully.',
          };
        } else {
          throw new HttpException(
            'Something went wrong when case details update',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        throw new HttpException(
          'Case not found with provided id',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      console.error('error in update case service', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async uploadAttachment(caseId, files, userId: String) {
    try {
      const getCase = await this.databaseService.case.findFirst({
        where: { id: caseId },
      });
      if (getCase) {
        const finalInputData = await this.groupingAttachment(files);
        console.info('finalInputData', finalInputData);
        const responseData = await this.createAttachmentData(
          caseId,
          finalInputData,
          userId,
        );
        if (responseData.success) {
          return responseData.data;
        } else {
          throw new HttpException(responseData.message, HttpStatus.BAD_REQUEST);
        }
      } else {
        throw new HttpException(
          'Case not found with provided id',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      console.error('error in uploadAttachment case service', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async removeAttachmentOnUpdateTime(attachmentId: string) {
    try {
      const getAttachment = await this.databaseService.attachments.findFirst({
        where: {
          id: attachmentId,
          deletedAt: null,
        },
        include: {
          CaseAttachments: true,
        },
      });
      if (!getAttachment) {
        throw new HttpException('Attachment not found', HttpStatus.BAD_REQUEST);
      }

      const removeAttachmentFromAWS = await this.awsServices.deleteFile(
        `${process.env.AwsBucketName}/${getAttachment.CaseAttachments.category}/${getAttachment.id}`,
        getAttachment.fileName,
      );

      if (removeAttachmentFromAWS && removeAttachmentFromAWS.success) {
        // attchment delete from database
        const removeAttachment = await this.databaseService.attachments.delete({
          where: {
            id: attachmentId,
          },
        });

        const remainingAttachments =
          await this.databaseService.attachments.findMany({
            where: {
              caseAttachmentId: getAttachment.CaseAttachments.id,
              deletedAt: null, // Check for active attachments only
            },
          });

        // If no attachments remain, delete the CaseAttachment
        if (remainingAttachments.length === 0) {
          await this.databaseService.caseAttachments.delete({
            where: {
              id: getAttachment.CaseAttachments.id,
            },
          });
        }
        return {
          data: removeAttachment,
          message: removeAttachmentFromAWS.message,
        };
      }

      return {
        data: {},
        message: removeAttachmentFromAWS.success,
      };
    } catch (error) {
      console.error('error in updateOrRemoveAttachment case service', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createAttachmentData(caseId, finalInputData, userId) {
    try {
      const response = [];
      if (finalInputData && finalInputData.length > 0) {
        for (let index = 0; index < finalInputData.length; index++) {
          let createCaseAttachment;

          const existingCaseAttachment =
            await this.databaseService.caseAttachments.findFirst({
              where: {
                caseId: caseId,
                category: finalInputData[index].title,
              },
            });

          if (!existingCaseAttachment) {
            createCaseAttachment =
              await this.databaseService.caseAttachments.create({
                data: {
                  caseId: caseId,
                  category: finalInputData[index].title,
                  createdBy: userId,
                  count: parseInt(finalInputData[index].count),
                },
              });
            response.push(createCaseAttachment); // Push to response array
          } else {
            await this.databaseService.caseAttachments.update({
              data: {
                count: parseInt(finalInputData[index].count),
              },
              where: {
                id: existingCaseAttachment.id,
              },
            });
            createCaseAttachment = existingCaseAttachment;
            console.info(
              `Case attachment already exists for caseId: ${caseId} and category: ${finalInputData[index].title}`,
            );
          }
          for (
            let attachmentIndex = 0;
            attachmentIndex < finalInputData[index].attachment.length;
            attachmentIndex++
          ) {
            let fileName =
              finalInputData[index].attachment[attachmentIndex].originalname;

            let fileType =
              finalInputData[index].attachment[attachmentIndex].mimetype;

            let fileSize = (
              finalInputData[index].attachment[attachmentIndex].size / 1000
            ).toString();
            let fileBuffer =
              finalInputData[index].attachment[attachmentIndex].buffer;

            let newPath = path.join(
              __dirname,
              '../../',
              'src/case/attachments',
            );

            let filePath = `${newPath}/${fileName}`;
            // let filePath = path.join(currentDirectory, 'attachments', fileName);
            // Write the buffer data to the file
            const attachmentCreateObject = {
              caseId: caseId,
              caseAttachmentId: createCaseAttachment.id,
              fileName,
              fileType,
              fileUrl: '',
              fileSize,
              createdBy: userId,
            };
            const createAttachment =
              await this.databaseService.attachments.create({
                data: attachmentCreateObject,
              });
            let s3Object = {
              bucket: `${process.env.AwsBucketName}/${createCaseAttachment.category}/${createAttachment.id}`,
              name: createAttachment.fileName,
              file: fileBuffer,
            };
            let uploadOnS3 = await this.awsServices.uploadOnS3(s3Object);
            if (uploadOnS3 && uploadOnS3.Location) {
              await this.databaseService.attachments.update({
                where: {
                  id: createAttachment.id,
                },
                data: { fileUrl: uploadOnS3.Location },
              });
            }
            // fs.writeFile(filePath, fileBuffer, async (err) => {
            //   if (err) {
            //     console.error('Error writing file:', err);
            //   } else {
            //     const attachmentCreateObject = {
            //       caseId: caseId,
            //       category: finalInputData[index].title,
            //       fileName,
            //       fileType,
            //       fileUrl: filePath,
            //       fileSize,
            //     };
            //     const createAttachment =
            //       await this.databaseService.caseAttachments.create({
            //         data: attachmentCreateObject,
            //       });
            //     response.push(createAttachment);
            //     console.info('Buffer data has been written to', filePath);
            //   }
            // });
          }
        }
        return {
          success: true,
          data: response,
          message: 'Attachment created successfully.',
        };
      } else {
        return {
          success: false,
          data: [],
          message: 'Attachment data required.',
        };
      }
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message,
      };
    }
  }

  async getPresignedUrl(id: string) {
    try {
      const getAttachment = await this.databaseService.attachments.findFirst({
        where: {
          id,
        },
      });
      if (getAttachment) {
        const parsedUrl = new URL(getAttachment.fileUrl);

        const bucketName = parsedUrl.hostname.split('.')[0];
        const objectKey = decodeURIComponent(parsedUrl.pathname.slice(1));
        const data = {
          bucket: bucketName,
          key: objectKey,
        };
        const getPresignedUrlData =
          await this.awsServices.getPresignedUrl(data);

        if (getPresignedUrlData && getPresignedUrlData.success) {
          return {
            success: true,
            data: getPresignedUrlData.data,
            message: 'Url generated',
          };
        } else {
          throw new HttpException(
            getPresignedUrlData.message,
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        throw new HttpException('Id invalid', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async groupingAttachment(data) {
    const groupingAttachmentData = data.reduce((acc, curr) => {
      console.info('>>>🙌🙌', acc, curr.count);

      const index = acc.findIndex((item) => item.title === curr.fieldname);
      if (index !== -1) {
        acc[index].attachment.push({
          originalname: curr.originalname,
          encoding: curr.encoding,
          mimetype: curr.mimetype,
          buffer: curr.buffer,
          size: curr.size,
        });
      } else {
        acc.push({
          title: curr.fieldname,
          count: curr.count,
          attachment: [
            {
              originalname: curr.originalname,
              encoding: curr.encoding,
              mimetype: curr.mimetype,
              buffer: curr.buffer,
              size: curr.size,
            },
          ],
        });
      }
      return acc;
    }, []);
    return groupingAttachmentData;
  }

  async get(id: string, user: any) {
    try {
      const getCase = await this.databaseService.case.findFirst({
        where: { id },
        include: {
          Dentist: true,
          Manufacture: true,
          Patient: true,
          CaseItem: {
            include: {
              Item: {
                include: {
                  designGroup: true,
                },
              },
              ProductType: true,
              shadeOneId: true,
              shadeTwoId: true,
              shadeThreeId: true,
              stumpShadeId: true,
            },
          },
          CaseNotes: {
            where: {
              deletedAt: null,
            },
            include: {
              CreatedBy: true,
              UpdatedBy: true,
            },
          },
          CaseAttachments: {
            include: {
              Attachments: true,
            },
          },
          CaseDoctorPreferences: true,
          remakeCase: true,
          CaseInstruction: {
            where: {
              deletedAt: null,
            },
            include: {
              CreatedBy: true,
              UpdatedBy: true,
            },
          },
          CaseMasseageCenter: {
            include: {
              Dentist: true,
              Manufacture: true,
            },
          },
          Pan: {
            include: {
              scheduleType: true,
            },
          },
          CaseStatusHistory: true,
          scheduleType: true,
        },
      });

      if (!getCase) {
        throw new HttpException('Invalid case ID', HttpStatus.UNAUTHORIZED);
      }

      if (user.modelType === modelTypeRoles.DENTIST) {
        if (user.modelId !== getCase.dentistId)
          throw {
            message: 'Not authorized to access this case',
            error: 'Unauthorized',
            status: 401,
          };
      }
      if (user.modelType === modelTypeRoles.MANUFACTURE) {
        if (user.modelId !== getCase.manufactureId)
          throw {
            message: 'Not authorized to access this case',
            error: 'Unauthorized',
            status: 401,
          };
      }

      let getPreferences = [];
      if (getCase.doctorId) {
        getPreferences = await this.databaseService.preference_doctor.findMany({
          include: { Preference: true },
          where: {
            doctorId: getCase.doctorId,
            deletedAt: null,
          },
        });
      }

      // Return the case details along with preferences
      return { ...getCase, getPreferences };
    } catch (error) {
      console.error('Error in get case service:', error);
      throw new HttpException(
        error.message,
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getBarcode(caseId: string) {
    try {
      const caseDetails = await this.databaseService.case.findFirst({
        where: {
          OR: [{ id: caseId }, { caseId: caseId }],
          status: CaseStatus.PendingForNextDentalLabshipment,
        },
        select: {
          id: true,
          caseId: true,
          onHoldDate: true,
          receivedDate: true,
          dueShipDate: true,
          dueDate: true,
          Dentist: {
            select: {
              id: true,
              accountId: true,
              InternalNotes: true,
              shippingPreferenceChoice: true,
            },
          },
          Patient: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              CaseItem: true,
            },
          },
          Pan: {
            select: {
              panNumber: true,
            },
          },
        },
      });

      if (!caseDetails) {
        throw new HttpException(
          'Please enter the valid Case ID',
          HttpStatus.NOT_FOUND,
        );
      }

      // Return the case details with item count
      return {
        status: true,
        ...caseDetails,
        caseItemCount: caseDetails._count.CaseItem,
      };
    } catch (error) {
      console.error('Error in getBarcode service:', error.message);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createCaseNotes(
    caseId: string,
    createCaseNotesDto: CreateCaseNotesDto,
    userId,
  ) {
    try {
      const getCase = await this.databaseService.case.findFirst({
        where: { id: caseId, deletedAt: null },
      });

      if (getCase) {
        const response = [];
        for (
          let index = 0;
          index < createCaseNotesDto.caseNotes.length;
          index++
        ) {
          const createCaseNotes = await this.databaseService.caseNotes.create({
            data: {
              note: createCaseNotesDto.caseNotes[index].note,
              caseId: caseId,
              createdBy: userId,
              createdAt: new Date(),
            },
          });
          response.push(createCaseNotes);
        }

        return response;
      } else {
        throw new HttpException('Invalid case id', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error('error in create case notes', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async createCaseInstruction(
    caseId: string,
    createCaseInstructionsDto: CreateCaseInstructionsDto,
    userId,
  ) {
    try {
      const getCase = await this.databaseService.case.findFirst({
        where: { id: caseId, deletedAt: null },
      });
      if (getCase) {
        const response = [];
        for (
          let index = 0;
          index < createCaseInstructionsDto.caseInstructions.length;
          index++
        ) {
          const createCaseInstruction =
            await this.databaseService.caseInstruction.create({
              data: {
                note: createCaseInstructionsDto.caseInstructions[index].note,
                caseId: caseId,
                createdBy: userId,
                createdAt: new Date(),
              },
            });
          response.push(createCaseInstruction);
        }
        return response;
      } else {
        throw new HttpException('Invalid case id', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error('error in create case instruction', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateCaseNotes(
    caseId: string,
    updateCaseNotesDto: UpdateCaseNotesDto,
    userId,
  ) {
    try {
      const getCase = await this.databaseService.case.findFirst({
        where: { id: caseId, deletedAt: null },
      });
      if (getCase) {
        const response = [];
        for (
          let index = 0;
          index < updateCaseNotesDto.caseNotes.length;
          index++
        ) {
          const getNotes = await this.databaseService.caseNotes.findFirst({
            where: {
              deletedAt: null,
              createdBy: userId,
              id: updateCaseNotesDto.caseNotes[index].id,
            },
          });
          if (getNotes) {
            const updateCaseNotes = await this.databaseService.caseNotes.update(
              {
                where: {
                  id: getNotes.id,
                },
                data: {
                  note: updateCaseNotesDto.caseNotes[index].note,
                  updatedBy: userId,
                  updatedAt: new Date(),
                },
              },
            );
            response.push(updateCaseNotes);
          } else {
            console.info(
              'Invalid Case Note Id or Case not created by login user.',
              updateCaseNotesDto.caseNotes[index].id,
            );
          }
        }

        return response;
      } else {
        throw new HttpException('Invalid case id', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error('error in update case notes', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateAttachmentCount(
    createAttachmentArrayDto: CreateAttachmentArrayDto,
    user: any,
  ) {
    try {
      const results = [];

      const caseId = createAttachmentArrayDto.caseId;

      for (const createAttachmentDto of createAttachmentArrayDto.attachments) {
        let updatedAttachment = null;

        console.info('Processing attachment:', createAttachmentDto);

        // Check if attachment exists by id
        if (createAttachmentDto?.id) {
          const existingAttachment =
            await this.databaseService.caseAttachments.findFirst({
              where: { id: createAttachmentDto.id },
            });

          if (!existingAttachment) {
            throw new HttpException(
              `Attachment with ID ${createAttachmentDto.id} not found`,
              HttpStatus.NOT_FOUND,
            );
          }

          // Update existing attachment
          updatedAttachment = await this.databaseService.caseAttachments.update(
            {
              where: { id: createAttachmentDto.id },
              data: {
                count: createAttachmentDto.count,
                updatedBy: user.id,
              },
            },
          );
        } else {
          // Create a new attachment if `id` is not provided
          updatedAttachment = await this.databaseService.caseAttachments.create(
            {
              data: {
                caseId: caseId,
                category: createAttachmentDto.category,
                count: createAttachmentDto.count,
                createdBy: user.id,
              },
            },
          );
        }
        results.push(updatedAttachment);
      }

      return {
        status: true,
        data: results, // Return the array of updated/created attachments
        message: 'Attachment count updated successfully for all items',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateCaseInstructions(
    caseId: string,
    updateCaseInstructionsDto: UpdateCaseInstructionsDto,
    userId,
  ) {
    try {
      const getCase = await this.databaseService.case.findFirst({
        where: { id: caseId, deletedAt: null },
      });
      if (getCase) {
        const response = [];
        for (
          let index = 0;
          index < updateCaseInstructionsDto.caseInstructions.length;
          index++
        ) {
          const getInstruction =
            await this.databaseService.caseInstruction.findFirst({
              where: {
                deletedAt: null,
                createdBy: userId,
                id: updateCaseInstructionsDto.caseInstructions[index].id,
              },
            });
          if (getInstruction) {
            const updateCaseInstruction =
              await this.databaseService.caseInstruction.update({
                where: {
                  id: getInstruction.id,
                },
                data: {
                  note: updateCaseInstructionsDto.caseInstructions[index].note,
                  updatedBy: userId,
                  updatedAt: new Date(),
                },
              });
            response.push(updateCaseInstruction);
          } else {
            console.info(
              'Invalid Case Instruction Id or Case Instruction not created by login user.',
              updateCaseInstructionsDto.caseInstructions[index].id,
            );
          }
        }
        return response;
      } else {
        throw new HttpException('Invalid case id', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error('error in update case notes', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getCaseNotesList(caseId: string, user: any) {
    try {
      const getCase = await this.databaseService.case.findFirst({
        where: { id: caseId },
      });

      if (getCase) {
        const getList = await this.databaseService.caseNotes.findMany({
          where: {
            caseId: caseId,
            deletedAt: null,
          },
          include: {
            CreatedBy: true,
            UpdatedBy: true,
          },
        });
        return getList;
      } else {
        throw new HttpException('Invalid case id', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error('error in get list case notes service', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getCaseInstructionsList(caseId: string, user: any) {
    try {
      const getCase = await this.databaseService.case.findFirst({
        where: { id: caseId },
      });

      if (getCase) {
        const getList = await this.databaseService.caseInstruction.findMany({
          where: {
            caseId: caseId,
            deletedAt: null,
          },
          include: {
            CreatedBy: true,
            UpdatedBy: true,
          },
        });
        return getList;
      } else {
        throw new HttpException('Invalid case id', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error('error in get list case instruction service', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteCaseNote(caseId: string, noteId: string) {
    try {
      const getCase = await this.databaseService.case.findFirst({
        where: { id: caseId },
      });
      if (getCase) {
        const removeNote = await this.databaseService.caseNotes.update({
          where: {
            id: noteId,
            caseId: caseId,
          },
          data: {
            deletedAt: new Date(),
          },
        });

        const response = {
          data: {},
          message: 'Case note deleted successfully.',
        };
        return response;
      } else {
        throw new HttpException('Invalid case id', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error('error in get list case notes service', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteCaseInstruction(caseId: string, instructionId: string) {
    try {
      const getCase = await this.databaseService.case.findFirst({
        where: { id: caseId },
      });

      if (getCase) {
        const removeInstruction =
          await this.databaseService.caseInstruction.update({
            where: {
              id: instructionId,
              caseId: caseId,
            },
            data: {
              deletedAt: new Date(),
            },
          });

        const response = {
          data: {},
          message: 'Case instruction deleted successfully.',
        };
        return response;
      } else {
        throw new HttpException('Invalid case id', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error('error in get list case notes service', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteCaseItem(id: string) {
    try {
      const getCase = await this.databaseService.caseItem.findFirst({
        where: { id: id },
      });

      const caseItemdelete = await this.databaseService.caseItem.delete({
        where: {
          id: id,
        },
      });

      await this.AutoInvoice(getCase.caseId);
      const response = {
        data: {},
        message: 'Case item deleted successfully.',
      };

      return response;
    } catch (error) {
      console.error('error in get list case notes service', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async getCaseByPatientDetails(query: getPatientDto) {
    try {
      const getPatient = await this.databaseService.patient.findFirst({
        where: {
          firstName: query.firstName,
          lastName: query.lastName,
          deletedAt: null,
          dentistId: query.dentistId,
        },
      });
      if (getPatient) {
        const getCase = await this.databaseService.case.findMany({
          where: {
            dentistId: query.dentistId,
            patientId: getPatient.id,
            deletedAt: null,
          },
        });
        if (getCase) {
          return getCase;
        } else {
          throw new HttpException(
            'Case not found with provided patient and dentist.',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        throw new HttpException(
          'Patient not found with provided details.',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      console.error('error in get getCaseByPatientDetails service', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async importCase(cases: ImportCaseDto[], user: any) {
    try {
      const responseData: any = [];
      for (const caseData of cases) {
        let newCase;
        const result = await this.databaseService.$transaction(
          async (prisma) => {
            if (
              caseData['Received Date'] === '' ||
              caseData['Received Date'] === null
            ) {
              return; // Skip this iteration
            }

            let dentist = await prisma.dentist.findFirst({
              where: { accountId: caseData.Client },
            });

            if (!dentist) {
              const responseNewCase = {
                ...caseData,
                caseId: caseData['Case Ref #'].toString(),
                status: false,
                message: 'Dentist AccountId not exist!',
              };
              responseData.push(responseNewCase);
              return;
            }

            let lastName = '';
            let firstName = '';

            if (caseData?.Patient) {
              [lastName, firstName] = caseData.Patient.split(',').map((s) =>
                s.trim(),
              );
            } else {
              console.error('Patient data is undefined');
            }

            let patient = await prisma.patient.findFirst({
              where: { firstName, lastName },
            });

            if (!patient) {
              patient = await prisma.patient.create({
                data: {
                  firstName: firstName,
                  lastName: lastName,
                  dentistId: dentist.id,
                },
              });
            }

            newCase = await prisma.case.findUnique({
              where: {
                caseId: caseData['Case Ref #'].toString(),
              },
            });
            if (newCase) {
              const existingCase = {
                ...caseData,
                caseId: caseData['Case Ref #'].toString(),
                status: false,
                message: 'Case already exists.',
              };
              responseData.push(existingCase);
              return;
            }
            const receivedDateStr = caseData['Received Date'];
            const dueDateStr = caseData['Due Date'];
            const dueShipDateStr = caseData['Ship Date'];
            const completedDateStr = caseData['Shipped to Client'];

            function parseDate(dateStr: string): Date | null {
              if (!dateStr) return null;

              const [month, day, year] = dateStr.split('/').map(Number);

              if (isNaN(month) || isNaN(day) || isNaN(year)) {
                console.error(`Invalid date string: ${dateStr}`);
                return null;
              }
              const date = new Date(year, month - 1, day);
              if (isNaN(date.getTime())) {
                console.error(`Invalid date: ${date}`);
                return null;
              }

              return date;
            }

            const receivedDate = parseDate(receivedDateStr);
            const dueDate = parseDate(dueDateStr);
            const dueShipDate = parseDate(dueShipDateStr);
            const completedDate = parseDate(completedDateStr);

            if (!newCase) {
              newCase = await prisma.case.create({
                data: {
                  patientId: patient.id,
                  dentistId: dentist.id,
                  manufactureId: null,
                  receivedDate: receivedDate,
                  dueDate: dueDate,
                  dueShipDate: dueShipDate,
                  panNum: caseData['Pan #'],
                  status: this.mapStatus(caseData.Status),
                  caseId: caseData['Case Ref #'].toString(),
                  barcodeData: caseData['DYMO Barcode'].toString(),
                  completedDate: completedDate,
                  updatedBy: user.id,
                  updatedAt: new Date(),
                  remakeCaseId: null,
                  level: caseData['Level'].toString().trim(),
                  createdBy: user.id,
                  CaseInstruction: caseData['Special Instructions']
                    ? {
                        create: {
                          note: caseData['Special Instructions'],
                          updatedAt: new Date(),
                          createdBy: user.id,
                        },
                      }
                    : undefined,
                },
              });

              const responseNewCase = {
                ...newCase,
                message: 'Case created successfully.',
              };
              responseData.push(responseNewCase);

              const barcodeObject = newCase.id;

              const getBarcodeBuffer = await bwipjs.toBuffer({
                bcid: 'code128',
                text: JSON.stringify(barcodeObject),
                scale: 3,
                includetext: true,
                textxalign: 'center',
              });
              let updateCase;
              if (getBarcodeBuffer && getBarcodeBuffer.buffer) {
                const base64Image = getBarcodeBuffer.toString('base64');
                updateCase = await prisma.case.update({
                  where: {
                    id: newCase.id,
                  },
                  data: {
                    barcodeData: base64Image,
                  },
                });
              }
            }

            let item = await prisma.item.findFirst({
              where: { name: caseData.Restoration },
            });

            if (!item) {
              item = await prisma.item.create({
                data: {
                  name: caseData.Restoration,
                  elitePrice: 1,
                  plusPrice: 1,
                  classicPrice: 1,
                },
              });
            }

            const shades = caseData.Shade.split(' ');
            const [shadeOne, shadeTwo, shadeThree] = await Promise.all(
              shades.map(async (shadeName) => {
                if (!shadeName) return null;
                let shade = await prisma.shades.findFirst({
                  where: { shadeName },
                });
                if (!shade) {
                  shade = await prisma.shades.create({ data: { shadeName } });
                }
                return shade;
              }),
            );

            let productType = await prisma.productType.findFirst({
              where: { name: caseData.Type },
            });

            if (!productType) {
              productType = await prisma.productType.create({
                data: { name: caseData.Type, updatedAt: new Date() },
              });
            }

            function returnValues(position) {
              let pos = position.toLowerCase(); // Convert position to lowercase for case-insensitive matching
              let start, end;

              switch (pos) {
                case 'uper':
                case 'upper':
                  start = 1;
                  end = 16;
                  break;
                case 'lower':
                  start = 17;
                  end = 32;
                  break;
                case 'upper & lower':
                  start = 1;
                  end = 32;
                  break;
                default:
                  return position;
              }

              return Array.from(
                { length: end - start + 1 },
                (_, i) => i + start,
              ).join(',');
            }
            caseData['Tooth #'].toString();

            const caseItemData = await prisma.caseItem.create({
              data: {
                caseId: newCase.id,
                itemId: item.id,
                tooth: returnValues(caseData['Tooth #'].toString()),
                shadeOne: shadeOne?.id,
                shadeTwo: shadeTwo?.id,
                shadeThree: shadeThree?.id,
                productTypeId: productType.id,
              },
            });
          },
        );
        if (newCase?.id) {
          await this.AutoInvoice(newCase.id);
        }
      }
      return responseData;
    } catch (error) {
      console.error('error in import case service', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  private mapStatus(status: string): CaseStatus {
    const normalizedStatus = status.toLowerCase().replace(/\s/g, '');
    const matches = Object.entries(this.statusMap)
      .map(([key, value]) => ({
        key,
        value,
        similarity: this.calculateSimilarity(normalizedStatus, key),
      }))
      .filter((match) => match.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity);

    return matches.length > 0 ? matches[0].value : CaseStatus.Draft;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const len = Math.max(str1.length, str2.length);
    const matchCount = [...str1].filter((char, i) => char === str2[i]).length;
    return matchCount / len;
  }

  private async AutoInvoice(caseId: string) {
    const prisma = new PrismaClient();
    try {
      return await prisma.$transaction(
        async (transactionPrisma) => {
          const caseData = await transactionPrisma.case.findUnique({
            where: { id: caseId },
          });
          if (!caseData)
            throw new HttpException('Case not found', HttpStatus.NOT_FOUND);
          const dentist = await transactionPrisma.dentist.findUnique({
            where: { id: caseData.dentistId },
          });
          if (!dentist)
            throw new HttpException('Dentist not found', HttpStatus.NOT_FOUND);

          let invoice = await transactionPrisma.invoice.findFirst({
            where: {
              caseId: caseData.id,
              dentistId: dentist.id,
              deletedAt: null,
            },
          });

          console.info('Invoice', invoice);

          const caseItems = await transactionPrisma.caseItem.findMany({
            where: { caseId },
          });
          let shouldProceedRemakeCase = true;

          if (!invoice) {
            invoice = await this.createInvoice(
              transactionPrisma,
              caseId,
              dentist.id,
              caseData.dueDate,
            );
          }

          await this.processInvoiceItems(
            transactionPrisma,
            invoice.id,
            caseItems,
            caseData.level,
          );

          if (
            caseData.status === CaseStatus.RemakeRequest ||
            caseData.remakeCaseId != null ||
            caseData.remakeStatus != null
          ) {
            shouldProceedRemakeCase = false;
          }
          if (shouldProceedRemakeCase) {
            await this.updateInvoiceTotals(transactionPrisma, invoice.id);
          }
          return true;
        },
        {
          timeout: 10000,
        },
      );
    } catch (error) {
      console.error('AutoInvoice error:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  private async createInvoice(
    prisma: Prisma.TransactionClient,
    caseId: string,
    dentistId: string,
    dueDate: Date,
  ) {
    return await prisma.invoice.create({
      data: {
        caseId,
        dentistId,
        balance: 0,
        total: 0,
        subTotal: 0,
        taxes: 0,
        status: InvoiceStatusType.DRAFT,
        totalPaid: 0,
        due_date: dueDate,
        inv_date: new Date(),
      },
    });
  }

  private async processInvoiceItems(
    prisma: Prisma.TransactionClient,
    invoiceId: string,
    caseItems: any[],
    level: string,
  ) {
    for (const caseItem of caseItems) {
      let item = await prisma.item.findUnique({
        where: { id: caseItem.itemId },
      });
      if (!item)
        throw new HttpException('Item not found', HttpStatus.NOT_FOUND);

      let qty;
      const productType = await prisma.productType.findUnique({
        where: {
          id: caseItem.productTypeId,
          name: {
            in: [PRODUCTTYPE.Removable, PRODUCTTYPE.Appliance],
          },
        },
      });
      console.info('<productType>', productType);

      if (productType) {
        qty = this.calculateQuantity(caseItem.tooth);
      } else {
        qty = caseItem.tooth.split(',').length;
      }

      console.info('Quantity', qty);

      console.info('>>>>>>>>>>>>>.levels', level.toLocaleLowerCase());

      const unitPrice = item[`${level.toLocaleLowerCase()}Price`];

      console.info('>>>>>>>>>>>>>>>>>>>>>>unitPrice', unitPrice);

      const invoiceItemDiscount = await prisma.invoiceItem.findFirst({
        where: { caseItemId: caseItem.id },
      });
      let price = unitPrice * qty;
      if (invoiceItemDiscount) {
        switch (invoiceItemDiscount.discountType) {
          case '$':
            price = (unitPrice - (invoiceItemDiscount.discounts || 0)) * qty;
            break;
          case '%':
            const discountedPrice = unitPrice * qty;
            price =
              (discountedPrice * (100 - (invoiceItemDiscount.discounts || 0))) /
              100;
            break;
          default:
            price = unitPrice * qty;
        }
      }

      console.info('<>>><<qty>', qty);

      const invoiceItem = await prisma.invoiceItem.upsert({
        where: { caseItemId: caseItem.id },
        update: {
          itemId: item.id,
          name: item.name,
          unitPrice: unitPrice,
          qty: qty,
          price: price,
        },
        create: {
          invoiceId: invoiceId,
          itemId: item.id,
          name: item.name,
          unitPrice: unitPrice,
          qty: qty,
          price: unitPrice * qty,
          level: level,
          caseItemId: caseItem.id,
        },
      });

      console.info('Update InvoiceItem ', invoiceItem);
    }
  }

  private calculateQuantity(tooth: string): number {
    if (tooth === 'Upper&Lower') return 2;
    if (tooth === 'Upper' || tooth === 'Lower') return 1;

    const values = tooth.split(',');
    const hasLessThanOrEqual16 = values.some(
      (value) => parseInt(value) < 16 || value === '16p',
    );
    const hasGreaterThan16 = values.some(
      (value) => parseInt(value) > 16 || value === '16p',
    );

    if (hasLessThanOrEqual16 && hasGreaterThan16) return 2;
    return hasLessThanOrEqual16 || hasGreaterThan16 ? 1 : values.length;
  }

  private async updateInvoiceTotals(
    prisma: Prisma.TransactionClient,
    invoiceId: string,
  ) {
    const invoiceItems = await prisma.invoiceItem.findMany({
      where: { invoiceId },
    });
    const subTotal = invoiceItems.reduce(
      (acc, item) => acc + (item.price || 0),
      0,
    );
    const discounts = invoiceItems.reduce(
      (acc, item) => acc + (item.discounts || 0),
      0,
    );

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId },
    });

    if (!invoice)
      throw new HttpException('Invoice not found', HttpStatus.NOT_FOUND);

    const checkDentist = await this.databaseService.dentist.findUnique({
      where: { id: invoice.dentistId },
    });
    const taxCalculateObject = {
      to_country: checkDentist.country,
      to_zip: checkDentist.postalCode,
      to_state: checkDentist.state,
      to_city: checkDentist.city,
      to_street: checkDentist.addressOne,
      amount: subTotal,
      shipping: 0,
      nexus_addresses: [
        {
          id: 'Main Location',
          country: 'US',
          zip: '33444',
          state: 'FL',
          city: 'Delray Beach',
          street: '1065 SW 15th Ave Suite C2',
        },
      ],
      line_items: [
        {
          quantity: 1,
          product_tax_code: '19009',
          unit_price: subTotal,
          discount: 0,
        },
      ],
    };

    console.info('taxCalculateObject:', taxCalculateObject);

    // const taxCalculate =
    //   await this.taxjarService.calculateSalesTax(taxCalculateObject);
    // console.info('taxCalculate>>>>>>>>>>>>>>>>>>>>>>', taxCalculate);
    // console.info('taxCalculate.tax>>>>>>>>>>>>>>>>>>>>>>>', taxCalculate.tax);
    // const taxes = taxCalculate?.tax?.amount_to_collect;
    // const total = taxCalculate?.tax?.order_total_amount + taxes;
    // console.info('taxes', taxes);

    // Added Start
    const taxes = 0;
    const total = subTotal + taxes;
    // Added End
    // const total = subTotal - invoice.taxes / 100;
    const balance = total - invoice.totalPaid;

    const invoiceData = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { subTotal, total, balance, taxes },
    });
    console.info('<><><>Invoices: ', invoiceData);
  }

  async createOrUpdateCaseMessageCenter(
    caseMessageCenterDto: CreateUpdateMessageCenterDto,
    user,
  ) {
    try {
      const getCase = await this.databaseService.case.findFirst({
        where: {
          id: caseMessageCenterDto.caseId,
          deletedAt: null,
        },
      });
      console.info('getCase', getCase);
      if (getCase) {
        if (caseMessageCenterDto && caseMessageCenterDto.id) {
          const updateRecord =
            await this.databaseService.caseMasseageCenter.update({
              where: {
                id: caseMessageCenterDto.id,
              },
              data: caseMessageCenterDto,
            });
          console.info('updateRecord', updateRecord);

          return updateRecord;
        } else {
          let modelId: string | null = null;
          let modelType: string = modelTypeRoles.USER;
          if (caseMessageCenterDto.to === modelTypeRoles.DENTIST) {
            modelId = caseMessageCenterDto.dentistId;
            modelType = modelTypeRoles.DENTIST;
          } else if (caseMessageCenterDto.to === modelTypeRoles.MANUFACTURE) {
            modelId = caseMessageCenterDto.manufactureId;
            modelType = modelTypeRoles.MANUFACTURE;
          }
          const Data = await this.databaseService.notification.create({
            data: {
              modelId,
              modelType,
              subject: 'Case Message',
              message: `From ${caseMessageCenterDto.fromType}: ${caseMessageCenterDto.message}`,
              notificationType: 'Case',
              notificationTypeId: caseMessageCenterDto.caseId,
              isRead: false,
            },
          });

          if (caseMessageCenterDto.fromType === 'LAB') {
            caseMessageCenterDto.fromTypeId = user.id;
            this.emailService.caseMessageMail(
              caseMessageCenterDto,
              getCase.caseId,
            );
          } else if (
            caseMessageCenterDto.fromType === modelTypeRoles.DENTIST ||
            caseMessageCenterDto.fromType === modelTypeRoles.MANUFACTURE
          ) {
            caseMessageCenterDto.fromTypeId = user.modelId;
          }
          console.info('caseMessageCenterDto', caseMessageCenterDto);

          const createRecord =
            await this.databaseService.caseMasseageCenter.create({
              data: caseMessageCenterDto,
            });
          console.info('createRecord', createRecord);

          return createRecord;
        }
      } else {
        throw new HttpException('Invalid case-id', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error('error in createOrUpdateCaseMessageCenter', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getCasaeMessageCenter(caseId: string, user: any) {
    try {
      const getCase = await this.databaseService.case.findFirst({
        where: {
          id: caseId,
          deletedAt: null,
        },
      });
      // let fromNot: string;
      // if (user.modelType === modelTypeRoles.DENTIST) {
      //   fromNot = modelTypeRoles.MANUFACTURE;
      // } else if (user.modelType === modelTypeRoles.MANUFACTURE) {
      //   fromNot = modelTypeRoles.DENTIST;
      // }
      console.info('getCase:', getCase);
      if (getCase) {
        let response = new Array();
        const getAllMessages =
          await this.databaseService.caseMasseageCenter.findMany({
            where: {
              caseId: caseId,
              deletedAt: null,
              // fromType: {
              //   not: fromNot,
              // },
              // to: {
              //   not: fromNot,
              // },
            },
            include: {
              Dentist: true,
              Manufacture: true,
            },
          });
        if (getAllMessages && getAllMessages.length > 0) {
          for (let index = 0; index < getAllMessages.length; index++) {
            if (getAllMessages[index].fromType === 'LAB') {
              const getAdminData = await this.databaseService.user.findFirst({
                where: {
                  deletedAt: null,
                  id: getAllMessages[index].fromTypeId,
                },
              });
              getAllMessages[index]['fromTypeData'] = getAdminData;
            } else if (
              getAllMessages[index].fromType === modelTypeRoles.DENTIST
            ) {
              const getDentistData =
                await this.databaseService.dentist.findFirst({
                  where: {
                    deletedAt: null,
                    id: getAllMessages[index].fromTypeId,
                  },
                });
              getAllMessages[index]['fromTypeData'] = getDentistData;
            } else if (
              getAllMessages[index].fromType === modelTypeRoles.MANUFACTURE
            ) {
              const getManufactureData =
                await this.databaseService.manufacture.findFirst({
                  where: {
                    deletedAt: null,
                    id: getAllMessages[index].fromTypeId,
                  },
                });
              getAllMessages[index]['fromTypeData'] = getManufactureData;
            }
            if (getAllMessages[index].to === 'LAB') {
              const getAdminData = await this.databaseService.user.findFirst({
                where: {
                  deletedAt: null,
                  id: getAllMessages[index].fromTypeId,
                },
              });

              getAllMessages[index]['toTypeData'] = getAdminData;
            } else if (getAllMessages[index].to === modelTypeRoles.DENTIST) {
              const getDentistData =
                await this.databaseService.dentist.findFirst({
                  where: {
                    deletedAt: null,
                    id: getAllMessages[index].dentistId,
                  },
                });
              getAllMessages[index]['toTypeData'] = getDentistData;
            } else if (
              getAllMessages[index].to === modelTypeRoles.MANUFACTURE
            ) {
              if (getAllMessages[index].manufactureId !== null) {
                const getManufactureData =
                  await this.databaseService.manufacture.findFirst({
                    where: {
                      deletedAt: null,
                      id: getAllMessages[index].manufactureId,
                    },
                  });
                getAllMessages[index]['toTypeData'] = getManufactureData;
              }
            }

            response.push(getAllMessages[index]);
          }
        }
        return {
          data: response,
          message: 'Messages list fetch successfully.',
        };
      } else {
        throw new HttpException('Invalid case-id', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error('error in getCasaeMessageCenter', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getCasaeMessageCenterByDentistId(
    dentistId: string,
    query: queryRequestInput,
    user: any,
  ) {
    try {
      if (user.modelType !== modelTypeRoles.USER) {
        throw new HttpException(
          'Cannot access this resource!',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const { pageNo, limit } = query;
      const offset = (pageNo - 1) * +limit;

      const getDentistId = await this.databaseService.dentist.findFirst({
        where: {
          id: dentistId,
          deletedAt: null,
        },
      });

      if (!getDentistId) {
        throw new HttpException('Invalid dentist-id', HttpStatus.BAD_REQUEST);
      }
      const totalCount = await this.databaseService.caseMasseageCenter.count({
        where: {
          dentistId: dentistId,
          deletedAt: null,
        },
      });
      const caseMessageData =
        await this.databaseService.caseMasseageCenter.findMany({
          where: {
            dentistId: dentistId,
            deletedAt: null,
          },
          take: +limit,
          skip: offset,
          orderBy: {
            createdAt: 'desc',
          },
        });
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = pageNo < totalPages;

      if (!caseMessageData) {
        throw {
          message: 'CaseMessage Data is not fetch!',
          error: 'Unauthorized',
        };
      }

      return {
        status: true,
        message: 'Messages list fetch successfully.',
        data: {
          data: caseMessageData,
          total: totalCount,
          next: hasNextPage ? +pageNo + 1 : null,
        },
      };
    } catch (error) {
      console.error('error in getCasaeMessageCenter', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async caseExports(query: queryRequestInputExport, user: any) {
    try {
      const { queryString } = query;
      const searchQuery = `%${queryString || ''}%`;

      const statusFilter =
        query.status && query.status.length > 0
          ? Array.isArray(query.status)
            ? query.status
            : [query.status]
          : [
              'Draft',
              'IntransitfromClient',
              'DetailsPending',
              'PendingLabQuestion',
              'CheckIn',
              'RemakeRequest',
              'IntransittoManufacturingDept',
              'ReceivedbyManufacturingDept',
              'InManufacturing',
              'ReadyforShipmenttoNextDentalLab',
              'IntransitfromManufacturingDept',
              'ReceivedfromManufacturingDept',
              'InQC',
              'PendingClientShipment',
              'InTransitToClient',
              'OnHold',
              'Cancelled',
              'DuplicateCase',
              'LateCase',
              'PendingManufacturingDepartmentShipment',
              'PendingForNextDentalLabshipment',
              'Completed',
            ];

      let whereCondition: any = {
        OR: [
          { manNotes: { contains: searchQuery, mode: 'insensitive' } },
          { panNum: { contains: searchQuery, mode: 'insensitive' } },
          { reason: { contains: searchQuery, mode: 'insensitive' } },
          { referenceNum: { contains: searchQuery, mode: 'insensitive' } },
          // {
          //   Dentist: {
          //     accountId: { contains: searchQuery, mode: 'insensitive' },
          //   },
          // },
        ],
        deletedAt: null,
      };

      console.info(user);

      if (user.modelType === modelTypeRoles.DENTIST) {
        whereCondition.dentistId = user.modelId;
      } else if (user.modelType === modelTypeRoles.MANUFACTURE) {
        whereCondition.manufactureId = user.modelId;
      }

      if (query.status) {
        whereCondition['status'] = { in: statusFilter };
      }

      if (query.dentistId) {
        whereCondition['dentistId'] = query.dentistId;
      }

      if (query.manufactureId) {
        whereCondition['manufactureId'] = query.manufactureId;
      }
      if (query.startDate && query.startDate) {
        const startDate = moment(query.startDate).toDate();
        const endDate = moment(query.endDate).toDate();
        whereCondition['OR'].push(
          {
            dueDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            dueShipDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        );
      }

      if (query.startDate && !query.endDate) {
        const startDate = moment(query.startDate).toDate();
        whereCondition['OR'].push(
          {
            dueDate: {
              gte: startDate,
            },
          },
          {
            dueShipDate: {
              gte: startDate,
            },
          },
          {
            createdAt: {
              gte: startDate,
            },
          },
        );
      }

      if (!query.startDate && query.endDate) {
        const endDate = moment(query.endDate).toDate();
        whereCondition['OR'].push(
          {
            dueDate: {
              gte: endDate,
            },
          },
          {
            dueShipDate: {
              gte: endDate,
            },
          },
          {
            createdAt: {
              gte: endDate,
            },
          },
        );
      }
      console.info('whereCondition', JSON.stringify(whereCondition, null, 2));

      const dentistSelectField = {
        id: true,
        accountId: true,
      };

      const caseInstructionSelectField = {
        id: true,
        note: true,
      };

      const orderCheck = {
        orderBy: query.orderBy ? query.orderBy : 'createdAt',
        orderType: query.orderType ? query.orderType : 'desc',
      };
      const order = {
        [`${orderCheck.orderBy}`]: orderCheck.orderType,
      };
      console.info('order', order);
      console.info('whereCondition', whereCondition);
      this.databaseService.case.findMany({
        where: {
          Manufacture: {},
        },
      });
      const casesData = await this.databaseService.case.findMany({
        where: whereCondition,
        include: {
          Dentist: { select: dentistSelectField },
          Manufacture: true,
          Patient: true,
          // ScheduleType: true,
          // CaseInstruction: true,
          remakeCase: true,
          CaseItem: {
            include: {
              Item: true,
              ProductType: true,
              shadeOneId: true,
              shadeTwoId: true,
              shadeThreeId: true,
              stumpShadeId: true,
            },
          },
          CaseNotes: {
            where: {
              deletedAt: null,
            },
          },
          CaseAttachments: {
            include: {
              Attachments: true,
            },
          },
          CaseDoctorPreferences: true,
          CaseInstruction: {
            where: {
              deletedAt: null,
            },
          },
          CaseMasseageCenter: {
            include: {
              Dentist: true,
              Manufacture: true,
            },
          },
        },
        orderBy: order,
      });

      console.info(casesData.length);

      if (!casesData) {
        throw {
          message: 'Cases are not fetch!',
          error: 'Unauthorized',
        };
      }
      return {
        status: true,
        message: 'List of all Cases',
        data: {
          data: casesData,
        },
      };
    } catch (error) {
      console.error('error in list case service', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async updateCaseStatusBulk(
    caseIds: string[],
    caseStatus: CaseStatus,
    user: any,
  ): Promise<any> {
    try {
      if (
        user.modelType === modelTypeRoles.MANUFACTURE &&
        !ManufacturingCaseStatus.includes(caseStatus)
      ) {
        throw new Error('Please select a valid status for manufacture.');
      }

      if (
        user.modelType === modelTypeRoles.DENTIST &&
        !DentistCaseStatus.includes(caseStatus)
      ) {
        throw {
          message: 'Please select a valid status for dentist.',
          error: 'Unauthorized',
        };
      }
      let dataUpdate: any = {
        status: caseStatus,
      };

      if (
        caseStatus === CaseStatus.PendingForNextDentalLabshipment ||
        caseStatus === CaseStatus.PendingManufacturingDepartmentShipment ||
        caseStatus === CaseStatus.PendingClientShipment ||
        caseStatus === CaseStatus.ReadyforShipmenttoNextDentalLab
      ) {
        dataUpdate['shippingFlagtimeStamp'] = null;
      }

      const casestatusUpdate = await this.databaseService.case.updateMany({
        where: {
          id: { in: caseIds },
        },
        data: dataUpdate,
      });
      if (!casestatusUpdate) {
        throw new Error('No cases found with the provided IDs');
      }

      if (
        caseStatus === CaseStatus.InTransitToClient ||
        caseStatus === CaseStatus.Completed
      ) {
        console.info('>>>>>>Invoice-status-Update<<<<<<<<<');

        const invoiceStatusUpdate =
          await this.databaseService.invoice.updateMany({
            where: {
              caseId: { in: caseIds },
            },
            data: {
              status: InvoiceStatusType.OPEN,
            },
          });
        if (invoiceStatusUpdate.count === 0) {
          throw new Error('No invoices found for the provided case IDs');
        }
      }

      return { message: 'Case statuses updated successfully' };
    } catch (error) {
      // Handle the error appropriately
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // async updateCaseStatusBulkCsv(
  //   caseIds: { accountId: string; caseId: string }[],
  //   caseStatus: CaseStatus,
  //   user: any,
  // ): Promise<any> {
  //   const updateResults = await Promise.all(
  //     caseIds.map(async ({ accountId, caseId }) => {
  //       try {
  //         // Check if the case exists and belongs to the dentist
  //         const caseData = await this.databaseService.case.findFirst({
  //           where: {
  //             caseId: caseId,
  //             Dentist: {
  //               accountId: accountId,
  //             },
  //             deletedAt: null,
  //           },
  //         });

  //         if (caseData) {
  //           // Update the case status
  //           await this.databaseService.case.update({
  //             where: { id: caseData.id }, // Use the primary key
  //             data: { status: caseStatus },
  //           });
  //           return {
  //             caseId,
  //             message: 'Successfully updated case status',
  //             status: true,
  //           };
  //         } else {
  //           return {
  //             caseId,
  //             message: 'Case not found or does not belong to dentist',
  //             status: false,
  //           };
  //         }
  //       } catch (error) {
  //         console.error(`Error updating case ${caseId}:`, error.message);
  //         return {
  //           caseId,
  //           message: `Failed to update case status: ${error.message}`,
  //           status: false,
  //         };
  //       }
  //     }),
  //   );

  //   return {
  //     status: true,
  //     message: 'Bulk update completed',
  //     results: updateResults,
  //   };
  // }

  async updateCaseStatusBulkCsv(
    caseIds: { accountId: string; caseId: string }[],
    caseStatus: CaseStatus,
    user: any,
  ): Promise<any> {
    if (modelTypeRoles.DENTIST === user.modelType) {
      throw new Error('Dentists are not authorized to update case status.');
    }

    if (!ManufacturingCaseStatus.includes(caseStatus)) {
      throw new Error('Invalid case status. Please select a valid status.');
    }

    const updateResults = await Promise.all(
      caseIds.map(async ({ accountId, caseId }) => {
        try {
          let whereClause: any = {
            caseId: caseId,
            Dentist: {
              accountId: accountId,
            },
            deletedAt: null,
          };

          if (modelTypeRoles.MANUFACTURE === user.modelType) {
            whereClause.manufactureId = user.modelId;
          }
          const caseData = await this.databaseService.case.findFirst({
            where: whereClause,
          });

          if (caseData) {
            const caseStatusData = await this.databaseService.case.update({
              where: { id: caseData.id },
              data: { status: caseStatus },
            });

            const invoiceCheck = await this.databaseService.invoice.findFirst({
              where: {
                caseId: caseData.id,
              },
            });
            if (
              invoiceCheck &&
              (caseStatusData.status === CaseStatus.InTransitToClient ||
                caseStatusData.status === CaseStatus.Completed)
            ) {
              await this.databaseService.invoice.update({
                where: { id: invoiceCheck.id },
                data: { status: InvoiceStatusType.OPEN },
              });
            }
            return {
              caseId,
              id: caseData.id,
              message: 'Case status updated successfully',
              status: true,
            };
          } else {
            return {
              caseId,
              id: null,
              message: 'Case not found or does not belong to the dentist',
              status: false,
            };
          }
        } catch (error) {
          console.error(`Error updating case ${caseId}:`, error.message);
          return {
            caseId,
            id: null,
            message: `Failed to update case status: ${error.message}`,
            status: false,
          };
        }
      }),
    );

    const successfulUpdates = updateResults.filter(
      (result) => result.status,
    ).length;
    const pendingCases = updateResults
      .filter((result) => !result.status)
      .map((result) => ({ id: result.id, caseId: result.caseId }));

    return {
      status: true,
      message: `Bulk update completed: ${successfulUpdates} out of ${caseIds.length} cases updated successfully. ${pendingCases.length} cases pending.`,
      results: updateResults,
      pendingCases: pendingCases,
    };
  }

  async deleteCaseItemInvoiceItem(caseId: string, level: string) {
    try {
      const caseIdData = await this.databaseService.case.findFirst({
        where: {
          id: caseId,
        },
      });

      if (caseIdData.level !== level) {
        const caseItem = await this.databaseService.caseItem.deleteMany({
          where: {
            caseId: caseId,
          },
        });

        const invoiceData = await this.databaseService.invoice.findFirst({
          where: {
            caseId: caseId,
          },
        });

        const invoiceDelete = await this.databaseService.invoiceItem.deleteMany(
          {
            where: {
              invoiceId: invoiceData?.id,
              item: {
                isNot: null,
              },
            },
          },
        );

        this.AutoInvoice(caseIdData.id);

        console.info('invoiceDelete', invoiceDelete);
      }

      return { message: 'Invoice Item deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting Invoice Item: ${error.message}`);
    }
  }

  async getAllRemakeCase(query: queryRemakeCaseRequestInput, user: any) {
    try {
      const { pageNo, limit, queryString } = query;
      const offset = (pageNo - 1) * +limit;
      const searchQuery = `%${queryString || ''}%`;
      let whereCondition: any = {
        OR: [
          { manNotes: { contains: searchQuery, mode: 'insensitive' } },
          {
            Pan: {
              panNumber: { contains: searchQuery, mode: 'insensitive' },
            },
          },
          { reason: { contains: searchQuery, mode: 'insensitive' } },
          { referenceNum: { contains: searchQuery, mode: 'insensitive' } },
          { caseId: { contains: searchQuery, mode: 'insensitive' } },
          {
            Dentist: {
              accountId: { contains: searchQuery, mode: 'insensitive' },
            },
          },
          {
            Patient: {
              firstName: { contains: searchQuery, mode: 'insensitive' },
              lastName: { contains: searchQuery, mode: 'insensitive' },
            },
          },
        ],
        deletedAt: null,
      };

      if (query.startDate && query.startDate) {
        const startDate = moment(query.startDate).toDate();
        const endDate = moment(query.endDate).toDate();
        whereCondition['OR'].push(
          {
            dueDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            dueShipDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        );
      }

      console.info(user);
      if (user && user.modelType === modelTypeRoles.DENTIST) {
        whereCondition['dentistId'] = user.modelId;
      }
      whereCondition['status'] = 'RemakeRequest';
      whereCondition['remakeStatus'] = null;
      whereCondition['remakeCaseId'] = null;
      const totalCount = await this.databaseService.case.count({
        where: whereCondition,
      });

      const dentistSelectField = {
        id: true,
        accountId: true,
      };

      const orderCheck = {
        orderBy: query.orderBy ? query.orderBy : 'createdAt',
        orderType: query.orderType ? query.orderType : 'desc',
      };
      const order = {
        [`${orderCheck.orderBy}`]: orderCheck.orderType,
      };
      console.info('order', order);
      console.info('whereCondition', JSON.stringify(whereCondition, null, 2));
      const casesData = await this.databaseService.case.findMany({
        where: whereCondition,
        include: {
          Dentist: { select: dentistSelectField },
          Manufacture: true,
          Patient: true,
          Pan: true,
          // ScheduleType: true,
          // CaseInstruction: true,
          remakeCase: true,
          CaseItem: {
            include: {
              Item: true,
              ProductType: true,
              shadeOneId: true,
              shadeTwoId: true,
              shadeThreeId: true,
              stumpShadeId: true,
            },
          },
          CaseNotes: {
            where: {
              deletedAt: null,
            },
          },
          CaseAttachments: {
            include: {
              Attachments: true,
            },
          },
          CaseDoctorPreferences: true,
          CaseInstruction: {
            where: {
              deletedAt: null,
            },
          },
          CaseMasseageCenter: {
            include: {
              Dentist: true,
              Manufacture: true,
            },
          },
        },
        take: +limit,
        skip: offset,
        orderBy: order,
      });

      console.info(casesData.length);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = pageNo < totalPages;
      if (!casesData) {
        throw {
          message: 'Cases are not fetch!',
          error: 'Unauthorized',
        };
      }
      return {
        status: true,
        message: 'List of all Cases',
        data: {
          data: casesData,
          total: totalCount,
          next: hasNextPage ? +pageNo + 1 : null,
        },
      };
    } catch (error) {
      console.error('error in list case service', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
