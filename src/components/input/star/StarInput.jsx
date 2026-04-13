// src/components/input/star/StarInput.jsx
import { memo } from 'react';
import { Stack } from '@mui/material';
import { useStarInput } from '@context/StarInputContext';
import { STAR_INPUT_TYPES } from '@utils/constants';
import StarInputTypeToggle from './StarInputTypeToggle';
import StarNameInput from './StarNameInput';
import StarHipInput from './StarHipInput';
import RadecInput from './RadecInput';

const StarInput = () => {
  // console.log('Rendering StarInput');
  const { starInputType } = useStarInput();

  /* ------------------------------------------------------------------|
   * Initialize
   * ------------------------------------------------------------------|
   */
  /* [StarNameInput] Clear errors & null errors;
   * clear name, HIP, suggestions, RA/Dec and resets validity
   * > Also clears lastSelectedTermRef in [StarHipInput]
   */
  /* [StarHipInput] Clear errors & null errors */
  /* [RadecInput] Clear errors & null errors */

  /* ------------------------------------------------------------------|
   * Clear errors when user starts typing
   * ------------------------------------------------------------------|
   */
  /* [StarNameInput] Clear errors & null errors when user selects a name option; reset validity */
  /* [StarHipInput] Clear errors & null errors when user starts typing in HIP search bar; reset validity */
  /* [RadecInput] Clear errors & null errors when user starts typing RA/Dec; reset validity */
  /* [RadecInput] Clear errors & null and reset validity when toggles RA/Dec format; reset validity */

  /* ------------------------------------------------------------------|
   * Update refs
   * ------------------------------------------------------------------|
   */

  /* ------------------------------------------------------------------|
   * Clear stale data on input change
   * ------------------------------------------------------------------|
   */
  /* [StarInputTypeToggle] When toggles, clear name, HIP, suggestions, RA/Dec and resets validity */
  /* [StarHipInput] Clear name, HIP, suggestions, and lastSelectedTermRef
   * > Also clears lastSelectedTermRef
   * if debounced searchTerm is cleared
   */
  /* [RadecFormatToggle] When toggles, clear RA/Dec */

  /* ------------------------------------------------------------------|
   * Validate input
   * ------------------------------------------------------------------|
   */
  /* [StarNameInput] Set valid if selects a star */
  // /* [StarHipInput] Validate HIP on HIP change */

  /* ------------------------------------------------------------------|
   * Fetch data
   * ------------------------------------------------------------------|
   */
  /* [StarHipInput] Fetch suggestions on debounced searchTerm change */

  return (
    <Stack direction="column">
      <StarInputTypeToggle />
      {starInputType === STAR_INPUT_TYPES.name ? (
        <StarNameInput />
      ) : starInputType === STAR_INPUT_TYPES.hip ? (
        <StarHipInput />
      ) : (
        <RadecInput />
      )}
    </Stack>
  );
};

export default memo(StarInput);
