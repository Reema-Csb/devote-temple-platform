import {
  AndClause,
  Condition,
  Filter,
  FilterBuilder,
  OrClause,
  InclusionFilter,
} from '@loopback/repository';
import {SoftDeleteEntity} from 'loopback4-soft-delete';

export class SoftFilterBuilder<E extends SoftDeleteEntity> {
  filter: Filter<E>;

  constructor(originalFilter?: Filter<E>) {
    this.filter = originalFilter ?? {};
  }

  limit(limit: number) {
    this.filter.limit = new FilterBuilder(this.filter)
      .limit(limit)
      .build().limit;
    return this;
  }

  imposeCondition(conditionToEnsure: Condition<E>) {
    this.filter.where = this.filter.where ?? {};
    conditionToEnsure = conditionToEnsure ?? ({deleted: false} as Condition<E>);

    const hasAndClause = (this.filter.where as AndClause<E>).and?.length > 0;
    const hasOrClause = (this.filter.where as OrClause<E>).or?.length > 0;

    if (hasAndClause) {
      (this.filter.where as AndClause<E>).and.push(conditionToEnsure);
    }
    if (hasOrClause) {
      this.filter.where = {
        and: [
          conditionToEnsure,
          {
            or: (this.filter.where as OrClause<E>).or,
          },
        ],
      };
    }
    if (!(hasAndClause && hasOrClause)) {
      Object.assign(this.filter.where, conditionToEnsure);
    }
    return this;
  }

  injectSoftDeleteConditionInIncludes() {
    if (!this.filter?.include) return this;

    const normalizeToArray = (
      include: string | InclusionFilter | (string | InclusionFilter)[],
    ): (string | InclusionFilter)[] => {
      if (Array.isArray(include)) return include;
      return [include];
    };

    const enhanceInclude = (
      includes: (string | InclusionFilter)[],
    ): (string | InclusionFilter)[] => {
      return includes.map(include => {
        if (typeof include === 'string') return include;

        const modifiedInclude: InclusionFilter = {...include};

        modifiedInclude.scope = {
          ...(modifiedInclude.scope ?? {}),
          where: {
            and: [
              ...(modifiedInclude.scope?.where
                ? [modifiedInclude.scope.where]
                : []),
              {deleted: false},
            ],
          },
        };

        const nested = modifiedInclude.scope?.include;
        if (nested) {
          const normalized = normalizeToArray(nested);
          const enhancedNested = enhanceInclude(normalized);

          if (modifiedInclude.scope) {
            modifiedInclude.scope.include = enhancedNested;
          }
        }

        return modifiedInclude;
      });
    };

    this.filter.include = enhanceInclude(normalizeToArray(this.filter.include));
    return this;
  }

  build() {
    return this.filter;
  }
}
