import { PagingMetaDto } from './paging-meta.dto';

export interface PagingDto<T> {
  data: T[];
  meta: PagingMetaDto;
}