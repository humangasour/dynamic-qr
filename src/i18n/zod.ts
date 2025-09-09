export type TFn = (key: string, values?: Record<string, unknown>) => string;
type IssueLike = {
  code: string;
  path?: Array<string | number>;
  type?: string;
  minimum?: number;
  maximum?: number;
  validation?: string;
};
export type ZodErrorMapLike = (
  issue: IssueLike,
  ctx: { defaultError?: string },
) => {
  message: string;
};

export function buildZodErrorMap(t: TFn): ZodErrorMapLike {
  return (issue, ctx) => {
    const path = (issue.path || []).join('.') || '';
    switch (issue.code) {
      case 'invalid_type':
        return { message: t('validation.unknown') };
      case 'too_small':
        if (issue.type === 'string') {
          if (issue.minimum === 1) {
            if (path.endsWith('slug')) return { message: t('validation.slug.required') };
            if (path.endsWith('name')) return { message: t('validation.name.required') };
            if (path.endsWith('organization') || path.endsWith('org_name')) {
              return { message: t('validation.organization.nameRequired') };
            }
            return { message: t('validation.string.required') };
          }
          return { message: t('validation.string.min', { min: issue.minimum }) };
        }
        if (issue.type === 'array') {
          return { message: t('validation.array.min', { min: issue.minimum }) };
        }
        return { message: t('validation.unknown') };
      case 'too_big':
        if (issue.type === 'string') {
          if (path.endsWith('slug')) return { message: t('validation.slug.max') };
          if (path.endsWith('name'))
            return { message: t('validation.name.max', { max: issue.maximum }) };
          if (path.endsWith('organization') || path.endsWith('org_name')) {
            return { message: t('validation.organization.nameMax', { max: issue.maximum }) };
          }
          return { message: t('validation.string.max', { max: issue.maximum }) };
        }
        if (issue.type === 'array') {
          return { message: t('validation.array.max', { max: issue.maximum }) };
        }
        return { message: t('validation.unknown') };
      case 'invalid_string': {
        if (issue.validation === 'email') return { message: t('validation.email') };
        if (issue.validation === 'url') return { message: t('validation.url.invalid') };
        if (issue.validation === 'regex') {
          if (path.endsWith('password')) return { message: t('validation.password.complexity') };
          if (path.endsWith('name')) return { message: t('validation.name.invalid') };
          return { message: t('validation.string.regex') };
        }
        return { message: t('validation.string.invalid') };
      }
      case 'custom': {
        if (path.endsWith('confirmPassword'))
          return { message: t('validation.password.confirmMismatch') };
        if (path.endsWith('targetUrl')) return { message: t('validation.url.httpOnly') };
        if (path.endsWith('slug')) return { message: t('validation.slug.required') };
        return { message: t('validation.unknown') };
      }
      default:
        return { message: ctx?.defaultError ?? 'Invalid value' };
    }
  };
}
