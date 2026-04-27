// src/components/ui/CustomIconButton.jsx
import IconButton from '@mui/material/IconButton';

/** @param {*} props */
const CustomIconButton = ({ ref, size = 'small', sx, ...rest }) => {
  return (
    <IconButton
      ref={ref}
      size={size}
      sx={(theme) => ({
        color: 'action.active',
        '&:hover': {
          color: 'primary.main',
        },
        ...theme.applyStyles('dark', {
          color: 'text.secondary',
          '&:hover': {
            color: 'primary.main',
          },
        }),
        ...sx, // allow overriding styles from parent
      })}
      {...rest} // spread all other props through
    />
  );
};

export default CustomIconButton;
