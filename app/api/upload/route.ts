import { NextResponse } from 'next/server';
import { isServerDeveloperMode } from '@/lib/config/appMode';
import {
  getImageUploadValidationError,
  isAcceptedImageFile,
  MAX_IMAGE_UPLOAD_BYTES,
} from '@/lib/imageUpload';
import { uploadToR2 } from '@/lib/server/r2/upload';
import { assertProductApiEnabled } from '@/lib/server/siteStore';

/**
 * Image upload → R2 (product mode).
 * Requires wrangler binding MEDIA + env R2_PUBLIC_URL / R2_BUCKET_NAME.
 */
export async function POST(request: Request) {
  if (isServerDeveloperMode()) {
    return NextResponse.json(
      { error: 'Upload API disabled in developer mode. Images stay as URLs/data URLs locally.' },
      { status: 403 },
    );
  }

  try {
    assertProductApiEnabled();
    const form = await request.formData();
    const file = form.get('file');
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const name = file instanceof File ? file.name : 'upload.webp';
    const validationError = getImageUploadValidationError(file);
    if (validationError === 'too_large') {
      return NextResponse.json(
        { error: `File exceeds ${MAX_IMAGE_UPLOAD_BYTES / (1024 * 1024)}MB limit` },
        { status: 413 },
      );
    }
    if (validationError === 'svg') {
      return NextResponse.json({ error: 'SVG uploads are not supported' }, { status: 415 });
    }
    if (!isAcceptedImageFile(file)) {
      return NextResponse.json({ error: 'Unsupported image type' }, { status: 415 });
    }

    const buffer = await file.arrayBuffer();
    const result = await uploadToR2({
      body: buffer,
      contentType: file.type || undefined,
      originalName: name,
    });

    return NextResponse.json({
      url: result.publicUrl,
      mediaId: result.mediaId,
      r2Key: result.r2Key,
      contentType: result.contentType,
      originalName: name,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    console.error('[api/upload] POST', err);

    if (message.includes('not available') || message.includes('not set')) {
      return NextResponse.json(
        {
          error: 'R2 not configured',
          hint: 'Set wrangler R2 binding MEDIA, R2_BUCKET_NAME, R2_PUBLIC_URL. See docs/DEPLOY_CLOUDFLARE.md',
          detail: message,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: 'Upload failed', detail: message }, { status: 500 });
  }
}
