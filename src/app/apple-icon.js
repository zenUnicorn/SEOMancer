import { ImageResponse } from 'next/og';

export const runtime = 'edge';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f0f12',
        }}
      >
        <div style={{ width: 100, height: 100, borderRadius: '50%', border: '24px solid #8c40ff' }} />
      </div>
    ),
    { ...size }
  );
}
