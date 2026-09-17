import {BindingKey, CoreBindings} from '@loopback/core';
import {CoreComponent} from './component';

/**
 * Binding keys used by this component.
 */
export namespace CoreComponentBindings {
  export const COMPONENT = BindingKey.create<CoreComponent>(
    `${CoreBindings.COMPONENTS}.CoreComponent`,
  );

  export const S3_SERVICE = BindingKey.create<CoreComponent>(
    `${CoreBindings.COMPONENTS}.s3-service`,
  );

  export const FILE_ADAPTOR_SERVICE = BindingKey.create<CoreComponent>(
    `${CoreBindings.COMPONENTS}.file-adaptor-service`,
  );
}
