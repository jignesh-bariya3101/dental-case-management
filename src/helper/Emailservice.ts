import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { DatabaseService } from 'src/database/database.service';
import { ADMIN, DentistCaseStatus, caseStatus, modelTypeRoles } from './helper';
import { caseStatusEmail } from './EmailTemp/caseStatus';
import { rxMailSend } from './EmailTemp/Rx-Email';
import { caseEntryMail } from './EmailTemp/caseEntry';
import { shipmentCreateMail } from './EmailTemp/shipmentMail';
import { caseMessagemail } from './EmailTemp/caseMessage';
import { Dentist_Status } from '@prisma/client';

@Injectable()
export class EmailService {
  private readonly resend: Resend;

  constructor(private readonly dataService: DatabaseService) {
    this.resend = new Resend(process.env.NestLabEmail);
  }

  async adminEmail() {
    const data = await this.dataService.user.findMany({
      where: {
        modelId: null,
        modelType: 'USER',
        role: {
          name: ADMIN,
        },
      },
      select: {
        id: true,
        email: true,
      },
    });
    const adminEmails = data.map((admin: any) => admin.email);
    console.info(adminEmails);
    return adminEmails;
  }

  async sendRxcreatesuccess(updateCase: any): Promise<any> {
    try {
      const dentist = await this.dataService.dentist.findUnique({
        where: { id: updateCase.dentistId },
      });
      const emailMessage = {
        from: process.env.SENDER_EMAIL,
        to: [...(await this.adminEmail()), dentist.email],
        subject: 'RX create',
        html: rxMailSend(updateCase),
      };

      const emailResponse = await this.resend.emails.send(emailMessage);

      const createNotificationData = await this.dataService.notification.create(
        {
          data: {
            modelId: dentist.id,
            modelType: modelTypeRoles.DENTIST,
            subject: 'Rx Create',
            message: `Rx Created successfully for case number ${updateCase.caseId}.`,
            notificationType: 'Case',
            notificationTypeId: updateCase.id,
            isRead: false,
          },
        },
      );

      await this.dataService.notification.create({
        data: {
          modelId: null,
          modelType: 'USER',
          subject: 'Rx Create',
          message: `Rx Created successfully for case number ${updateCase.caseId}.`,
          notificationType: 'Case',
          notificationTypeId: updateCase.id,
          isRead: false,
        },
      });
      console.info(
        'createNotificationData in Rx Create',
        createNotificationData,
      );

      console.info(emailResponse);

      return emailResponse; // Return the response from the email sending service
    } catch (error) {
      console.info('Error In sendRxcreatesuccess ::', error);

      // Throw HTTP exception if email sending fails
      throw new HttpException(
        'Failed to send password set invitation email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendShipmentcreatesuccess(shipment: any): Promise<any> {
    try {
      let emailData, email;
      let modelId: any, modelType: any;

      if (shipment.toType === modelTypeRoles.DENTIST) {
        emailData = await this.dataService.dentist.findFirst({
          where: {
            id: shipment.toTypeId,
            dentistStatus: Dentist_Status.ACTIVE,
          },
        });
        email = emailData.email;
        modelId = emailData.id;
        modelType = modelTypeRoles.DENTIST;
      } else if (shipment.toType === modelTypeRoles.MANUFACTURE) {
        emailData = await this.dataService.manufacture.findFirst({
          where: { id: shipment.toTypeId },
        });
        email = emailData.email;
        modelId = emailData.id;
        modelType = modelTypeRoles.MANUFACTURE;
      } else {
        email = [...(await this.adminEmail())];
        modelType = 'USER';
        modelId = null;
      }
      const emailMessage = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'Shipment created',
        html: shipmentCreateMail(
          shipment.toType,
          shipment.trackingNum,
          shipment.status,
        ),
      };

      const emailResponse = await this.resend.emails.send(emailMessage);

      if (modelType !== 'USER') {
        const createObject = {
          modelType: modelType,
          subject: 'Shipment Create',
          message: `Shipment Created successfully for case tracking number ${shipment?.trackingNum}.`,
          notificationType: 'Shipping',
          notificationTypeId: shipment.id,
          isRead: false,
        };
        if (modelId) {
          createObject['modelId'] = modelId;
        }
        const createNotificationData =
          await this.dataService.notification.create({
            data: createObject,
          });

        await this.dataService.notification.create({
          data: {
            modelType: 'USER',
            modelId: null,
            subject: 'Shipment Create',
            message: `Shipment Created successfully for case tracking number ${shipment?.trackingNum}.`,
            notificationType: 'Shipping',
            notificationTypeId: shipment.id,
            isRead: false,
          },
        });
        console.info(
          'createNotificationData in sendShipmentcreatesuccess',
          createNotificationData,
        );
      } else {
        let createNotificationData = await this.dataService.notification.create(
          {
            data: {
              modelType: 'USER',
              modelId: null,
              subject: 'Shipment Create',
              message: `Shipment Created successfully for case tracking number ${shipment?.trackingNum}.`,
              notificationType: 'Shipping',
              notificationTypeId: shipment.id,
              isRead: false,
            },
          },
        );
        console.info(
          'createNotificationData in sendShipmentcreatesuccess',
          createNotificationData,
        );
      }

      return emailResponse; // Return the response from the email sending service
    } catch (error) {
      console.info('Error In sendShipmentcreatesuccess :: ', error);

      // Throw HTTP exception if email sending fails
      throw new HttpException(
        'Failed to send password set invitation email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async caseEntry(caseEntry: any): Promise<any> {
    try {
      const dentist = await this.dataService.dentist.findUnique({
        where: { id: caseEntry.dentistId },
      });

      const emailMessage = {
        from: process.env.SENDER_EMAIL,
        to: [...(await this.adminEmail()), dentist.email],
        subject: 'Case entry',
        html: caseEntryMail(caseEntry),
      };

      const emailResponse = await this.resend.emails.send(emailMessage);

      const createObject = {
        modelId: dentist.id,
        modelType: modelTypeRoles.DENTIST,
        subject: 'Case Create',
        message: `Case Created successfully for case case-id :  ${caseEntry?.caseId}.`,
        notificationType: 'Case',
        notificationTypeId: caseEntry.id,
        isRead: false,
      };
      const createNotificationData = await this.dataService.notification.create(
        {
          data: createObject,
        },
      );

      await this.dataService.notification.create({
        data: {
          modelId: null,
          modelType: 'USER',
          subject: 'Case Create',
          message: `Case Created successfully for case case-id :  ${caseEntry?.caseId}.`,
          notificationType: 'Case',
          notificationTypeId: caseEntry.id,
          isRead: false,
        },
      });

      console.info('createNotificationData', createNotificationData);

      return emailResponse; // Return the response from the email sending service
    } catch (error) {
      console.info(
        'Error In caseEntry For Email and Notification Sending',
        error,
      );

      // Throw HTTP exception if email sending fails
      // throw new HttpException(
      //   'Failed to send case entry email',
      //   HttpStatus.INTERNAL_SERVER_ERROR,
      // );
    }
  }

  async caseStatusUpdate(userId: any, casesData: any): Promise<any> {
    try {
      const adminEmails = await this.adminEmail();
      let modelId: any, modelType: any;
      console.info('Admin Emails:', adminEmails);

      console.info('casesdata:', casesData);

      const userData = await this.dataService.user.findUnique({
        where: { id: userId },
      });
      modelId = userData.modelId;
      let modelTyepeUser, email;
      if (userData.modelType === modelTypeRoles.DENTIST) {
        modelTyepeUser = modelTypeRoles.DENTIST;
        email = [...adminEmails];
        modelType = modelTypeRoles.DENTIST;
      } else if (userData.modelType === modelTypeRoles.MANUFACTURE) {
        modelTyepeUser = modelTypeRoles.MANUFACTURE;
        email = [...adminEmails];
        modelType = modelTypeRoles.MANUFACTURE;
      } else {
        modelTyepeUser = ADMIN;
        modelType = 'USER';
        const emailData = DentistCaseStatus.includes(casesData.status)
          ? await this.dataService.dentist.findFirst({
              where: { id: casesData.dentistId },
            })
          : await this.dataService.manufacture.findFirst({
              where: { id: casesData.manufactureId },
            });

        email = emailData.email;
        modelId = null;
      }

      console.info('email', email);

      const caseData = {
        updatedBy: userData.id,
        status: caseStatus[casesData.status],
        caseId: casesData.caseId,
      };

      console.info('update user case data', caseData);

      const emailMessage = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'Case status update',
        html: caseStatusEmail(caseData),
      };
      // Send the email using Resend service
      const emailResponse = await this.resend.emails.send(emailMessage);
      if (modelType !== 'USER') {
        const createObject = {
          modelType: modelType,
          subject: 'Case status update',
          message: `Case status update successfully for case number ${caseData?.caseId}.`,
          notificationType: 'Case',
          notificationTypeId: casesData.id,
          isRead: false,
        };
        if (modelId) {
          createObject['modelId'] = modelId;
        }
        const createNotificationData =
          await this.dataService.notification.create({
            data: createObject,
          });

        await this.dataService.notification.create({
          data: {
            modelType: 'USER',
            subject: 'Case status update',
            message: `Case status update successfully for case number ${caseData?.caseId}.`,
            notificationType: 'Case',
            notificationTypeId: casesData.id,
            isRead: false,
            modelId: null,
          },
        });
        console.info(
          'createNotificationData in caseStatusUpdate',
          createNotificationData,
        );
      } else {
        let createNotificationData = await this.dataService.notification.create(
          {
            data: {
              modelType: 'USER',
              subject: 'Case status update',
              message: `Case status update successfully for case number ${caseData?.caseId}.`,
              notificationType: 'Case',
              notificationTypeId: casesData.id,
              isRead: false,
              modelId: null,
            },
          },
        );
        console.info(
          'createNotificationData in caseStatusUpdate',
          createNotificationData,
        );
      }

      return emailResponse; // Return the response from the email sending service
    } catch (error) {
      console.info('Error in caseStatusUpdate :: ', error);
    }
  }

  async caseMessageMail(casemessage: any, caseId: String): Promise<any> {
    try {
      let email, companyName;
      if (casemessage.to === modelTypeRoles.DENTIST) {
        const dentist = await this.dataService.dentist.findUnique({
          where: {
            id: casemessage?.dentistId,
            dentistStatus: Dentist_Status.ACTIVE,
          },
        });
        email = dentist.email;
        companyName = dentist?.companyName;
      } else {
        const manufacture = await this.dataService.manufacture.findUnique({
          where: { id: casemessage?.manufactureId },
        });
        email = manufacture.email;
        companyName = manufacture?.companyName;
      }

      const emailMessage = {
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'case message',
        html: caseMessagemail(
          companyName,
          casemessage.message,
          casemessage.fromType,
          caseId,
        ),
      };

      //email exist then email sent
      if (email) {
        const emailResponse = await this.resend.emails.send(emailMessage);
        return emailResponse;
      }
      // const emailResponse = await this.resend.emails.send(emailMessage);
    } catch (error) {
      console.info('Error In sendRxcreatesuccess ::', error);
    }
  }
}
