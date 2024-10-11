import { Injectable } from '@nestjs/common';

@Injectable()
export class UpsService {
  async createAuthorizationCode() {
    try {
      const formData = {
        grant_type: 'client_credentials',
      };
      const resp = await fetch(
        `${process.env.UPS_URL}/security/v1/oauth/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-merchant-id': `${process.env.UPS_ACCOUNT_NUMBER}`,
            Authorization:
              'Basic ' +
              Buffer.from(
                `${process.env.UPS_CLIENT_ID}:${process.env.UPS_CLIENT_SECRET}`,
              ).toString('base64'),
          },
          body: new URLSearchParams(formData).toString(),
        },
      );

      const data = await resp.json();
      console.info(data);

      return {
        success: true,
        data: data,
        message: 'Shipping created successfully.',
      };
    } catch (error) {
      console.info('error', error);

      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }

  async createShipping(shippingData: any, token: any) {
    try {
      const query = new URLSearchParams({
        additionaladdressvalidation: 'NEXTDENTALLAB',
      }).toString();

      const version = 'v2403';

      const data = {
        ShipmentRequest: {
          Request: {
            SubVersion: '1801',
            RequestOption: 'nonvalidate',
            TransactionReference: { CustomerContext: '' },
          },
          Shipment: {
            //The Description of Goods for the shipment. Applies to international and domestic shipments.
            Description: shippingData?.description,
            Shipper: {
              //* For forward Shipment 35 characters are accepted, but only 30 characters will be printed on the label.
              Name: shippingData?.shipperName,
              AttentionName: shippingData?.shipperAttentionName,
              TaxIdentificationNumber:
                shippingData?.shipperTaxIndentificationNumber,
              Phone: {
                //* Required
                Number: shippingData?.shipperPhoneNo,
                Extension: ' ',
              },
              ShipperNumber: shippingData?.shipperNumber, //* Required
              FaxNumber: shippingData?.shipperFaxNumber,
              Address: {
                AddressLine: shippingData?.shipperAddress,
                City: shippingData?.shipperCity, //* Required
                StateProvinceCode: shippingData?.shipperStateCode,
                PostalCode: shippingData?.shipperPostalCode,
                CountryCode: shippingData?.shipperCountryCode, //* Required
              },
            },
            ShipTo: {
              Name: shippingData?.shipToName,
              AttentionName: shippingData?.shipToAttentionName,
              Phone: { Number: shippingData?.shipToPhone },
              Address: {
                AddressLine: shippingData?.shipToAddress, //* Required
                City: shippingData?.shipToCity, //* Required
                StateProvinceCode: shippingData?.shipToStateCode,
                PostalCode: shippingData?.shipToPostalCode,
                CountryCode: shippingData?.shipToCountryCode, //* Required
              },
              Residential: ' ',
            },
            ShipFrom: {
              Name: shippingData?.shipFromName,
              AttentionName: shippingData?.shipFromAttentionName,
              Phone: { Number: shippingData?.shipFromPhone },
              FaxNumber: shippingData?.shipFromFaxNumber,
              Address: {
                AddressLine: shippingData?.shipFromAddress, //* Required
                City: shippingData?.shipFromCity, //* Required
                StateProvinceCode: shippingData?.shipFromStateCode,
                PostalCode: shippingData?.shipFromPostalCode,
                CountryCode: shippingData?.shipFromCountryCode, //* Required
              },
            },
            PaymentInformation: {
              ShipmentCharge: {
                Type: '01', //* Required  01 = Transportation 02 = Duties and Taxes 03 = Broker of Choice A shipment charge type of 01 = Transportation is required.
                BillShipper: { AccountNumber: process.env.UPS_ACCOUNT_NUMBER },
              },
            },
            Service: {
              /** 01 = Next Day Air
                    02 = 2nd Day Air
                    03 = Ground
                    07 = Express
                    08 = Expedited
                    11 = UPS Standard
                    12 = 3 Day Select
                    13 = Next Day Air Saver
                    14 = UPS Next Day Air® Early
                    17 = UPS Worldwide Economy DDU
                    54 = Express Plus
                    59 = 2nd Day Air A.M.
                    65 = UPS Saver
                    M2 = First Class Mail
                    M3 = Priority Mail
                    M4 = Expedited MaiI Innovations
                    M5 = Priority Mail Innovations
                    M6 = Economy Mail Innovations
                    M7 = MaiI Innovations (MI) Returns
                    70 = UPS Access Point™ Economy
                    71 = UPS Worldwide Express Freight Midday
                    72 = UPS Worldwide Economy DDP
                    74 = UPS Express®12:00
                    75 = UPS Heavy Goods
                    82 = UPS Today Standard
                    83 = UPS Today Dedicated Courier
                    84 = UPS Today Intercity
                    85 = UPS Today Express
                    86 = UPS Today Express Saver
                    96 = UPS Worldwide Express Freight.
                    Note: Only service code 03 is used for Ground Freight Pricing shipments The following Services are not available to return shipment: 13, 59, 82, 83, 84, 85, 86 */
              Code: '03', //* Required
              Description: 'Express',
            },
            Package: {
              Description: ' ',
              Packaging: {
                // Package types. Values are: 01 = UPS Letter 02 = Customer Supplied Package 03 = Tube 04 = PAK 21 = UPS Express Box 24 = UPS 25KG Box 25 = UPS 10KG Box 30 = Pallet 2a = Small Express Box 2b = Medium Express Box 2c = Large Express Box 56 = Flats 57 = Parcels 58 = BPM 59 = First Class 60 = Priority 61 = Machineables 62 = Irregulars 63 = Parcel Post 64 = BPM Parcel 65 = Media Mail 66 = BPM Flat 67 = Standard Flat.
                // Note: Only packaging type code 02 is applicable to Ground Freight Pricing. Package type 24, or 25 is only allowed for shipment without return service. Packaging type must be valid for all the following: ShipTo country or territory, ShipFrom country or territory, a shipment going from ShipTo country or territory to ShipFrom country or territory, all Accessorials at both the shipment and package level, and the shipment service type. UPS will not accept raw wood pallets and please refer the UPS packaging guidelines for pallets on UPS.com.
                Code: '02', //* Required
                Description: '',
              },
              Dimensions: {
                UnitOfMeasurement: {
                  Code: 'IN',
                  Description: 'Inches',
                },
                Length: '10',
                Width: '30',
                Height: '45',
              },
              PackageWeight: {
                UnitOfMeasurement: {
                  Code: 'LBS',
                  Description: 'Pounds',
                },
                Weight: '5',
              },
            },
          },
          LabelSpecification: {
            LabelImageFormat: {
              Code: 'GIF',
              Description: 'GIF',
            },
            HTTPUserAgent: 'Mozilla/4.5',
          },
        },
      };
      console.info('data', JSON.stringify(data, null, 2));

      const resp = await fetch(
        `${process.env.UPS_URL}/api/shipments/${version}/ship?${query}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            transId: 'string',
            transactionSrc: 'testing',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );
      const respObject = await resp.json();
      console.info('respObject', JSON.stringify(respObject, null, 2));
      if (respObject && respObject.response && respObject.response.errors) {
        console.info(
          'respObject.response.errors[0].message',
          respObject.response.errors[0].message,
        );

        return {
          success: false,
          data: null,
          message: respObject.response.errors[0].message,
        };
      } else {
        console.log('In Else for UPS success');

        return {
          success: true,
          data: respObject,
          message: 'Shippment Created',
        };
      }
    } catch (error) {
      console.info('error in UPS service catch :: ', error.message);

      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }
}
