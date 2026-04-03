// src/components/ui/BarIconButton.jsx
import IconButton from '@mui/material/IconButton';

/** @param {*} props */
const BarIconButton = ({ ref, size = 'small', sx, ...rest }) => {
  return (
    <IconButton
      ref={ref}
      size={size}
      sx={(theme) => ({
        color: theme.palette.action.active,
        '&:hover': {
          color: theme.palette.primary.main,
        },
        ...theme.applyStyles('dark', {
          color: theme.palette.text.secondary,
          '&:hover': {
            color: theme.palette.primary.main,
          },
        }),
        ...sx, // allow overriding styles from parent
      })}
      {...rest} // spread all other props through
    />
  );
};

export default BarIconButton;
