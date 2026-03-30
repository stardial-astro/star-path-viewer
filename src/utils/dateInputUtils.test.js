// src/utils/dateInputUtils.test.js
import { describe, it, expect } from 'vitest';
import { CALS, EPH_RANGE_ERR_PREFIX } from './constants';
import { clampDateSync, validateYearSync } from './dateInputUtils';

describe('clampDateSync', () => {
  it.each`
    input1                                      | input2            | expected
    ${{ year: '', month: '', day: '' }}         | ${CALS.gregorian} | ${{ year: '', month: '', day: '' }}
    ${{ year: '3001', month: '', day: '' }}     | ${CALS.gregorian} | ${{ year: '3001', month: '', day: '' }}
    ${{ year: '3000', month: '5', day: '6' }}   | ${CALS.gregorian} | ${{ year: '3000', month: '5', day: '6' }}
    ${{ year: '3000', month: '5', day: '7' }}   | ${CALS.gregorian} | ${{ year: '3000', month: '5', day: '6' }}
    ${{ year: '3001', month: '5', day: '7' }}   | ${CALS.gregorian} | ${{ year: '3001', month: '5', day: '7' }}
    ${{ year: '-3000', month: '1', day: '28' }} | ${CALS.gregorian} | ${{ year: '-3000', month: '1', day: '29' }}
    ${{ year: '3000', month: '4', day: '16' }}  | ${CALS.julian}    | ${{ year: '3000', month: '4', day: '15' }}
    ${{ year: '-3000', month: '2', day: '22' }} | ${CALS.julian}    | ${{ year: '-3000', month: '2', day: '23' }}
  `('clamps $input → $expected', ({ input1, input2, expected }) => {
    expect(clampDateSync(input1, input2).correctedDate).toEqual(expected);
  });
});

describe('validateYearSync', () => {
  it.each`
    input      | expected
    ${''}      | ${''}
    ${'2999'}  | ${''}
    ${'3000'}  | ${EPH_RANGE_ERR_PREFIX + '-3000-01-29/+3000-05-06 (Gregorian)'}
    ${'-3000'} | ${EPH_RANGE_ERR_PREFIX + '-3000-01-29/+3000-05-06 (Gregorian)'}
  `('validates $input → message: $expected', ({ input, expected }) => {
    expect(validateYearSync(input)).toEqual(expected);
  });
});
