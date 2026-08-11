import Document, {
  Html,
  Head,
  Main,
  NextScript,
} from 'next/document';
import { getDirection } from '@/lib/constants';

export default class CustomDocument extends Document {
  render() {
    const { locale } = this.props.__NEXT_DATA__;
    const dir = getDirection(locale);

    return (
      <Html dir={dir} lang={locale}>
        <Head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.__ENV__ = {
                  NEXT_PUBLIC_REST_API_ENDPOINT: "${process.env['NEXT_PUBLIC_' + 'REST_API_ENDPOINT'] || ''}",
                  NEXT_PUBLIC_NOTIFICATION_API_URL: "${process.env['NEXT_PUBLIC_' + 'NOTIFICATION_API_URL'] || ''}",
                  NEXT_PUBLIC_API_URL: "${process.env['NEXT_PUBLIC_' + 'API_URL'] || ''}",
                  NEXT_PUBLIC_DOC_API_URL: "${process.env['NEXT_PUBLIC_' + 'DOC_API_URL'] || ''}",
                  NEXT_PUBLIC_TENANT_ID: "${process.env['NEXT_PUBLIC_' + 'TENANT_ID'] || ''}",
                  NEXT_PUBLIC_SITE_URL: "${process.env['NEXT_PUBLIC_' + 'SITE_URL'] || ''}",
                };
              `,
            }}
          />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=optional"
            rel="stylesheet"
          />
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
