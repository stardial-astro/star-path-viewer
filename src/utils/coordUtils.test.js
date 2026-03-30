// src/utils/coordUtils.test.js
import { describe, it, expect } from 'vitest';
import {
  dmsToDecimal,
  decimalToDms,
  formatDms,
  dmsToHms,
  hmsToDms,
  formatCoordinate,
} from './coordUtils';

describe('dmsToDecimal', () => {
  it.each`
    input                                                       | expected
    ${{ sign: 1, degrees: 0, minutes: 0, seconds: 0 }}          | ${0}
    ${{ sign: -1, degrees: 0, minutes: 0, seconds: 0 }}         | ${0}
    ${{ sign: 1, degrees: 359, minutes: 59, seconds: 59 }}      | ${359.99972222222226}
    ${{ sign: 1, degrees: 359, minutes: 59, seconds: 59.9999 }} | ${359.9999999722222}
    ${{ sign: 1, degrees: 1, minutes: 59, seconds: 56 }}        | ${1.9988888888888889}
    ${{ sign: -1, degrees: 10, minutes: 45, seconds: 0 }}       | ${-10.75}
  `('converts $input → $expected', ({ input, expected }) => {
    expect(dmsToDecimal(input)).toEqual(expected);
  });
});

describe('decimalToDms', () => {
  it.each`
    input       | expected
    ${0}        | ${{ sign: 1, degrees: 0, minutes: 0, seconds: 0 }}
    ${-0}       | ${{ sign: 1, degrees: 0, minutes: 0, seconds: 0 }}
    ${-0.5}     | ${{ sign: -1, degrees: 0, minutes: 30, seconds: 0 }}
    ${1.5}      | ${{ sign: 1, degrees: 1, minutes: 30, seconds: 0 }}
    ${-1.5}     | ${{ sign: -1, degrees: 1, minutes: 30, seconds: 0 }}
    ${2.75}     | ${{ sign: 1, degrees: 2, minutes: 45, seconds: 0 }}
    ${1.999}    | ${{ sign: 1, degrees: 1, minutes: 59, seconds: 56 }}
    ${1.9999}   | ${{ sign: 1, degrees: 2, minutes: 0, seconds: 0 }}
    ${1.99999}  | ${{ sign: 1, degrees: 2, minutes: 0, seconds: 0 }}
    ${10.5}     | ${{ sign: 1, degrees: 10, minutes: 30, seconds: 0 }}
    ${-10.75}   | ${{ sign: -1, degrees: 10, minutes: 45, seconds: 0 }}
    ${359.9999} | ${{ sign: 1, degrees: 0, minutes: 0, seconds: 0 }}
  `('converts $input → $expected', ({ input, expected }) => {
    expect(decimalToDms(input)).toEqual(expected);
  });
});

describe('decimalToDms with fractionDigits', () => {
  it.each`
    input1      | input2 | expected
    ${1.99999}  | ${3}   | ${{ sign: 1, degrees: 1, minutes: 59, seconds: 59.964 }}
    ${1.99999}  | ${1}   | ${{ sign: 1, degrees: 2, minutes: 0, seconds: 0 }}
    ${359.9999} | ${3}   | ${{ sign: 1, degrees: 359, minutes: 59, seconds: 59.64 }}
    ${359.9999} | ${1}   | ${{ sign: 1, degrees: 359, minutes: 59, seconds: 59.6 }}
  `('converts $input → $expected', ({ input1, input2, expected }) => {
    expect(decimalToDms(input1, input2)).toEqual(expected);
  });
});

describe('formatDms', () => {
  it.each`
    input                                                       | expected
    ${{ sign: 1, degrees: 0, minutes: 0, seconds: 0 }}          | ${'+0°00\'00"'}
    ${{ sign: -1, degrees: 0, minutes: 0, seconds: 0 }}         | ${'+0°00\'00"'}
    ${{ sign: 1, degrees: 359, minutes: 59, seconds: 59.9999 }} | ${'+359°59\'60"'}
  `('formats $input → $expected', ({ input, expected }) => {
    expect(formatDms(input)).toEqual(expected);
  });
});

describe('formatDms with fractionDigits', () => {
  it.each`
    input1                                                    | input2 | expected
    ${{ sign: 1, degrees: 359, minutes: 59, seconds: 59.64 }} | ${1}   | ${'+359°59\'59.6"'}
  `('formats $input → $expected', ({ input1, input2, expected }) => {
    expect(formatDms(input1, input2)).toEqual(expected);
  });
});

describe('dmsToHms', () => {
  it.each`
    input                                                       | expected
    ${{ sign: 1, degrees: 0, minutes: 0, seconds: 0 }}          | ${{ sign: 1, hours: 0, minutes: 0, seconds: 0 }}
    ${{ sign: -1, degrees: 0, minutes: 0, seconds: 0 }}         | ${{ sign: 1, hours: 0, minutes: 0, seconds: 0 }}
    ${{ sign: 1, degrees: 359, minutes: 59, seconds: 59 }}      | ${{ sign: 1, hours: 24, minutes: 0, seconds: 0 }}
    ${{ sign: 1, degrees: 359, minutes: 59, seconds: 59.9999 }} | ${{ sign: 1, hours: 24, minutes: 0, seconds: 0 }}
    ${{ sign: 1, degrees: 29, minutes: 59, seconds: 0 }}        | ${{ sign: 1, hours: 1, minutes: 59, seconds: 56 }}
    ${{ sign: -1, degrees: 161, minutes: 15, seconds: 0 }}      | ${{ sign: -1, hours: 10, minutes: 45, seconds: 0 }}
  `('converts $input → $expected', ({ input, expected }) => {
    expect(dmsToHms(input)).toEqual(expected);
  });
});

describe('dmsToHms with fractionDigits', () => {
  it.each`
    input1                                                      | input2 | expected
    ${{ sign: 1, degrees: 359, minutes: 59, seconds: 59.9999 }} | ${6}   | ${{ sign: 1, hours: 23, minutes: 59, seconds: 59.999993 }}
  `('formats $input → $expected', ({ input1, input2, expected }) => {
    expect(dmsToHms(input1, input2)).toEqual(expected);
  });
});

describe('hmsToDms', () => {
  it.each`
    input                                                    | expected
    ${{ sign: 1, hours: 0, minutes: 0, seconds: 0 }}         | ${{ sign: 1, degrees: 0, minutes: 0, seconds: 0 }}
    ${{ sign: -1, hours: 0, minutes: 0, seconds: 0 }}        | ${{ sign: 1, degrees: 0, minutes: 0, seconds: 0 }}
    ${{ sign: 1, hours: 23, minutes: 59, seconds: 59 }}      | ${{ sign: 1, degrees: 359, minutes: 59, seconds: 45 }}
    ${{ sign: 1, hours: 23, minutes: 59, seconds: 59.9999 }} | ${{ sign: 1, degrees: 0, minutes: 0, seconds: 0 }}
    ${{ sign: 1, hours: 1, minutes: 59, seconds: 56 }}       | ${{ sign: 1, degrees: 29, minutes: 59, seconds: 0 }}
    ${{ sign: -1, hours: 10, minutes: 45, seconds: 0 }}      | ${{ sign: -1, degrees: 161, minutes: 15, seconds: 0 }}
  `('converts $input → $expected', ({ input, expected }) => {
    expect(hmsToDms(input)).toEqual(expected);
  });
});

describe('hmsToDms with fractionDigits', () => {
  it.each`
    input1                                                   | input2 | expected
    ${{ sign: 1, hours: 23, minutes: 59, seconds: 59.9999 }} | ${3}   | ${{ sign: 1, degrees: 359, minutes: 59, seconds: 59.999 }}
  `('formats $input → $expected', ({ input1, input2, expected }) => {
    expect(hmsToDms(input1, input2)).toEqual(expected);
  });
});

describe('formatCoordinate', () => {
  it.each`
    input1      | input2   | expected
    ${49.232}   | ${'lat'} | ${'49°13\'55"N'}
    ${-123.026} | ${'lng'} | ${'123°01\'34"W'}
    ${-33.87}   | ${'lat'} | ${'33°52\'12"S'}
    ${118.779}  | ${'lng'} | ${'118°46\'44"E'}
  `('formats $input → $expected', ({ input1, input2, expected }) => {
    expect(formatCoordinate(input1, input2)).toEqual(expected);
  });
});
