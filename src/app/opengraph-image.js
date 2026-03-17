import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'SEOMancer';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom, #16171a, #0a0514)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', border: '16px solid white' }} />
          <div style={{ fontSize: 130, fontWeight: 'bold' }}>SEOMancer</div>
        </div>
        <div style={{ marginTop: 40, fontSize: 40, color: '#a1a1aa' }}>
          The Ultimate SEO Optimization Tool
        </div>
      </div>
    ),
    { ...size }
  );
}
