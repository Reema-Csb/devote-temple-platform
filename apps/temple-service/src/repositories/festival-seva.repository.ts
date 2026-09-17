import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, repository} from '@loopback/repository';
import {AuthenticationBindings} from 'loopback4-authentication';
import {IAuthUserWithPermissions} from '@sourceloop/core';
import {SequelizeUserModifyCrudRepositoryCore} from '@devote/core';

import {PgDataSource} from '../datasources';
import {
  EventFestival,
  FestivalSeva,
  FestivalSevaRelations,
  Temple,
} from '../models';
import {EventFestivalRepository} from './event-festival.repository';
import {TempleRepository} from './temple.repository';

export class FestivalSevaRepository extends SequelizeUserModifyCrudRepositoryCore<
  FestivalSeva,
  typeof FestivalSeva.prototype.id,
  FestivalSevaRelations
> {
  public readonly festival: BelongsToAccessor<
    EventFestival,
    typeof FestivalSeva.prototype.id
  >;

  public readonly temple: BelongsToAccessor<
    Temple,
    typeof FestivalSeva.prototype.id
  >;

  constructor(
    @inject('datasources.pg') dataSource: PgDataSource,

    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public readonly getCurrentUser: Getter<IAuthUserWithPermissions>,

    @repository.getter('EventFestivalRepository')
    protected eventFestivalRepositoryGetter: Getter<EventFestivalRepository>,

    @repository.getter('TempleRepository')
    protected templeRepositoryGetter: Getter<TempleRepository>,
  ) {
    super(FestivalSeva, dataSource, getCurrentUser);

    this.festival = this.createBelongsToAccessorFor(
      'festival',
      eventFestivalRepositoryGetter,
    );

    this.registerInclusionResolver('festival', this.festival.inclusionResolver);

    this.temple = this.createBelongsToAccessorFor(
      'temple',
      templeRepositoryGetter,
    );

    this.registerInclusionResolver('temple', this.temple.inclusionResolver);
  }
}
