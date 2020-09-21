import { Context } from '@src/context';

// todo add LANGUAGE typings
export const localize = (context: Context, i18nKey: Record<string, string>, params?: Record<string, string>) => {
  const locals = i18nKey[context.session.data.language] || i18nKey['en'];
  const res = params ? interpolate(locals, params) : locals;
  return res;
};

export const interpolate = (template: string, params: Record<string, string>) => {
  for (const key in params) {
    template = template.replace('${' + key + '}', params[key]);
  }
  return template;
};
