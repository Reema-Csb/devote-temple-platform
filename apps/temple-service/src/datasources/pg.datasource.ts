import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {SequelizeDataSource} from '@loopback/sequelize';
import * as dotenv from 'dotenv';

dotenv.config();

const config = {
  name: 'pg',
  connector: 'postgresql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.TEMPLE_SERVICE_DB_DATABASE,
  schema: process.env.DB_SCHEMA ?? 'main',
};

@lifeCycleObserver('datasource')
export class PgDataSource
  extends SequelizeDataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'pg';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.pg', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
