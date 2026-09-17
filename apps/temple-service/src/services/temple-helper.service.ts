import {inject, injectable, BindingScope} from '@loopback/core';
import {PgDataSource} from '../datasources';

@injectable({scope: BindingScope.TRANSIENT})
export class TempleHelperService {
  constructor(
    @inject('datasources.pg')
    public dataSource: PgDataSource,
  ) {}

  async deleteTempleCompletely(templeId: string): Promise<void> {
    await this.dataSource.execute(
      'DELETE FROM main.offering_category_mappings WHERE temple_id = $1',
      [templeId],
    );

    await this.dataSource.execute(
      'DELETE FROM main.temple_locations WHERE temple_id = $1',
      [templeId],
    );

    await this.dataSource.execute(
      'DELETE FROM main.temple_offerings WHERE temple_id = $1',
      [templeId],
    );

    await this.dataSource.execute(
      'DELETE FROM main.temple_images WHERE temple_id = $1',
      [templeId],
    );

    await this.dataSource.execute(
      'DELETE FROM main.temples WHERE id = $1',
      [templeId],
    );
  }
}