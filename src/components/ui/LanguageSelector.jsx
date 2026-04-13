// src/components/ui/LanguageSelector.jsx
import { useTransition, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { Translate as TranslateIcon } from '@mui/icons-material';
import CustomIconButton from './CustomIconButton';

/** @type {LangObj[]} */
const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '简体中文' },
  { code: 'zh-HK', label: '繁體中文' },
];

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  /** @type {[HTMLElement | null, ReactSetState]} */
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  /** @type {(event: ReactMouseEvent<HTMLButtonElement>) => void} */
  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  /** @type {(langCode?: LangCode) => void} */
  const handleClose = useCallback(
    (langCode) => {
      setAnchorEl(null);
      if (langCode && langCode !== i18n.language) {
        startTransition(async () => {
          await i18n.changeLanguage(langCode);
        });
      }
    },
    [i18n],
  );

  return (
    <>
      <Tooltip title={t('change_language')} placement="bottom">
        <div>
          <CustomIconButton
            onClick={handleClick}
            aria-controls={open ? 'language-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            disabled={isPending}
          >
            <TranslateIcon fontSize="inherit" />
          </CustomIconButton>
        </div>
      </Tooltip>

      <Menu
        disableScrollLock
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        aria-hidden={!open} // fix "Blocked aria-hidden on an element" error
        onClose={() => handleClose()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {LANGS.map((lang) => (
          <MenuItem
            dense
            key={lang.code}
            selected={
              lang.code === i18n.resolvedLanguage || lang.code === i18n.language
            }
            onClick={() => handleClose(lang.code)}
            sx={{ minHeight: 'auto', py: 0.5 }}
          >
            <Typography variant="body2">{lang.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSelector;
