// src/components/UI/CustomFormControlLabel.js
import FormControlLabel from '@mui/material/FormControlLabel';
import { styled } from '@mui/material/styles';

const CustomFormControlLabel = styled(FormControlLabel)(({ theme, checked }) => ({
  '& .MuiSvgIcon-root': {
    fontSize: theme.typography.body2.fontSize,
  },
  '& .MuiFormControlLabel-label': {
    fontWeight: checked ? 500 : 'normal',
  },
  // border: checked ? `1px solid ${theme.palette.primary.main}` : 'none',
  // borderRadius: checked ? theme.shape.borderRadius : 0,
  // padding: checked ? theme.spacing(0.1, 1, 0.1, 0.1) : 0,
  [theme.breakpoints.up('xs')]: { padding: theme.spacing(0, 1) },
  [theme.breakpoints.up('sm')]: { padding: theme.spacing(0, 2) },
  [theme.breakpoints.up('md')]: { padding: theme.spacing(0, 3) },
  color: checked ? theme.palette.primary.main : 'inherit',
}));

export default CustomFormControlLabel;
