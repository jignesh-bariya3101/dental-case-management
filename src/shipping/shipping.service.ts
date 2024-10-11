import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateShippingDto } from './dto/createShippingDto';
import { DatabaseService } from 'src/database/database.service';
import { queryRequestInput } from './dto/pagination.dto';
import { EmailService } from 'src/helper/Emailservice';
import { UpsService } from 'src/ups/ups.service';

@Injectable()
export class ShippingService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly emailservice: EmailService,
    private readonly upsService: UpsService,
  ) {}

  async create(createShippingDto: CreateShippingDto) {
    try {
      const createObject: any = {};

      if (createShippingDto.shipper === 'ups') {
        const createAuthorizationCode =
          await this.upsService.createAuthorizationCode();
        const accessToken = createAuthorizationCode?.data?.access_token;
        console.info('accessToken', accessToken);
        const getAddressData = await this.getAddress(
          createShippingDto.fromType,
          createShippingDto.toType,
          createShippingDto.fromTypeId,
          createShippingDto.toTypeId,
        );

        console.info('getAddressData', JSON.stringify(getAddressData, null, 2));

        if (
          getAddressData &&
          getAddressData.fromAddress &&
          getAddressData.fromAddress.success === false
        ) {
          throw new HttpException(
            'Please provide from address data',
            HttpStatus.BAD_REQUEST,
          );
        }

        if (
          getAddressData &&
          getAddressData.toAddress &&
          getAddressData.toAddress.success === false
        ) {
          throw new HttpException(
            'Please provide to address data',
            HttpStatus.BAD_REQUEST,
          );
        }

        const shippmentData = {
          description: '',
          shipperName: process.env.SHIPPER_NAME,
          shipperAttentionName: process.env.SHIPPER_NAME,
          shipperTaxIndentificationNumber: '',
          shipperPhoneNo: process.env.SHIPPER_PHONE,
          shipperNumber: process.env.UPS_ACCOUNT_NUMBER, //* Required
          shipperFaxNumber: '',
          shipperAddress: process.env.SHIPPER_ADDRESS,
          shipperCity: process.env.SHIPPER_CITY, //* Required
          shipperStateCode: process.env.SHIPPER_STATECODE,
          shipperPostalCode: process.env.SHIPPER_POSTALCODE,
          shipperCountryCode: process.env.SHIPPER_COUNTRYCODE, //* Required
          shipToName: getAddressData?.toAddress?.shipToName,
          shipToAttentionName: getAddressData?.toAddress?.shipToName,
          shipToPhone: getAddressData?.toAddress?.shipToPhone,
          shipToAddress: getAddressData?.toAddress?.shipToAddress, //* Required
          shipToCity: getAddressData?.toAddress?.shipToCity, //* Required
          shipToStateCode: getAddressData?.toAddress?.shipToStateCode,
          shipToPostalCode: `${getAddressData?.toAddress?.shipToPostalCode}`,
          shipToCountryCode: getAddressData?.toAddress?.shipToCountryCode, //* Required
          shipFromName: getAddressData?.fromAddress?.shipFromName,
          shipFromAttentionName: getAddressData?.fromAddress?.shipFromName,
          shipFromPhone: getAddressData?.fromAddress?.shipFromPhone,
          shipFromFaxNumber: '',
          shipFromAddress: getAddressData?.fromAddress?.shipFromAddress, //* Required
          shipFromCity: getAddressData?.fromAddress?.shipFromCity, //* Required
          shipFromStateCode: getAddressData?.fromAddress?.shipFromStateCode,
          shipFromPostalCode: `${getAddressData?.fromAddress?.shipFromPostalCode}`,
          shipFromCountryCode: getAddressData?.fromAddress?.shipFromCountryCode, //* Required
        };
        const createShippment = await this.upsService.createShipping(
          shippmentData,
          accessToken,
        );

        if (createShippment.success === true) {
          console.info(
            'TrackingNumber',
            createShippment?.data?.ShipmentResponse?.ShipmentResults
              ?.PackageResults[0]?.TrackingNumber,
          );
          const trackingNumber =
            createShippment?.data?.ShipmentResponse?.ShipmentResults
              ?.PackageResults[0]?.TrackingNumber;

          const barcodeData =
            createShippment?.data?.ShipmentResponse?.ShipmentResults
              ?.PackageResults[0]?.ShippingLabel?.GraphicImage;

          createObject['trackingNum'] = trackingNumber || null;
          createObject['barcode'] = barcodeData || null;
        } else {
          throw new HttpException(
            createShippment.message,
            HttpStatus.BAD_REQUEST,
          );
        }
      }

      const caseIds = createShippingDto.caseIds;
      delete createShippingDto.caseIds;
      createObject['shipper'] = createShippingDto?.shipper;
      createObject['estPickup'] = createShippingDto?.estPickup;
      createObject['estDropOff'] = createShippingDto?.estDropOff;
      createObject['fromType'] = createShippingDto?.fromType;
      createObject['toType'] = createShippingDto?.toType;
      createObject['fromTypeId'] = createShippingDto?.fromTypeId;
      createObject['toTypeId'] = createShippingDto?.toTypeId;
      if (caseIds && caseIds.length <= 0) {
        throw new HttpException(
          'Please provide cases data',
          HttpStatus.BAD_REQUEST,
        );
      }
      // if (createShippingDto.fromType === 'DENTIST') {
      //   createObject['toType'] = 'LAB';
      //   createObject['fromTypeId'] = createShippingDto.fromTypeId;
      //   // createShippingDto.toTypeId = null;
      // }

      // if (createShippingDto.fromType === 'MANUFACTURE') {
      //   // createShippingDto.toTypeId = null;

      //   createObject['toType'] = 'LAB';
      //   createObject['fromTypeId'] = createShippingDto.fromTypeId;
      // }

      // if (createShippingDto.fromType === 'LAB') {
      //   createObject['toType'] = 'DENTIST';
      //   createObject['toTypeId'] = createShippingDto.toTypeId;
      //   // createShippingDto.fromTypeId = null;
      // }

      const createShipping = await this.databaseService.shipping.create({
        data: createObject,
      });
      if (createShipping && createShipping.id && createShipping.id !== null) {
        const caseShipping = [];
        for (let index = 0; index < caseIds.length; index++) {
          try {
            const createCaseShipping =
              await this.databaseService.caseShipping.create({
                data: {
                  caseId: caseIds[index],
                  shippingId: createShipping.id,
                  trackingNum: createShipping?.trackingNum,
                },
              });

            await this.databaseService.case.update({
              where: {
                id: caseIds[index],
              },
              data: {
                shippingFlagtimeStamp: new Date(),
              },
            });
            caseShipping.push(createCaseShipping);
          } catch (error) {
            await this.databaseService.caseShipping.deleteMany({
              where: {
                shippingId: createShipping.id,
              },
            });
            await this.databaseService.shipping.delete({
              where: { id: createShipping.id },
            });

            await this.databaseService.case.update({
              where: {
                id: caseIds[index],
              },
              data: {
                shippingFlagtimeStamp: null,
              },
            });
            console.error('Error in Crease CaseShipping :: ', error);
            throw new HttpException(
              error.message,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        }

        this.emailservice.sendShipmentcreatesuccess(createShipping);
        return createShipping;
      } else {
        console.info('In Else createShipping', createShipping);
        throw new HttpException(
          'Something went wrong. Please try after sometimes.',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      console.error('error in create shipping service', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAddress(fromType: any, toType: any, fromTypeId: any, toTypeId: any) {
    let fromAddress = {
      success: false,
      shipFromName: '',
      shipFromPhone: '',
      shipFromAddress: '',
      shipFromCity: '',
      shipFromStateCode: '',
      shipFromPostalCode: 0,
      shipFromCountryCode: '',
    };
    let toAddress = {
      success: false,
      shipToName: '',
      shipToPhone: '',
      shipToAddress: '',
      shipToCity: '',
      shipToStateCode: '',
      shipToPostalCode: 0,
      shipToCountryCode: '',
    };
    console.info('fromType', fromType);
    console.info('toType', toType);

    if (fromType) {
      console.info('in FromType');

      if (fromType === 'LAB') {
        // fromAdrres = 'env address';
        console.info('in FromType Lab');
        fromAddress['shipFromName'] = process.env.LAB_SHIP_NAME;
        fromAddress['shipFromPhone'] = process.env.LAB_SHIP_PHONE;
        fromAddress['shipFromAddress'] = process.env.LAB_SHIP_ADDRESS;
        fromAddress['shipFromCity'] = process.env.LAB_SHIP_CITY;
        fromAddress['shipFromStateCode'] = process.env.LAB_SHIP_STATECODE;
        fromAddress['shipFromPostalCode'] = parseInt(
          process.env.LAB_POSTAL_CODE,
        );
        fromAddress['shipFromCountryCode'] = process.env.LAB_SHIP_COUNTRY_CODE;
        fromAddress['success'] = true;
      } else if (fromType === 'MANUFACTURE') {
        console.info('in FromType Manufacture');
        // I can get fromId for Manufacture
        // fromAddress = 'From Manufacture Address';
        const getData = await this.databaseService.manufacture.findFirst({
          where: {
            id: fromTypeId,
            deletedAt: null,
          },
        });
        if (getData) {
          fromAddress['shipFromName'] = getData?.companyName;
          fromAddress['shipFromPhone'] = getData?.phone;
          fromAddress['shipFromAddress'] =
            getData?.addressOne + ' ' + getData?.addressTwo;
          fromAddress['shipFromCity'] = getData?.city;
          fromAddress['shipFromStateCode'] = getData?.state;
          fromAddress['shipFromPostalCode'] = getData?.postalCode;
          fromAddress['shipFromCountryCode'] = getData?.country;
          fromAddress['success'] = true;
        } else {
          fromAddress['success'] = false;
        }
      } else if (fromType === 'DENTIST') {
        console.info('in FromType Dentist');
        // I can get fromId for Dentist
        // fromAddress = 'From Dentist Address';
        const getData = await this.databaseService.dentist.findFirst({
          where: {
            id: fromTypeId,
            deletedAt: null,
          },
        });
        if (getData && getData.shippingAddressSameAsAddress) {
          if (
            getData.shippingAddressSameAsAddress === 'BILLING' &&
            getData.billingSameAsRegisterAddress === false
          ) {
            fromAddress['shipFromName'] = getData?.companyName;
            fromAddress['shipFromPhone'] = getData?.phone;
            fromAddress['shipFromAddress'] =
              (getData?.billingAddressOne ?? '') +
              ' ' +
              (getData?.billingAddressTwo ?? '');
            fromAddress['shipFromCity'] = getData?.billingCity;
            fromAddress['shipFromStateCode'] = getData?.billingState;
            fromAddress['shipFromPostalCode'] = getData?.billingPostalCode;
            fromAddress['shipFromCountryCode'] = getData?.billingCountry;
            fromAddress['success'] = true;
          } else {
            fromAddress['shipFromName'] = getData?.companyName;
            fromAddress['shipFromPhone'] = getData?.phone;
            fromAddress['shipFromAddress'] =
              (getData?.addressOne ?? '') + ' ' + (getData?.addressTwo ?? '');
            fromAddress['shipFromCity'] = getData?.city;
            fromAddress['shipFromStateCode'] = getData?.state;
            fromAddress['shipFromPostalCode'] = getData?.postalCode;
            fromAddress['shipFromCountryCode'] = getData?.country;
            fromAddress['success'] = true;
          }
        } else {
          if (getData) {
            fromAddress['shipFromName'] = getData?.companyName;
            fromAddress['shipFromPhone'] = getData?.phone;
            fromAddress['shipFromAddress'] =
              (getData?.shippingAddressOne ?? '') +
              ' ' +
              (getData?.shippingAddressTwo ?? '');
            fromAddress['shipFromCity'] = getData?.shippingCity;
            fromAddress['shipFromStateCode'] = getData?.shippingState;
            fromAddress['shipFromPostalCode'] = getData?.shippingPostalCode;
            fromAddress['shipFromCountryCode'] = getData?.shippingCountry;
            fromAddress['success'] = true;
          } else {
            fromAddress['success'] = false;
          }
        }
      }
    } else {
      fromAddress['success'] = false;
    }

    if (toType) {
      console.info('in ToType');
      if (toType === 'LAB') {
        console.info('in ToType Lab');
        // fromAdrres = 'env address';
        toAddress['shipToName'] = process.env.LAB_SHIP_NAME;
        toAddress['shipToPhone'] = process.env.LAB_SHIP_PHONE;
        toAddress['shipToAddress'] = process.env.LAB_SHIP_ADDRESS;
        toAddress['shipToCity'] = process.env.LAB_SHIP_CITY;
        toAddress['shipToStateCode'] = process.env.LAB_SHIP_STATECODE;
        toAddress['shipToPostalCode'] = parseInt(process.env.LAB_POSTAL_CODE);
        toAddress['shipToCountryCode'] = process.env.LAB_SHIP_COUNTRY_CODE;
        toAddress['success'] = true;
      } else if (toType === 'DENTIST') {
        console.info('in ToType Dentist');
        // I can get toId for Dentist
        // toAddress = 'Shipping Dentist Address'
        const getData = await this.databaseService.dentist.findFirst({
          where: {
            id: toTypeId,
            deletedAt: null,
          },
        });
        console.info(
          'getData.billingSameAsRegisterAddress',
          getData.billingSameAsRegisterAddress,
        );

        if (getData && getData.shippingAddressSameAsAddress) {
          if (
            getData.shippingAddressSameAsAddress === 'BILLING' &&
            getData.billingSameAsRegisterAddress === false
          ) {
            toAddress['shipToName'] = getData?.companyName;
            toAddress['shipToPhone'] = getData?.phone ?? '';
            toAddress['shipToAddress'] =
              (getData?.billingAddressOne ?? '') +
              ' ' +
              (getData?.billingAddressTwo ?? '');
            toAddress['shipToCity'] = getData?.billingCity;
            toAddress['shipToStateCode'] = getData?.billingState;
            toAddress['shipToPostalCode'] = getData?.billingPostalCode;
            toAddress['shipToCountryCode'] = getData?.billingCountry;
            toAddress['success'] = true;
          } else {
            toAddress['shipToName'] = getData?.companyName ?? '';
            toAddress['shipToPhone'] = getData?.phone ?? '';
            toAddress['shipToAddress'] =
              (getData?.addressOne ?? '') + ' ' + (getData?.addressTwo ?? '');
            toAddress['shipToCity'] = getData?.city;
            toAddress['shipToStateCode'] = getData?.state;
            toAddress['shipToPostalCode'] = getData?.postalCode;
            toAddress['shipToCountryCode'] = getData?.country;
            toAddress['success'] = true;
          }
        } else {
          {
            if (getData) {
              toAddress['shipToName'] = getData?.companyName;
              toAddress['shipToPhone'] = getData?.phone ?? '';
              toAddress['shipToAddress'] =
                (getData?.shippingAddressOne ?? '') +
                ' ' +
                (getData?.shippingAddressTwo ?? '');
              toAddress['shipToCity'] = getData?.shippingCity;
              toAddress['shipToStateCode'] = getData?.shippingState;
              toAddress['shipToPostalCode'] = getData?.shippingPostalCode;
              toAddress['shipToCountryCode'] = getData?.shippingCountry;
              toAddress['success'] = true;
            } else {
              toAddress['success'] = false;
            }
          }
        }

        console.info(
          '>>>>>>>>😁',
          (getData?.shippingAddressOne ?? '') +
            ' ' +
            (getData?.shippingAddressTwo ?? ''),
        );
      } else if (toType === 'MANUFACTURE') {
        console.info('in ToType Manufacture');
        // I can get toId for Manufacture
        // toAddress = 'Shipping Manufacture Address'
        const getData = await this.databaseService.manufacture.findFirst({
          where: {
            id: toTypeId,
            deletedAt: null,
          },
        });
        console.info('get data', getData);

        if (getData) {
          toAddress['shipToName'] = getData?.companyName;
          toAddress['shipToPhone'] = getData?.phone;
          toAddress['shipToAddress'] =
            getData?.addressOne + ' ' + getData?.addressTwo;
          toAddress['shipToCity'] = getData?.city;
          toAddress['shipToStateCode'] = getData?.state;
          toAddress['shipToPostalCode'] = getData?.postalCode;
          toAddress['shipToCountryCode'] = getData?.country;
          toAddress['success'] = true;
        } else {
          toAddress['success'] = false;
        }
      }
    } else {
      toAddress['success'] = false;
    }

    return {
      fromAddress,
      toAddress,
    };
  }

  async list(query: queryRequestInput) {
    try {
      const { pageNo, limit, queryString } = query;
      const statusFilter =
        query.status && query.status.length > 0
          ? Array.isArray(query.status)
            ? query.status
            : [query.status]
          : ['PRINTED', 'READY_FOR_PICKUP', 'IN_ROUTE', 'DELAYED', 'DELIVERED'];
      const offset = (pageNo - 1) * +limit;
      const searchQuery = `%${queryString || ''}%`;
      let toType: any;
      const whereCondition: any = {
        deletedAt: null,
        OR: [
          { shipper: { contains: searchQuery, mode: 'insensitive' } }, // Use contains for case-insensitive search
          { trackingNum: { contains: searchQuery, mode: 'insensitive' } }, // Use contains for case-insensitive search
        ],
      };
      if (query.shipFrom && query.shipTo) {
        whereCondition['toType'] = query.shipTo;
        whereCondition['fromType'] = query.shipFrom;
      } else if (query.shipFrom === 'MANUFACTURE') {
        whereCondition['fromType'] = query.shipFrom;
        if (query.shipTo) {
          whereCondition['toType'] = query.shipTo;
        } else {
          whereCondition['toType'] = 'LAB';
        }
      } else if (query.shipFrom === 'LAB') {
        whereCondition['fromType'] = query.shipFrom;
        if (query.shipTo) {
          whereCondition['toType'] = query.shipTo;
        } else {
          whereCondition['toType'] = 'DENTIST';
        }
      }

      if (query.status) {
        whereCondition['status'] = { in: statusFilter };
      }

      if (query.fromTypeId) {
        whereCondition['fromTypeId'] = query.fromTypeId;
      }

      if (query.toTypeId) {
        whereCondition['toTypeId'] = query.toTypeId;
      }
      // if (query.shipTo) {
      //   whereCondition['toType'] = query.shipTo;
      // }
      console.info('whereCondition', JSON.stringify(whereCondition, null, 2));

      const totalCount = await this.databaseService.shipping.count({
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

      const shippingData = await this.databaseService.shipping.findMany({
        where: whereCondition,
        // include: {
        //   CaseShipping: {
        //     include: {
        //       Case: {
        //         include: {
        //           Patient: true,
        //         },
        //       },
        //     },
        //   },
        // },
        take: +limit,
        skip: offset,
        orderBy: order,
      });
      let shippingAllData = shippingData;
      for (let index = 0; index < shippingAllData.length; index++) {
        const getAllShippingCases =
          await this.databaseService.caseShipping.findMany({
            where: {
              shippingId: shippingAllData[index].id,
            },
          });

        shippingAllData[index]['totalCases'] = getAllShippingCases.length;
        // From Type Object Set
        if (
          shippingAllData[index].fromType === 'DENTIST' &&
          shippingAllData[index].fromTypeId !== null
        ) {
          const getData = await this.databaseService.dentist.findFirst({
            where: { deletedAt: null, id: shippingAllData[index].fromTypeId },
          });
          shippingAllData[index]['fromTypeData'] = getData;
        }

        if (
          shippingAllData[index].fromType === 'MANUFACTURE' &&
          shippingAllData[index].fromTypeId !== null
        ) {
          const getData = await this.databaseService.manufacture.findFirst({
            where: { deletedAt: null, id: shippingAllData[index].fromTypeId },
          });
          console.info('getData manufacrture', getData);

          shippingAllData[index]['fromTypeData'] = getData;
        }

        // To Type Object Set
        if (
          shippingAllData[index].toType === 'DENTIST' &&
          shippingAllData[index].toTypeId !== null
        ) {
          const getData = await this.databaseService.dentist.findFirst({
            where: { deletedAt: null, id: shippingAllData[index].toTypeId },
          });
          shippingAllData[index]['toTypeData'] = getData;
        }

        if (
          shippingAllData[index].toType === 'MANUFACTURE' &&
          shippingAllData[index].toTypeId !== null
        ) {
          const getData = await this.databaseService.manufacture.findFirst({
            where: { deletedAt: null, id: shippingAllData[index].toTypeId },
          });
          shippingAllData[index]['toTypeData'] = getData;
        }
      }
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = pageNo < totalPages;

      return {
        status: true,
        message: 'List of all Shipping Data',
        data: {
          data: shippingAllData,
          total: totalCount,
          next: hasNextPage ? +pageNo + 1 : null,
        },
      };
    } catch (error) {
      console.error('error in list shipping service', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string) {
    try {
      const getShippingDetails = await this.databaseService.shipping.findFirst({
        where: {
          id: id,
        },
        include: {
          CaseShipping: {
            include: {
              Case: {
                include: {
                  Patient: true,
                  CaseItem: true,
                  Pan: true,
                  Dentist: true,
                  Invoice: {
                    include: {
                      InvoiceItem: {
                        include: {
                          CasseItem: true,
                          item: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          ShippingCheckInOut: true,
        },
      });

      if (
        getShippingDetails.fromType === 'DENTIST' &&
        getShippingDetails.fromTypeId !== null
      ) {
        const getData = await this.databaseService.dentist.findFirst({
          where: { deletedAt: null, id: getShippingDetails.fromTypeId },
        });
        getShippingDetails['fromTypeData'] = getData;
      }

      if (
        getShippingDetails.fromType === 'MANUFACTURE' &&
        getShippingDetails.fromTypeId !== null
      ) {
        const getData = await this.databaseService.manufacture.findFirst({
          where: { deletedAt: null, id: getShippingDetails.fromTypeId },
        });
        getShippingDetails['fromTypeData'] = getData;
      }
      if (
        getShippingDetails.fromType === 'LAB' &&
        getShippingDetails.fromTypeId === null
      ) {
        const getData = {
          companyName: process.env.LAB_SHIP_NAME,
          phone: process.env.LAB_SHIP_PHONE,
          addressOne: process.env.LAB_SHIP_ADDRESS,
          city: process.env.LAB_SHIP_CITY,
          state: process.env.LAB_SHIP_STATECODE,
          postalCode: process.env.LAB_POSTAL_CODE,
          country: process.env.LAB_SHIP_COUNTRY_CODE,
        };
        getShippingDetails['fromTypeData'] = getData;
      }

      if (
        getShippingDetails.toType === 'DENTIST' &&
        getShippingDetails.toTypeId !== null
      ) {
        const getData = await this.databaseService.dentist.findFirst({
          where: { deletedAt: null, id: getShippingDetails.toTypeId },
        });
        getShippingDetails['toTypeData'] = getData;
      }

      if (
        getShippingDetails.toType === 'MANUFACTURE' &&
        getShippingDetails.toTypeId !== null
      ) {
        const getData = await this.databaseService.manufacture.findFirst({
          where: { deletedAt: null, id: getShippingDetails.toTypeId },
        });
        getShippingDetails['toTypeData'] = getData;
      }

      if (
        getShippingDetails.toType === 'LAB' &&
        getShippingDetails.toTypeId == null
      ) {
        // fetch env to data and return address
        const getData = {
          companyName: process.env.LAB_SHIP_NAME,
          phone: process.env.LAB_SHIP_PHONE,
          addressOne: process.env.LAB_SHIP_ADDRESS,
          city: process.env.LAB_SHIP_CITY,
          state: process.env.LAB_SHIP_STATECODE,
          postalCode: process.env.LAB_POSTAL_CODE,
          country: process.env.LAB_SHIP_COUNTRY_CODE,
        };
        getShippingDetails['toTypeData'] = getData;
      }

      if (getShippingDetails) {
        return getShippingDetails;
      } else {
        throw new HttpException(
          'Shipping details not found with provided id.',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      console.error('error in list shipping service', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateStatus(id: string) {
    try {
    } catch (error) {
      console.error('error in updateStatus shipping service', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async remove(id: string) {
    try {
    } catch (error) {
      console.error('error in remove shipping service', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
