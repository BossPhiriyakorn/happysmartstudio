import { NextResponse } from 'next/server';
import { isServerDeveloperMode } from '@/lib/config/appMode';
import { emptySiteSnapshot } from '@/lib/data/defaults';
import { assertProductApiEnabled, getSiteStore } from '@/lib/server/siteStore';
import { isValidSiteSnapshot } from '@/lib/server/snapshotValidate';

export async function GET() {
  if (isServerDeveloperMode()) {
    return NextResponse.json(
      { error: 'Site API disabled in developer mode. Use localStorage locally.' },
      { status: 403 },
    );
  }

  try {
    assertProductApiEnabled();
    const snapshot = (await getSiteStore().load()) ?? emptySiteSnapshot();
    return NextResponse.json({ snapshot });
  } catch (err) {
    console.error('[api/site] GET', err);
    return NextResponse.json({ error: 'Failed to load site' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (isServerDeveloperMode()) {
    return NextResponse.json(
      { error: 'Site API disabled in developer mode.' },
      { status: 403 },
    );
  }

  try {
    assertProductApiEnabled();
    const body = (await request.json()) as { snapshot?: unknown };
    if (!isValidSiteSnapshot(body.snapshot)) {
      return NextResponse.json({ error: 'Invalid snapshot payload' }, { status: 400 });
    }
    await getSiteStore().save(body.snapshot);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/site] PUT', err);
    return NextResponse.json({ error: 'Failed to save site' }, { status: 500 });
  }
}
