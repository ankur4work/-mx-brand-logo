import {
  Badge,
  Button,
  Card,
  Frame,
  Layout,
  Modal,
  Page,
  TopBar,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import CodeSnippetWithCopy from "../components/CodeSnippetWithCopy";

const brandMark = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="120" height="32" viewBox="0 0 120 32" fill="none">
    <rect width="32" height="32" rx="10" fill="#0F766E"/>
    <path d="M9 22V10h4.1l3.9 6.4L20.9 10H25v12h-3.6v-6.5l-2.9 4.8h-2.8l-2.9-4.8V22H9Z" fill="white"/>
    <path d="M44 22V10h8c2.8 0 4.6 1.6 4.6 4.1 0 1.7-.9 3-2.4 3.6L57.4 22H53l-2.7-3.8h-2.4V22H44Zm3.9-6.8h3.2c1.1 0 1.7-.5 1.7-1.5s-.6-1.5-1.7-1.5h-3.2v3Z" fill="#0F172A"/>
    <path d="M59 22l5.3-12h3.9l5.3 12h-4.1l-.9-2.1h-5.3l-.9 2.1H59Zm5.4-5h3.1L66 13.2 64.4 17Z" fill="#0F172A"/>
    <path d="M75.5 22V10h3.9v8.7H86V22h-10.5Z" fill="#0F172A"/>
    <path d="M88.5 22V10h10.3v3.1h-6.4v1.5h5.8v3h-5.8v1.4h6.6V22H88.5Z" fill="#0F172A"/>
  </svg>
`)}`;

export default function Installation() {
  const [active, setActive] = useState(false);
  const handleChange = useCallback(() => setActive((open) => !open), []);

  const logo = {
    width: 120,
    topBarSource: brandMark,
    url: "/",
    accessibilityLabel: "LogoFlow Marquee",
  };

  const cards = [
    {
      title: "1. Open your theme editor",
      description:
        "From Shopify admin, open Online Store > Themes > Customize to reach the section controls.",
    },
    {
      title: "2. Add the marquee section",
      description:
        'Choose the page template you want, then add the "LogoFlow Marquee" section from the app blocks list.',
    },
    {
      title: "3. Upload logos and links",
      description:
        "Add up to 8 logos, optional destination URLs, and tune heading text, logo size, and marquee speed.",
    },
    {
      title: "4. Save and preview",
      description:
        "Review the final spacing and motion on desktop and mobile, then publish when it looks right.",
    },
  ];

  return (
    <Frame topBar={<TopBar />} logo={logo}>
      <Page
        title="Installation Guide"
        subtitle="Everything merchants need to launch LogoFlow Marquee without changing theme code."
      >
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <Badge status="info">2-minute setup</Badge>
                  <h2 style={{ marginTop: 12, marginBottom: 8 }}>
                    Add the marquee from the theme editor and start showcasing
                    trusted logos right away.
                  </h2>
                  <p style={{ margin: 0, color: "#475569", maxWidth: 760 }}>
                    The feature stays exactly the same. This guide simply walks
                    merchants through the cleanest setup path for homepage and
                    full-site placements.
                  </p>
                </div>

                <Button primary onClick={handleChange}>
                  Watch Setup Video
                </Button>
              </div>
            </Card>
          </Layout.Section>

          {cards.map((card) => (
            <Layout.Section oneHalf key={card.title}>
              <Card sectioned>
                <h3 style={{ marginTop: 0, marginBottom: 10 }}>{card.title}</h3>
                <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>
                  {card.description}
                </p>
              </Card>
            </Layout.Section>
          ))}

          <Layout.Section>
            <CodeSnippetWithCopy />
          </Layout.Section>
        </Layout>

        <Modal
          open={active}
          onClose={handleChange}
          title="LogoFlow Marquee setup"
        >
          <Modal.Section>
            <video
              src="https://cdn.shopify.com/videos/c/o/v/8c397b84b66a4bd1b5d0b31e404effda.mp4"
              controls
              autoPlay
              muted
              style={{ width: "100%", borderRadius: 12 }}
            />
          </Modal.Section>
        </Modal>
      </Page>
    </Frame>
  );
}
