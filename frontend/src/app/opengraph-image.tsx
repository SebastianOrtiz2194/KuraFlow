import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'KuraFlow | Master Japanese & English';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a', // Slate 900
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to bottom right, #4f46e5, #ec4899)', // Indigo to Pink
            borderRadius: '24px',
            padding: '60px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            border: '2px solid rgba(255,255,255,0.1)',
          }}
        >
          <div
            style={{
              fontSize: '80px',
              fontWeight: 800,
              color: 'white',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span style={{ marginRight: '20px' }}>🏔️</span> KuraFlow
          </div>
          <div
            style={{
              fontSize: '40px',
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            Master Japanese & English
          </div>
          <div
            style={{
              fontSize: '28px',
              color: 'rgba(255,255,255,0.7)',
              marginTop: '40px',
              textAlign: 'center',
            }}
          >
            Adaptive SRS • Gamified Learning
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
