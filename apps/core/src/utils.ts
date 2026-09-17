import {Entity, ModelDefinition, PropertyType} from '@loopback/repository';
import {HttpErrors, Model} from '@loopback/rest';
import {
  IBaseMetadata,
  IFileRequestMetadata,
  isMultipartModelMetadata,
} from '@sourceloop/file-utils';

export function getConfigProperty<T, S extends keyof IBaseMetadata<T>>(
  config: IFileRequestMetadata<T>,
  property: S,
  file: Express.Multer.File,
): IBaseMetadata<T>[S] {
  if (isMultipartModelMetadata(config)) {
    file.fieldname = extractLastKey(file.fieldname);
    const isLoopbackModel = (type?: PropertyType) =>
      typeof type === 'function' &&
      (type.prototype instanceof Model || type.prototype instanceof Entity);
    const nestedFields = Object.keys(config.definition).filter(key => {
      const fieldDef = config.definition[key];

      return (
        isLoopbackModel(fieldDef.type) || isLoopbackModel(fieldDef.itemType)
      );
    });
    const def = config.definition[file.fieldname];
    let propertyValue = null;
    if (def) propertyValue = def[property];
    else {
      const childDefs = nestedFields
        .map(field => {
          const fieldDef = config.definition[field];

          let childDef: typeof Model | null = null;
          if (isLoopbackModel(fieldDef.type)) {
            childDef = fieldDef.type as typeof Model;
          } else if (isLoopbackModel(fieldDef.itemType)) {
            childDef = fieldDef.itemType as typeof Model;
          }

          return childDef?.definition ?? null;
        })
        .filter((_def: typeof Model.definition | null) => _def !== null);
      const fieldProperty = childDefs.find(
        (item: ModelDefinition | null) => {
          return item?.properties?.[file.fieldname]?.[property] !== undefined;
        },
      ) as ModelDefinition | undefined;
      propertyValue = fieldProperty?.properties?.[file.fieldname]?.[property];
    }

    if (!propertyValue) {
      throw new HttpErrors.BadRequest('Invalid model configuration');
    }
    return propertyValue;
  } else {
    return config[property];
  }

  function extractLastKey(fullKey: string) {
    const match = fullKey.match(/(?:\.|\[)([^\].]+)\]?$/);
    return match ? match[1] : fullKey;
  }
}
