  import {inject, Getter} from '@loopback/core';
  import {BelongsToAccessor, repository} from '@loopback/repository';
  import {AuthenticationBindings} from 'loopback4-authentication';
  import {IAuthUserWithPermissions} from '@sourceloop/core';
  import {SequelizeUserModifyCrudRepositoryCore} from '@devote/core';

  import {PgDataSource} from '../datasources';
  import {EventFestival, EventFestivalRelations, Temple} from '../models';
  import {TempleRepository} from './temple.repository';

  export class EventFestivalRepository extends SequelizeUserModifyCrudRepositoryCore<
    EventFestival,
    typeof EventFestival.prototype.id,
    EventFestivalRelations
  > {
    public readonly temple: BelongsToAccessor<
      Temple,
      typeof EventFestival.prototype.id
    >;

    constructor(
      @inject('datasources.pg') dataSource: PgDataSource,
      @inject.getter(AuthenticationBindings.CURRENT_USER)
      public readonly getCurrentUser: Getter<IAuthUserWithPermissions>,
      @repository.getter('TempleRepository')
      protected templeRepositoryGetter: Getter<TempleRepository>,
    ) {
      super(EventFestival, dataSource, getCurrentUser);

      this.temple = this.createBelongsToAccessorFor(
        'temple',
        templeRepositoryGetter,
      );

      this.registerInclusionResolver('temple', this.temple.inclusionResolver);
    }
  }