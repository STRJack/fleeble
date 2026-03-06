'use client';

import { useState, useEffect } from 'react';
import { GitHubRelease } from '@/types';

const REPO = 'STRJack/fleeble';
const FALLBACK_VERSION = 'v1.0.0';
const FALLBACK_URL = `https://github.com/${REPO}/releases/latest/download/Fleeble-1.0.0-arm64.dmg`;

export function useGitHubRelease(): GitHubRelease {
  const [release, setRelease] = useState<GitHubRelease>({
    version: FALLBACK_VERSION,
    downloadUrl: FALLBACK_URL,
  });

  useEffect(() => {
    fetch(`https://api.github.com/repos/${REPO}/releases/latest`)
      .then((r) => r.json())
      .then((data) => {
        const version = data.tag_name || FALLBACK_VERSION;
        const dmg = data.assets?.find((a: { name: string }) =>
          a.name.endsWith('.dmg')
        );
        setRelease({
          version,
          downloadUrl: dmg?.browser_download_url || FALLBACK_URL,
        });
      })
      .catch(() => {});
  }, []);

  return release;
}
