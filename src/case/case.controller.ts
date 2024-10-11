import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
  HttpStatus,
  DefaultValuePipe,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Prisma } from '@prisma/client';
import { CaseService } from './case.service';
import {
  CreateCaseDto,
  CreatePatientDto,
  CreateCaseNotesDto,
  CreateCaseInstructionsDto,
} from './dto/create-case.dto';
import {
  UpdateCaseDto,
  UpdateCaseNotesDto,
  UpdateCaseInstructionsDto,
} from './dto/update-case.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  queryRequestInput,
  getPatientDto,
  queryRequestInputExport,
  queryRemakeCaseRequestInput,
} from './dto/pagination.dto';
import { ImportCaseDto } from './dto/import-case.dto';
import { CreateRxCaseDto } from './dto/rx-case.dto';
import { UpdateRxCaseDto } from './dto/update-rx-case.dto';
import { AuthenticatedRequest } from 'src/middleware/AuthenticatedRequest.interface';
import { CreateUpdateMessageCenterDto } from './dto/create-update-caseMessage.dto';
import { UpdateCasestatusDto } from './dto/update-caseStatus.dto';
import { UpdateCasestatusCsvDto } from './dto/updateCasestatusCsv.dto';
import {
  CreateAttachmentArrayDto,
  CreateAttachmentDto,
} from './dto/create-Attachment.dto';

@ApiTags('Case')
@Controller('case')
export class CaseController {
  constructor(private readonly caseService: CaseService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add Case' })
  @ApiResponse({ status: 200, description: 'Case added successfully' })
  @ApiBody({ type: CreateCaseDto })
  async create(@Body() createCaseDto: CreateCaseDto, @Req() req: any) {
    try {
      return await this.caseService.create(createCaseDto, req.user.id);
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('case-rx')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add Case' })
  @ApiResponse({ status: 200, description: 'Case added successfully' })
  @ApiBody({ type: CreateRxCaseDto })
  async rxcreate(@Body() createRxCaseDto: CreateRxCaseDto, @Req() req: any) {
    try {
      return await this.caseService.rxcreate(createRxCaseDto, req.user.id);
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get all cases' })
  @ApiResponse({
    status: 200,
    description: 'Get all list of cases',
  })
  async findAll(
    @Query() query: queryRequestInput,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.caseService.findAll(query, req.user);
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('rx-case/:id')
  @ApiBearerAuth()
  async updateRx(
    @Param('id') id: string,
    @Body() updateRxCaseDto: UpdateRxCaseDto,
    @Req() req: any,
  ) {
    return this.caseService.updateRx(id, updateRxCaseDto, req.user.id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() updateCaseDto: UpdateCaseDto,
    @Req() req: any,
  ) {
    try {
      return this.caseService.update(id, updateCaseDto, req.user.id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/updateAttachment/:id')
  @ApiBearerAuth()
  @UseInterceptors(AnyFilesInterceptor())
  updateAttachment(
    @Param('id') id: string,
    @UploadedFiles() files,
    @Req() req: any,
    @Body() body,
  ) {
    try {
      const filesWithCount = files.map((file) => ({
        ...file,
        count: body[`${file.fieldname}_count`],
      }));

      console.info('<<<file👍>>>>', filesWithCount);

      return this.caseService.uploadAttachment(id, filesWithCount, req.user.id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiBearerAuth()
  async get(@Param('id') id: string, @Req() req: any) {
    try {
      return this.caseService.get(id, req.user);
    } catch (error) {
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('barcode/:caseId')
  @ApiBearerAuth()
  async getBarcode(@Param('caseId') caseId: string) {
    try {
      console.info('step 1: getBarcode');

      return this.caseService.getBarcode(caseId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/file/get-presigned-url/:attachmemtId')
  @ApiBearerAuth()
  async getPresigneUrl(@Param('attachmemtId') attachmemtId: string) {
    try {
      return this.caseService.getPresignedUrl(attachmemtId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/notes/:caseId')
  @ApiBearerAuth()
  createCaseNotes(
    @Param('caseId') caseId: string,
    @Body() createCaseNotesDto: CreateCaseNotesDto,
    @Req() req: any,
  ) {
    try {
      return this.caseService.createCaseNotes(
        caseId,
        createCaseNotesDto,
        req.user.id,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/instructions/:caseId')
  @ApiBearerAuth()
  createCaseInstruction(
    @Param('caseId') caseId: string,
    @Body() createCaseInstructionsDto: CreateCaseInstructionsDto,
    @Req() req: any,
  ) {
    try {
      return this.caseService.createCaseInstruction(
        caseId,
        createCaseInstructionsDto,
        req.user.id,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('/notes/:caseId')
  @ApiBearerAuth()
  updateCaseNotes(
    @Param('caseId') caseId: string,
    @Body() updateCaseNotesDto: UpdateCaseNotesDto,
    @Req() req: any,
  ) {
    try {
      return this.caseService.updateCaseNotes(
        caseId,
        updateCaseNotesDto,
        req.user.id,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/case-attachment-count')
  @ApiBearerAuth()
  @ApiBody({ type: CreateAttachmentArrayDto })
  async updateAttachmentCount(
    @Body() createAttachment: CreateAttachmentArrayDto,
    @Req() req?: any,
  ) {
    try {
      return await this.caseService.updateAttachmentCount(
        createAttachment,
        req.user,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('/instructions/:caseId')
  @ApiBearerAuth()
  updateCaseInstruction(
    @Param('caseId') caseId: string,
    @Body() updateCaseInstructionsDto: UpdateCaseInstructionsDto,
    @Req() req: any,
  ) {
    try {
      return this.caseService.updateCaseInstructions(
        caseId,
        updateCaseInstructionsDto,
        req.user.id,
      );
    } catch (error) {
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/notes/:caseId')
  @ApiBearerAuth()
  listCaseNotes(@Param('caseId') caseId: string, @Req() req: any) {
    try {
      return this.caseService.getCaseNotesList(caseId, req.user);
    } catch (error) {
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('/instructions/:caseId')
  @ApiBearerAuth()
  listCaseInstruction(@Param('caseId') caseId: string, @Req() req: any) {
    try {
      return this.caseService.getCaseInstructionsList(caseId, req.user);
    } catch (error) {
      throw new HttpException(
        error.message,
        error?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('/notes/:caseId/:noteId')
  @ApiBearerAuth()
  deleteCaseNotes(
    @Param('caseId') caseId: string,
    @Param('noteId') noteId: string,
  ) {
    try {
      return this.caseService.deleteCaseNote(caseId, noteId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('/instructions/:caseId/:instructionId')
  @ApiBearerAuth()
  deleteCaseInstruction(
    @Param('caseId') caseId: string,
    @Param('instructionId') instructionId: string,
  ) {
    try {
      return this.caseService.deleteCaseInstruction(caseId, instructionId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('/case-item/:id')
  @ApiBearerAuth()
  deleteCaseItem(@Param('id') id: string) {
    try {
      return this.caseService.deleteCaseItem(id);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('/attachment/:attachmentId')
  @ApiBearerAuth()
  removeAttachmentOnUpdateTime(
    @Param('attachmentId') attachmentId: string,
    @Req() req: any,
  ) {
    try {
      return this.caseService.removeAttachmentOnUpdateTime(attachmentId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/details/remake')
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get Case Details Using Patient name and Dentist's id",
  })
  @ApiResponse({
    status: 200,
    description: "Get Case Details Using Patient name and Dentist's id",
  })
  async getPatientForRemakeCase(@Query() query: getPatientDto) {
    try {
      return await this.caseService.getCaseByPatientDetails(query);
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/import-case')
  @ApiOperation({ summary: 'Add Case csv' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Case added successfully' })
  @ApiBody({})
  async uploadCaseFile(
    @Body() importCaseDto: ImportCaseDto[],
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.caseService.importCase(importCaseDto, req.user);
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/createOrUpdate/messageCenter')
  @ApiOperation({ summary: 'Add Or Update Case Message Center' })
  @ApiBearerAuth()
  createOrUpdateCaseMessageCenter(
    @Body() caseMessageCenterDto: CreateUpdateMessageCenterDto,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return this.caseService.createOrUpdateCaseMessageCenter(
        caseMessageCenterDto,
        req.user,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/messageCenter/:caseId')
  @ApiOperation({ summary: 'Get Case Message Center List' })
  @ApiBearerAuth()
  getCaseMessageCenterList(@Param('caseId') caseId: string, @Req() req: any) {
    try {
      return this.caseService.getCasaeMessageCenter(caseId, req.user);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/message-dentist/:dentistId')
  @ApiOperation({ summary: 'Get Case Message Center List By DentistId' })
  @ApiBearerAuth()
  getCaseMessageCenterListByDentistId(
    @Param('dentistId') dentistId: string,
    @Req() req: any,
    @Query() query: queryRequestInput,
  ) {
    try {
      return this.caseService.getCasaeMessageCenterByDentistId(
        dentistId,
        query,
        req.user,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/export/data')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get all cases and export' })
  @ApiResponse({
    status: 200,
    description: 'Get all list of cases and export',
  })
  async caseExport(
    @Query() query: queryRequestInputExport,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.caseService.caseExports(query, req.user);
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/bulkupdate-casestatus/')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update case statuses' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated case statuses',
  })
  async updateCaseStatus(
    @Body() updateCasestatusDto: UpdateCasestatusDto,
    @Req() req: any,
  ): Promise<any> {
    const { caseIds, caseStatus } = updateCasestatusDto;

    try {
      return await this.caseService.updateCaseStatusBulk(
        caseIds,
        caseStatus,
        req.user,
      );
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('/caseitem-level/:caseId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete case item by ID' })
  @ApiResponse({
    status: 200,
    description: 'Case item and related invoice item deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  async deleteCaseItemInvoiceItem(
    @Param('caseId') caseId: string,
    @Query('level') level?: string,
  ) {
    try {
      await this.caseService.deleteCaseItemInvoiceItem(caseId, level);
      return {
        message: 'Case item and related invoice item deleted successfully',
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/bulkupdate-casecsv/')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update case statuses' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated case statuses',
  })
  async updateCaseStatusCsv(
    @Body() updateCasestatusCsvDto: UpdateCasestatusCsvDto,
    @Req() req: any,
  ): Promise<any> {
    const user = req.user;
    const { caseIds, caseStatus } = updateCasestatusCsvDto;

    try {
      return await this.caseService.updateCaseStatusBulkCsv(
        caseIds,
        caseStatus,
        user,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/case/remake-request')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'get all remake request cases' })
  @ApiResponse({
    status: 200,
    description: 'Get all remake request list of cases',
  })
  async findAllRemakeRequestCase(
    @Query() query: queryRemakeCaseRequestInput,
    @Req() req: AuthenticatedRequest,
  ) {
    try {
      return await this.caseService.getAllRemakeCase(query, req.user);
    } catch (error) {
      console.error(error, 'error');
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
