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
