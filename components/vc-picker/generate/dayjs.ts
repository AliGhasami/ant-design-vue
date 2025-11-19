import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import type { GenerateConfig } from '.';
import { noteOnce } from '../../vc-util/warning';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(quarterOfYear);

const TIMEZONE = 'Canada/Atlantic';

dayjs.extend((_o, c) => {
  // todo support Wo (ISO week)
  const proto = c.prototype;
  const oldFormat = proto.format;
  proto.format = function f(formatStr: string) {
    const str = (formatStr || '').replace('Wo', 'wo');
    return oldFormat.bind(this)(str);
  };
});

type IlocaleMapObject = Record<string, string>;
const localeMap: IlocaleMapObject = {
  // ar_EG:
  // az_AZ:
  // bg_BG:
  bn_BD: 'bn-bd',
  by_BY: 'be',
  // ca_ES:
  // cs_CZ:
  // da_DK:
  // de_DE:
  // el_GR:
  en_GB: 'en-gb',
  en_US: 'en',
  // es_ES:
  // et_EE:
  // fa_IR:
  // fi_FI:
  fr_BE: 'fr', // todo: dayjs has no fr_BE locale, use fr at present
  fr_CA: 'fr-ca',
  // fr_FR:
  // ga_IE:
  // gl_ES:
  // he_IL:
  // hi_IN:
  // hr_HR:
  // hu_HU:
  hy_AM: 'hy-am',
  // id_ID:
  // is_IS:
  // it_IT:
  // ja_JP:
  // ka_GE:
  // kk_KZ:
  // km_KH:
  kmr_IQ: 'ku',
  // kn_IN:
  // ko_KR:
  // ku_IQ: // previous ku in antd
  // lt_LT:
  // lv_LV:
  // mk_MK:
  // ml_IN:
  // mn_MN:
  // ms_MY:
  // nb_NO:
  // ne_NP:
  nl_BE: 'nl-be',
  // nl_NL:
  // pl_PL:
  pt_BR: 'pt-br',
  // pt_PT:
  // ro_RO:
  // ru_RU:
  // sk_SK:
  // sl_SI:
  // sr_RS:
  // sv_SE:
  // ta_IN:
  // th_TH:
  // tr_TR:
  // uk_UA:
  // ur_PK:
  // vi_VN:
  zh_CN: 'zh-cn',
  zh_HK: 'zh-hk',
  zh_TW: 'zh-tw',
};

const parseLocale = (locale: string) => {
  const mapLocale = localeMap[locale];
  return mapLocale || locale.split('_')[0];
};

const parseNoMatchNotice = () => {
  /* istanbul ignore next */
  noteOnce(false, 'Not match any format. Please help to fire a issue about this.');
};

const advancedFormatRegex = /\[([^\]]+)]|Q|wo|ww|w|WW|W|zzz|z|gggg|GGGG|k{1,2}|S/g;

function findTargetStr(val: string, index: number, segmentation: string) {
  const items = [...new Set(val.split(segmentation))];
  let idx = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    idx += item.length;
    if (idx > index) {
      return item;
    }
    idx += segmentation.length;
  }
}

const toDateWithValueFormat = (val: string | Dayjs, valueFormat: string) => {
  if (!val) return null;
  if (dayjs.isDayjs(val)) {
    return val.tz(TIMEZONE);
  }
  const matchs = valueFormat.matchAll(advancedFormatRegex);
  let baseDate = dayjs.tz(val, valueFormat, TIMEZONE);
  if (matchs === null) {
    return baseDate;
  }
  for (const match of matchs) {
    const origin = match[0];
    const index = match['index'];

    if (origin === 'Q') {
      const segmentation = val.slice(index - 1, index);
      const quarterStr = findTargetStr(val, index, segmentation).match(/\d+/)[0];
      baseDate = baseDate.quarter(parseInt(quarterStr));
    }

    if (origin.toLowerCase() === 'wo') {
      const segmentation = val.slice(index - 1, index);
      const weekStr = findTargetStr(val, index, segmentation).match(/\d+/)[0];
      baseDate = baseDate.week(parseInt(weekStr));
    }

    if (origin.toLowerCase() === 'ww') {
      baseDate = baseDate.week(parseInt(val.slice(index, index + origin.length)));
    }

    if (origin.toLowerCase() === 'w') {
      baseDate = baseDate.week(parseInt(val.slice(index, index + origin.length + 1)));
    }
  }

  return baseDate;
};

const generateConfig: GenerateConfig<Dayjs> = {
  // get
  getNow: () => dayjs().tz(TIMEZONE),
  getFixedDate: string => dayjs(string, ['YYYY-M-DD', 'YYYY-MM-DD']).tz(TIMEZONE),
  getEndDate: date => date.tz(TIMEZONE).endOf('month'),
  getWeekDay: date => {
    const clone = date.tz(TIMEZONE).locale('en');
    return clone.weekday() + clone.localeData().firstDayOfWeek();
  },
  getYear: date => date.tz(TIMEZONE).year(),
  getMonth: date => date.tz(TIMEZONE).month(),
  getDate: date => {
    return date.format('D');
    if (date.tz(TIMEZONE).format('D') == 2) {
      debugger;
    }
    console.log('||||||', date.format(), date.tz(TIMEZONE).date(), date.tz(TIMEZONE).format('D'));
    //const temp=
    return date.tz(TIMEZONE).format('D');
  },
  getHour: date => date.tz(TIMEZONE).hour(),
  getMinute: date => date.tz(TIMEZONE).minute(),
  getSecond: date => date.tz(TIMEZONE).second(),

  // set
  addYear: (date, diff) => date.tz(TIMEZONE).add(diff, 'year'),
  addMonth: (date, diff) => date.tz(TIMEZONE).add(diff, 'month'),
  addDate: (date, diff) => date.tz(TIMEZONE).add(diff, 'day'),
  setYear: (date, year) => date.tz(TIMEZONE).year(year),
  setMonth: (date, month) => date.tz(TIMEZONE).month(month),
  setDate: (date, num) => date.tz(TIMEZONE).date(num),
  setHour: (date, hour) => date.tz(TIMEZONE).hour(hour),
  setMinute: (date, minute) => date.tz(TIMEZONE).minute(minute),
  setSecond: (date, second) => date.tz(TIMEZONE).second(second),

  // Compare
  isAfter: (date1, date2) => date1.tz(TIMEZONE).isAfter(date2.tz(TIMEZONE)),
  isValidate: date => date.tz(TIMEZONE).isValid(),

  locale: {
    getWeekFirstDay: locale =>
      dayjs().tz(TIMEZONE).locale(parseLocale(locale)).localeData().firstDayOfWeek(),
    getWeekFirstDate: (locale, date) => date.tz(TIMEZONE).locale(parseLocale(locale)).weekday(0),
    getWeek: (locale, date) => date.tz(TIMEZONE).locale(parseLocale(locale)).week(),
    getShortWeekDays: locale =>
      dayjs().tz(TIMEZONE).locale(parseLocale(locale)).localeData().weekdaysMin(),
    getShortMonths: locale =>
      dayjs().tz(TIMEZONE).locale(parseLocale(locale)).localeData().monthsShort(),
    format: (locale, date, format) => date.tz(TIMEZONE).locale(parseLocale(locale)).format(format),
    parse: (locale, text, formats) => {
      const localeStr = parseLocale(locale);
      for (let i = 0; i < formats.length; i += 1) {
        const format = formats[i];
        const formatText = text;
        if (format.includes('wo') || format.includes('Wo')) {
          // parse Wo
          const year = formatText.split('-')[0];
          const weekStr = formatText.split('-')[1];
          const firstWeek = dayjs.tz(year, 'YYYY', TIMEZONE).startOf('year').locale(localeStr);
          for (let j = 0; j <= 52; j += 1) {
            const nextWeek = firstWeek.add(j, 'week');
            if (nextWeek.format('Wo') === weekStr) {
              return nextWeek;
            }
          }
          parseNoMatchNotice();
          return null;
        }
        const date = dayjs.tz(formatText, format, TIMEZONE).locale(localeStr);
        if (date.isValid()) {
          return date;
        }
      }

      if (!text) {
        parseNoMatchNotice();
      }
      return null;
    },
  },

  toDate: (value, valueFormat) => {
    if (Array.isArray(value)) {
      return value.map((val: any) => toDateWithValueFormat(val, valueFormat)) as Dayjs[];
    } else {
      return toDateWithValueFormat(value, valueFormat) as Dayjs;
    }
  },
  toString: (value, valueFormat) => {
    if (Array.isArray(value)) {
      return value.map((val: any) =>
        dayjs.isDayjs(val) ? val.tz(TIMEZONE).format(valueFormat) : val,
      );
    } else {
      return dayjs.isDayjs(value) ? value.tz(TIMEZONE).format(valueFormat) : value;
    }
  },
};

export default generateConfig;
