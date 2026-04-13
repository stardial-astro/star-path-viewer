// src/utils/dateUtils.test.js
import { describe, it, expect } from 'vitest';
import {
  hmsToDecimal,
  decimalToHms,
  formatHms,
  formatDatetime,
  formatDatetimeIso,
  datetimeToStr,
  dateToStr,
  formatTimezone,
} from './dateUtils';

describe('hmsToDecimal', () => {
  it.each`
    input                                                    | expected
    ${{ sign: 1, hours: 0, minutes: 0, seconds: 0 }}         | ${0}
    ${{ sign: -1, hours: 0, minutes: 0, seconds: 0 }}        | ${0}
    ${{ sign: 1, hours: 23, minutes: 59, seconds: 59 }}      | ${23.999722222222225}
    ${{ sign: 1, hours: 23, minutes: 59, seconds: 59.9999 }} | ${23.999999972222223}
    ${{ sign: 1, hours: 1, minutes: 59, seconds: 56 }}       | ${1.9988888888888889}
    ${{ sign: -1, hours: 10, minutes: 45, seconds: 0 }}      | ${-10.75}
  `('converts $input → $expected', ({ input, expected }) => {
    expect(hmsToDecimal(input)).toEqual(expected);
  });
});

describe('decimalToHms', () => {
  it.each`
    input      | expected
    ${0}       | ${{ sign: 1, hours: 0, minutes: 0, seconds: 0 }}
    ${-0}      | ${{ sign: 1, hours: 0, minutes: 0, seconds: 0 }}
    ${-0.5}    | ${{ sign: -1, hours: 0, minutes: 30, seconds: 0 }}
    ${1.5}     | ${{ sign: 1, hours: 1, minutes: 30, seconds: 0 }}
    ${-1.5}    | ${{ sign: -1, hours: 1, minutes: 30, seconds: 0 }}
    ${2.75}    | ${{ sign: 1, hours: 2, minutes: 45, seconds: 0 }}
    ${1.999}   | ${{ sign: 1, hours: 1, minutes: 59, seconds: 56 }}
    ${1.9999}  | ${{ sign: 1, hours: 2, minutes: 0, seconds: 0 }}
    ${1.99999} | ${{ sign: 1, hours: 2, minutes: 0, seconds: 0 }}
    ${10.5}    | ${{ sign: 1, hours: 10, minutes: 30, seconds: 0 }}
    ${-10.75}  | ${{ sign: -1, hours: 10, minutes: 45, seconds: 0 }}
    ${23.9999} | ${{ sign: 1, hours: 24, minutes: 0, seconds: 0 }}
  `('converts $input → $expected', ({ input, expected }) => {
    expect(decimalToHms(input)).toEqual(expected);
  });
});

describe('decimalToHms with fractionDigits', () => {
  it.each`
    input1     | input2 | expected
    ${1.99999} | ${3}   | ${{ sign: 1, hours: 1, minutes: 59, seconds: 59.964 }}
    ${1.99999} | ${1}   | ${{ sign: 1, hours: 2, minutes: 0, seconds: 0 }}
    ${23.9999} | ${3}   | ${{ sign: 1, hours: 23, minutes: 59, seconds: 59.64 }}
    ${23.9999} | ${1}   | ${{ sign: 1, hours: 23, minutes: 59, seconds: 59.6 }}
  `('converts $input → $expected', ({ input1, input2, expected }) => {
    expect(decimalToHms(input1, input2)).toEqual(expected);
  });
});

describe('formatHms', () => {
  it.each`
    input                                                    | expected
    ${{ sign: 1, hours: 0, minutes: 0, seconds: 0 }}         | ${'+0h00m00s'}
    ${{ sign: -1, hours: 0, minutes: 0, seconds: 0 }}        | ${'+0h00m00s'}
    ${{ sign: 1, hours: 23, minutes: 59, seconds: 59.9999 }} | ${'+23h59m60s'}
  `('formats $input → $expected', ({ input, expected }) => {
    expect(formatHms(input)).toEqual(expected);
  });
});

describe('formatHms with fractionDigits', () => {
  it.each`
    input1                                                 | input2 | expected
    ${{ sign: 1, hours: 23, minutes: 59, seconds: 59.64 }} | ${1}   | ${'+23h59m59.6s'}
  `('formats $input → $expected', ({ input1, input2, expected }) => {
    expect(formatHms(input1, input2)).toEqual(expected);
  });
});

describe('formatDatetime', () => {
  it.each`
    input                                                                                               | expected
    ${{ datetime: { year: 2000 } }}                                                                     | ${{ date: 'January 1, 2000 CE', time: '12:00:00', year: '2000 CE' }}
    ${{ datetime: { year: 0 } }}                                                                        | ${{ date: 'January 1, 1 BCE', time: '12:00:00', year: '1 BCE' }}
    ${{ datetime: { year: -3000 } }}                                                                    | ${{ date: 'January 1, 3001 BCE', time: '12:00:00', year: '3001 BCE' }}
    ${{ datetime: { year: 0, month: 12, day: 31, hour: 23, minute: 59, second: 59.9999 }, abbr: true }} | ${{ date: 'Dec 31, 1 BCE', time: '23:59:60', year: '1 BCE' }}
    ${{ datetime: { year: 1582, month: 10, day: 15 } }}                                                 | ${{ date: 'October 15, 1582 CE', time: '12:00:00', year: '1582 CE' }}
    ${{ datetime: { year: 1582, month: 10, day: 14 }, langCode: 'zh' }}                                 | ${{ date: '公元1582年10月14日', time: '12:00:00', year: '1582 CE' }}
    ${{ datetime: { year: 0, month: 2, day: 24 }, langCode: 'zh' }}                                     | ${{ date: '公元前1年2月24日', time: '12:00:00', year: '1 BCE' }}
    ${{ datetime: { year: 1912, month: 2, day: 18 }, langCode: 'zh' }}                                  | ${{ date: '公元1912年2月18日', time: '12:00:00', year: '1912 CE' }}
    ${{ datetime: { year: 1912, month: 2, day: 18 }, langCode: 'zh-CN' }}                               | ${{ date: '公元1912年2月18日', time: '12:00:00', year: '1912 CE' }}
    ${{ datetime: { year: 1912, month: 2, day: 18 }, langCode: 'zh-Hans' }}                             | ${{ date: '公元1912年2月18日', time: '12:00:00', year: '1912 CE' }}
    ${{ datetime: { year: 1912, month: 2, day: 17 }, langCode: 'zh-HK' }}                               | ${{ date: '西元1912年2月17日', time: '12:00:00', year: '1912 CE' }}
    ${{ datetime: { year: 1912, month: 2, day: 17 }, langCode: 'zh-Hant' }}                             | ${{ date: '西元1912年2月17日', time: '12:00:00', year: '1912 CE' }}
  `('formats $input → $expected', ({ input, expected }) => {
    expect(formatDatetime(input)).toEqual(expected);
  });
});

describe('formatDatetimeIso', () => {
  it.each`
    input                                                              | expected
    ${{ year: 2000 }}                                                  | ${{ date: '+2000-01-01', time: '12:00:00' }}
    ${{ year: 100, month: 2, day: 15, hour: 1, minute: 1, second: 1 }} | ${{ date: '+0100-02-15', time: '01:01:01' }}
    ${{ year: 0, hour: 23, minute: 59, second: 59.9999 }}              | ${{ date: '+0000-01-01', time: '23:59:60' }}
    ${{ year: -3000, hour: 0, minute: 0, second: 0.1 }}                | ${{ date: '-3000-01-01', time: '00:00:00' }}
  `('formats $input → $expected', ({ input, expected }) => {
    expect(formatDatetimeIso(input)).toEqual(expected);
  });
});

describe('datetimeToStr', () => {
  it.each`
    input                                                             | expected
    ${{ datetimeArr: [2000, 1, 1, 12, 0, 0] }}                        | ${'+2000-01-01 12:00:00'}
    ${{ datetimeArr: [2000, 1, 1, 12, 0, 0] }}                        | ${'+2000-01-01 12:00:00'}
    ${{ datetimeArr: [2000.5, 1, 1, 12, 0, 0], delim: 'T' }}          | ${'+2000-01-01T12:00:00'}
    ${{ datetimeArr: [-3000, 1, 1, 23, 59, 59.9999], iso: false }}    | ${'January 1, 3001 BCE, 23:59:60'}
    ${{ datetimeArr: [0, 12, 31, 12, 0, 0], iso: false, abbr: true }} | ${'Dec 31, 1 BCE, 12:00:00'}
  `('formats $input → $expected', ({ input, expected }) => {
    expect(datetimeToStr(input)).toEqual(expected);
  });
});

describe('dateToStr', () => {
  it.each`
    input                                               | expected
    ${{ dateArr: [2000, 1, 1] }}                        | ${'+2000-01-01'}
    ${{ dateArr: [2000.5, 1, 1] }}                      | ${'+2000-01-01'}
    ${{ dateArr: [-3000, 1, 1], iso: false }}           | ${'January 1, 3001 BCE'}
    ${{ dateArr: [0, 12, 31], iso: false, abbr: true }} | ${'Dec 31, 1 BCE'}
  `('formats $input → $expected', ({ input, expected }) => {
    expect(dateToStr(input)).toEqual(expected);
  });
});

describe('formatTimezone', () => {
  it.each`
    input1  | input2   | expected
    ${8}    | ${false} | ${'+08:00'}
    ${-8}   | ${false} | ${'-08:00'}
    ${0}    | ${false} | ${'+00:00'}
    ${0}    | ${true}  | ${'Z'}
    ${-0}   | ${false} | ${'+00:00'}
    ${0}    | ${true}  | ${'Z'}
    ${-3.5} | ${false} | ${'-03:30'}
  `('formats $input → $expected', ({ input1, input2, expected }) => {
    expect(formatTimezone(input1, input2)).toEqual(expected);
  });
});
