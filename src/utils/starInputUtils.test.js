// src/utils/starInputUtils.test.js
import { describe, it, expect } from 'vitest';
import { HIP_INVALID_PREFIX, HIP_OUT_OF_RANGE_MSG } from './constants';
import { validateStarHipSync } from './starInputUtils';

describe.skip('validateStarHipSync', () => {
  it.each`
    input       | expected
    ${''}       | ${{ isValid: true, invalidError: { name: '', hip: '', ra: '', dec: '' } }}
    ${'x'}      | ${{ isValid: false, invalidError: { name: '', hip: HIP_INVALID_PREFIX + 'x', ra: '', dec: '' } }}
    ${'118322'} | ${{ isValid: true, invalidError: { name: '', hip: '', ra: '', dec: '' } }}
    ${'118323'} | ${{ isValid: false, invalidError: { name: '', hip: HIP_OUT_OF_RANGE_MSG, ra: '', dec: '' } }}
    ${'0'}      | ${{ isValid: false, invalidError: { name: '', hip: HIP_OUT_OF_RANGE_MSG, ra: '', dec: '' } }}
  `('validates $input → $expected', ({ input, expected }) => {
    expect(validateStarHipSync(input)).toEqual(expected);
  });
});
