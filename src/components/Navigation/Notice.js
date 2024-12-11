// src/components/Navigation/Notice.js
import React, { useMemo } from 'react';
import { Alert } from '@mui/material';

const startTime = new Date(Date.UTC(2024, 11, 11, 6, 50, 0));  // month - 1
const endTime = new Date(Date.UTC(2024, 11, 11, 7, 10, 0));  // month - 1

// const msg = '';
// const msg = `The web hosting service is upgrading
const msg = `The server is upgrading
from ${startTime.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
to ${endTime.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}.
Please come back later.`;

const Notice = () => {
  const isInTimeRange = useMemo(() => {
    const now = new Date();
    return now >= startTime && now <= endTime;
  }, []);

  return (
    <>
      {msg && isInTimeRange && (
        <Alert
          severity="warning"
          sx={{ width: '100%', mt: 1, mb: 1, textAlign: 'left' }}
        >
          {msg}
        </Alert>
  
      )}
    </>
  );
};

export default React.memo(Notice);
