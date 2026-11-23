import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { SITE } from '../../lib/site'

// Share image (LinkedIn, X, WhatsApp, Slack...). Social networks need a PNG or JPEG:
// they ignore SVG. It is generated once at build time from this file.
export const alt = `${SITE.name}, ${SITE.role}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const stack = ['React', 'TypeScript', 'Next.js', 'DeckGL', 'Mapbox']

/** The real format of an image file, read from its first bytes (a file's extension can lie). */
function mimeOf(bytes: Buffer) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg'
  if (bytes.subarray(1, 4).toString() === 'PNG') return 'image/png'
  return 'image/png'
}

export default async function Image() {
  // note: public/me.png is actually a JPEG file, hence the detection
  const photo = await readFile(path.join(process.cwd(), 'public', 'me.png'))
  const photoSrc = `data:${mimeOf(photo)};base64,${photo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 90px',
          color: '#e8e6f2',
          // One small gradient only: big smooth gradients compress badly in PNG, and
          // WhatsApp may skip the preview of images heavier than ~300 KB.
          backgroundColor: '#12143a',
          backgroundImage: 'radial-gradient(circle at 95% 95%, rgba(147,51,234,0.5) 0%, rgba(147,51,234,0) 30%)',
        }}
      >
        {/* a few stars */}
        {[
          [140, 70, 6], [470, 120, 4], [880, 60, 5], [1090, 190, 4], [1010, 520, 6],
          [560, 560, 4], [90, 500, 5], [760, 300, 3], [330, 30, 3],
        ].map(([x, y, s]) => (
          <div
            key={`${x}-${y}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: 999,
              backgroundColor: '#ffffff',
              opacity: 0.8,
            }}
          />
        ))}

        <div style={{ display: 'flex', flexShrink: 0 }}>
          {/* A plain <img> is required here: next/og renders it itself, next/image does not work in it. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            src={photoSrc}
            width={300}
            height={300}
            style={{ width: 300, height: 300, borderRadius: 150, border: '8px solid #8f7cff', objectFit: 'cover' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 70, maxWidth: 720 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, color: '#ffffff' }}>{SITE.name}</div>
          <div style={{ fontSize: 40, marginTop: 14, color: '#ffb86b' }}>{SITE.role}</div>
          <div style={{ fontSize: 28, marginTop: 22, color: '#cfc8ee' }}>4+ years · interactive web apps and maps</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 34 }}>
            {stack.map((s) => (
              <div
                key={s}
                style={{
                  display: 'flex',
                  fontSize: 24,
                  padding: '8px 20px',
                  marginRight: 12,
                  marginBottom: 12,
                  borderRadius: 999,
                  border: '2px solid #4b4f9a',
                  color: '#e8e6f2',
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
