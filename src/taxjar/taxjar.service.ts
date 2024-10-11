// src/taxjar/taxjar.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const Taxjar = require('taxjar'); // Use require to import Taxjar

@Injectable()
export class TaxjarService {
  private client: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('TAXJAR_API_KEY');
    this.client = new Taxjar({ apiKey });
  }

  async calculateSalesTax(order) {
    console.info('order', order);
    try {
      return this.client.taxForOrder(order);
    } catch (error) {
      console.info('error in tax calculate', error);
      return {
        success: false,
      };
    }
  }
}
