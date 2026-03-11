'use client';

import { useEffect } from 'react';
import * as amplitude from '@amplitude/unified';

let initialized = false;

export default function AmplitudeProvider() {
  useEffect(() => {
    if (!initialized) {
      amplitude.initAll(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY!, {
        serverZone: 'EU',
        analytics: { autocapture: true },
        sessionReplay: { sampleRate: 1 },
      });
      initialized = true;
    }
  }, []);

  return null;
}
