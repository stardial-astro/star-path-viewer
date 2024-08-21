// src/components/StarInput.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { TextField, Stack, Grid, ToggleButton, ToggleButtonGroup, MenuItem, RadioGroup, Radio, FormControl, Typography } from '@mui/material';
import { STARS } from '../utils/constants';
import { dmsToDecimal } from '../utils/coordUtils';
import { hmsToDecimal } from '../utils/dateUtils';
import Config from '../Config';
import CustomFormControlLabel from './ui/CustomFormControlLabel';
import debounce from 'lodash/debounce';

/* Validate the star params */
const validateStarSync = (inputType, radecFormat, star) => {
  let newStarError = { name: '', hip: '', ra: '', dec: '' };

  if (inputType === 'hip') {
    if (!/^\d*$/.test(star.hip)) {
      return { ...newStarError, hip: 'Invalid Hipparchus catalogue number.' };
    }
    if (star.hip) {
      const hip = parseInt(star.hip);
      if (hip < 1 || hip > 118322) {
        return { ...newStarError, hip: 'The Hipparchus Catalogue Number must be in the range [1, 118322].' };
      }
    }
  } else if (inputType === 'radec') {
    if (radecFormat === 'decimal') {
      if (!/^\d*(\.\d+)?$/.test(star.ra)) {
        return { ...newStarError, ra: 'The right ascension must be a positive decimal.' };
      }
      if (!/^-?\d*(\.\d+)?$/.test(star.dec)) {
        return { ...newStarError, dec: 'The declination must be a decimal.' };
      }

      if (star.ra) {
        const ra = parseFloat(star.ra);
        if (ra < 0 || ra >= 360) {
          return { ...newStarError, ra: 'The right ascension must be in the range [0°, 360°).' };
        }
      }
    } else {
      if (!/^\d*$/.test(star.raHMS.hours)) {
        return { ...newStarError, ra: 'The hours must be a positive integer.' };
      }
      if (!/^-?\d*$/.test(star.decDMS.degrees)) {
        return { ...newStarError, dec: 'The degrees must be an integer.' };
      }
      if (!/^\d*$/.test(star.raHMS.minutes)) {
        return { ...newStarError, ra: 'The minutes must be a positive integer.' };
      }
      if (!/^\d*$/.test(star.decDMS.minutes)) {
        return { ...newStarError, dec: 'The minutes must be a positive integer.' };
      }
      if (!/^\d*(\.\d+)?$/.test(star.raHMS.seconds)) {
        return { ...newStarError, ra: 'The seconds must be a positive decimal.' };
      }
      if (!/^\d*(\.\d+)?$/.test(star.decDMS.seconds)) {
        return { ...newStarError, dec: 'The seconds must be a positive decimal.' };
      }

      if (star.ra) {
        const ra = parseFloat(star.ra);
        if (ra < 0 || ra >= 360) {
          return { ...newStarError, ra: 'The right ascension must be in the range [0h, 24h).' };
        }
      }
    }

    if (star.dec) {
      const dec = parseFloat(star.dec);
      if (dec < -90 || dec > 90) {
        return { ...newStarError, dec: 'The declination must be in the range [-90°, 90°].' };
      }
    }
  }

  return newStarError;
};

const StarInput = ({ onStarChange, setErrorMessage, setStarValid, fieldError, setFieldError }) => {
  // console.log('Rendering StarInput');
  const [inputType, setInputType] = useState('name');  // 'name', 'hip', 'radec'
  const [radecFormat, setRadecFormat] = useState('dms');  // 'decimal', 'dms'
  const [star, setStar] = useState({
    name: '', hip: '', ra: '', dec: '',
    raHMS: { hours: '', minutes: '', seconds: '' }, decDMS: { degrees: '', minutes: '', seconds: '' },
  });
  const [starError, setStarError] = useState({ name: '', hip: '', ra: '', dec: '' });

  const clearError = useCallback(() => {
    setErrorMessage((prev) => ({ ...prev, star: '' }));
    setStarError({ name: '', hip: '', ra: '', dec: '' });
  }, [setErrorMessage]);

  /* Initialize */
  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    onStarChange({
      name: star.name,
      hip: star.hip,
      ra: star.ra,
      dec: star.dec,
      type: inputType,
    });
  }, [star, inputType, onStarChange]);

  /* Reset error when user starts typing */
  useEffect(() => {
    clearError();
  }, [star, inputType, radecFormat, clearError, setStarValid]);

  useEffect(() => {
    setFieldError((prev) => ({ ...prev, name: '' }));
  }, [star.name, inputType, setFieldError]);

  useEffect(() => {
    setFieldError((prev) => ({ ...prev, hip: '' }));
  }, [star.hip, inputType, setFieldError]);

  useEffect(() => {
    setFieldError((prev) => ({ ...prev, ra: '' }));
  }, [star.ra, inputType, radecFormat, setFieldError]);

  useEffect(() => {
    setFieldError((prev) => ({ ...prev, dec: '' }));
  }, [star.dec, inputType, radecFormat, setFieldError]);

  const handleInputTypeChange = useCallback((event, newInputType) => {
    if (newInputType !== null) {
      /* Clear the fields */
      setStar({
        name: '', hip: '', ra: '', dec: '',
        raHMS: { hours: '', minutes: '', seconds: '' }, decDMS: { degrees: '', minutes: '', seconds: '' },
      });
      setInputType(newInputType);
    }
  }, []);

  const handleRadecFormatChange = useCallback((event) => {
    /* Clear the fields */
    setStar((prev) => ({
      ...prev,
      ra: '', dec: '',
      raHMS: { hours: '', minutes: '', seconds: '' }, decDMS: { degrees: '', minutes: '', seconds: '' },
    }));
    setRadecFormat(event.target.value);
  }, []);

  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setStar((prev) => {
      const newStar = { ...prev };
      const [field, subfield] = name.split('.');

      if (subfield && radecFormat === 'dms') {
        newStar[field][subfield] = value;
        /* If at least one of the subfields is provided, convert HMS/DMS to decimal degrees */
        if (field === 'raHMS') {
          newStar.ra = newStar.raHMS.hours || newStar.raHMS.minutes || newStar.raHMS.seconds
            ? (hmsToDecimal({
                sign: newStar.raHMS.hours[0] === '-' ? -1 : 1,
                hours: Math.abs(parseInt(newStar.raHMS.hours)) || 0,
                minutes: parseInt(newStar.raHMS.minutes) || 0,
                seconds: parseInt(newStar.raHMS.seconds) || 0,
              }) * 15).toString()
            : '';
        } else if (field === 'decDMS') {
          newStar.dec = newStar.decDMS.degrees || newStar.decDMS.minutes || newStar.decDMS.seconds
            ? dmsToDecimal({
                sign: newStar.decDMS.degrees[0] === '-' ? -1 : 1,
                degrees: Math.abs(parseInt(newStar.decDMS.degrees)) || 0,
                minutes: parseInt(newStar.decDMS.minutes) || 0,
                seconds: parseInt(newStar.decDMS.seconds) || 0,
              }).toString()
            : '';
        }
      } else {
        newStar[name] = value;
        /* Convert decimal degrees to HMS/DMS */
        // if (field === 'ra') {
        //   const hms = decimalToHMS(parseFloat(value) / 15);
        //   newStar.raHMS.hours = `${hms.sign < 0 '-' : ''}${hms.hours}`;
        //   newStar.raHMS.minutes = hms.minutes.toString();
        //   newStar.raHMS.seconds = hms.seconds.toString();
        // } else if (field === 'dec') {
        //   const dms = decimalToDMS(parseFloat(value));
        //   newStar.decDMS.degrees = `${dms.sign < 0 '-' : ''}${dms.degrees}`;
        //   newStar.decDMS.minutes = dms.minutes.toString();
        //   newStar.decDMS.seconds = dms.seconds.toString();
        // }
      }

      return newStar;
    });
  }, [radecFormat]);

  const debouncedValidateStar = useMemo(
    () => debounce((inputType, radecFormat, star) => {
      const validationResult = validateStarSync(inputType, radecFormat, star);
      const isValid = !Object.values(validationResult).some(item => !!item);
      setStarError(validationResult);
      setStarValid(isValid);
    }, Config.TypingDelay / 2),
    [setStarValid]
  );

  useEffect(() => {
    debouncedValidateStar(inputType, radecFormat, star);
    /* Cleanup function */
    return () => {
      debouncedValidateStar.cancel();
    };
  }, [star, inputType, radecFormat, debouncedValidateStar]);

  return (
    <Stack direction="column">
      <ToggleButtonGroup
        color="primary"
        size="small"
        value={inputType}
        exclusive
        onChange={handleInputTypeChange}
        aria-label="Input type"
        fullWidth
      >
        <ToggleButton value="name" aria-label="Input Name">
          Planet
        </ToggleButton>
        <ToggleButton value="hip" aria-label="Input Hipparchus">
          Star
        </ToggleButton>
        <ToggleButton value="radec" aria-label="Input RA/Dec">
          RA/Dec (J2000)
        </ToggleButton>
      </ToggleButtonGroup>

      {inputType === 'name' && (
        <TextField
          required
          select
          autoComplete="off"
          label="Planet Name"
          InputLabelProps={{ htmlFor: 'star-select' }}
          inputProps={{ id: 'star-select' }}
          size="small"
          variant="outlined"
          name="name"
          value={star.name}
          onChange={handleInputChange}
          fullWidth
          error={!!starError.name || !!fieldError.name}
          helperText={starError.name || fieldError.name}
          sx={{ marginTop: 2 }}
        >
          <MenuItem key="none" value="" sx={{ color: 'action.active' }}>-- Select a name --</MenuItem>
          {Object.keys(STARS).map((key) => (
            <MenuItem key={key} value={key}>{key}</MenuItem>
          ))}
        </TextField>
      )}
      {inputType === 'hip' && (
        <TextField
          required
          label="Hipparchus Catalogue Number"
          size="small"
          variant="outlined"
          name="hip"
          type="number"
          value={star.hip}
          onChange={handleInputChange}
          fullWidth
          error={!!starError.hip || !!fieldError.hip}
          helperText={starError.hip || fieldError.hip}
          sx={{ marginTop: 2 }}
        />
      )}
      {inputType === 'radec' && (
        <div>
          <FormControl>
            <RadioGroup
              row
              sx={{ marginTop: 0.8, marginBottom: 1, justifyContent: 'space-around' }}
              value={radecFormat}
              onChange={handleRadecFormatChange}
            >
              <CustomFormControlLabel
                size="small"
                value="dms"
                control={<Radio />}
                label="HMS and DMS"
                checked={radecFormat === 'dms'}
              />
              <CustomFormControlLabel
                size="small"
                value="decimal"
                control={<Radio />}
                label="Decimal Degrees"
                checked={radecFormat === 'decimal'}
              />
            </RadioGroup>
          </FormControl>

          {radecFormat === 'decimal' ? (
            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  required
                  label="Right Ascension (RA)"
                  placeholder="Enter in decimal degrees"
                  size="small"
                  variant="outlined"
                  name="ra"
                  type="number"
                  value={star.ra}
                  onChange={handleInputChange}
                  fullWidth
                  error={!!starError.ra || !!fieldError.ra}
                  helperText={starError.ra || fieldError.ra}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  required
                  label="Declination (Dec)"
                  placeholder="Enter in decimal degrees"
                  size="small"
                  variant="outlined"
                  name="dec"
                  type="number"
                  value={star.dec}
                  onChange={handleInputChange}
                  fullWidth
                  error={!!starError.dec || !!fieldError.dec}
                  helperText={starError.dec || fieldError.dec}
                />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={{ xs: 3, sm: 2, md: 3 }} alignItems="flex-start">
              <Grid container item xs={12} sm={12} md={6} rowSpacing={2} columnSpacing={1} alignItems="center" justifyContent="space-between">
                <Grid item xs={12} sm="auto" md="auto">
                  <Typography variant="body1">
                    RA
                </Typography>
                </Grid>
                <Grid item xs={12} sm={3.5} md={3.5}>
                  <TextField
                    required
                    label="Hours"
                    size="small"
                    variant="outlined"
                    name="raHMS.hours"
                    type="number"
                    value={star.raHMS.hours}
                    onChange={handleInputChange}
                    inputProps={{ min: 0, max: 23 }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={3.5} md={3.5}>
                  <TextField
                    required
                    label="Minutes"
                    size="small"
                    variant="outlined"
                    name="raHMS.minutes"
                    type="number"
                    value={star.raHMS.minutes}
                    onChange={handleInputChange}
                    inputProps={{ min: 0, max: 59 }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={3.5} md={3.5}>
                  <TextField
                    required
                    label="Seconds"
                    size="small"
                    variant="outlined"
                    name="raHMS.seconds"
                    type="number"
                    value={star.raHMS.seconds}
                    onChange={handleInputChange}
                    inputProps={{ min: 0, max: 59 }}
                    fullWidth
                  />
                </Grid>
                {(starError.ra || fieldError.ra) && (
                  <Grid item xs={12} sm={12} md={12} style={{ paddingTop: 0 }}>
                    <Typography color="error" variant="body2" sx={{ marginTop: '4px', marginX: '14px', fontSize: '0.85rem', textAlign: 'left' }}>
                      {starError.ra || fieldError.ra}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              <Grid container item xs={12} sm={12} md={6} rowSpacing={2} columnSpacing={1} alignItems="center" justifyContent="space-between">
                <Grid item xs={12} sm="auto" md="auto">
                  <Typography variant="body1">
                    Dec
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3.5} md={3.5}>
                  <TextField
                    required
                    label="Degrees"
                    size="small"
                    variant="outlined"
                    name="decDMS.degrees"
                    type="number"
                    value={star.decDMS.degrees}
                    onChange={handleInputChange}
                    inputProps={{ min: -90, max: 90 }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={3.5} md={3.5}>
                  <TextField
                    required
                    label="Minutes"
                    size="small"
                    variant="outlined"
                    name="decDMS.minutes"
                    type="number"
                    value={star.decDMS.minutes}
                    onChange={handleInputChange}
                    inputProps={{ min: 0, max: 59 }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={3.5} md={3.5}>
                  <TextField
                    required
                    label="Seconds"
                    size="small"
                    variant="outlined"
                    name="decDMS.seconds"
                    type="number"
                    value={star.decDMS.seconds}
                    onChange={handleInputChange}
                    inputProps={{ min: 0, max: 59 }}
                    fullWidth
                  />
                </Grid>
                {(starError.dec || fieldError.dec) && (
                  <Grid item xs={12} sm={12} md={12} style={{ paddingTop: 0 }}>
                    <Typography color="error" variant="body2" sx={{ marginTop: '4px', marginX: '14px', fontSize: '0.85rem', textAlign: 'left' }}>
                      {starError.dec || fieldError.dec}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Grid>
          )}
        </div>
      )}
    </Stack>
  );
};

StarInput.propTypes = {
  onStarChange: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
  setStarValid: PropTypes.func.isRequired,
  fieldError: PropTypes.shape({
    name: PropTypes.string.isRequired,
    hip: PropTypes.string.isRequired,
    ra: PropTypes.string.isRequired,
    dec: PropTypes.string.isRequired,
  }).isRequired,
  setFieldError: PropTypes.func.isRequired,
};

export default React.memo(StarInput);
