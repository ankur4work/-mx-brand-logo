// @ts-check
import React, { useEffect, useMemo } from "react";
import {
  Badge,
  Card,
  Frame,
  Layout,
  Page,
  TopBar,
} from "@shopify/polaris";
import { useNavigate } from "react-router-dom";
import { useAppQuery } from "../hooks";
import { getCurrentHost, getCurrentShop, withShopQuery } from "../utils/shop";

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

export default function HomePage() {
  const navigate = useNavigate();
  const logo = {
    width: 120,
    topBarSource: brandMark,
    accessibilityLabel: "LogoFlow Marquee",
    url: "/",
  };

  const {
    data: subscriptionData,
    isLoading,
    isFetching,
  } = useAppQuery({
    url: withShopQuery("/api/hasActiveSubscription"),
  });

  const currentPlan = useMemo(
    () => (subscriptionData?.hasActiveSubscription ? "premium" : "locked"),
    [subscriptionData]
  );
  const activePlanName = subscriptionData?.activePlanName;

  useEffect(() => {
    if (isLoading || isFetching) return;
    if (subscriptionData?.hasActiveSubscription) return;

    const params = new URLSearchParams();
    const shop = getCurrentShop();
    const host = getCurrentHost();
    if (shop) params.set("shop", shop);
    if (host) params.set("host", host);

    const query = params.toString();
    navigate(`/billing-required${query ? `?${query}` : ""}`, { replace: true });
  }, [isFetching, isLoading, navigate, subscriptionData]);

  const currentPlanLabel =
    currentPlan === "premium" ? activePlanName || "Pro" : "Locked";

  const shellStyle = {
    background:
      "radial-gradient(circle at top left, rgba(15,118,110,0.12), transparent 35%), linear-gradient(180deg, #FCFFFE 0%, #F2F7F6 100%)",
    borderRadius: 24,
    padding: 24,
    border: "1px solid #D8E6E2",
  };

  const statCard = {
    background: "#FFFFFF",
    border: "1px solid #DDE8E5",
    borderRadius: 18,
    padding: 18,
    minHeight: 120,
  };

  return (
    <Frame topBar={<TopBar />} logo={logo}>
      <Page
        title="LogoFlow Marquee"
        subtitle="Create a polished, scrolling logo strip for brand, partner, and press placements."
      >
        <Layout>
          <Layout.Section>
            <div style={shellStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 20,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      letterSpacing: 1.5,
                      textTransform: "uppercase",
                      color: "#0F766E",
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
                    Visual Merchandising
                  </div>
                  <h2
                    style={{
                      fontSize: 34,
                      lineHeight: 1.1,
                      margin: 0,
                      color: "#0F172A",
                      maxWidth: 620,
                    }}
                  >
                    Showcase the logos that build trust with your shoppers.
                  </h2>
                </div>

                <div
                  style={{
                    background: "#0F172A",
                    color: "#FFFFFF",
                    borderRadius: 18,
                    padding: "16px 18px",
                    minWidth: 220,
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Current plan</div>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 700,
                      marginTop: 8,
                    }}
                  >
                    {isLoading || isFetching ? "Checking..." : currentPlanLabel}
                  </div>
                </div>
              </div>

              <Layout>
                <Layout.Section oneHalf>
                  <div style={statCard}>
                    <Badge status="success">No code required</Badge>
                    <h3 style={{ marginTop: 14, marginBottom: 8 }}>
                      Built for fast storefront proof
                    </h3>
                    <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
                      Add the section in the theme editor, upload up to 8 logos,
                      and fine-tune width, height, and marquee speed for desktop
                      and mobile storefronts.
                    </p>
                  </div>
                </Layout.Section>

              </Layout>
            </div>
          </Layout.Section>

          <Layout.Section>
            <Card sectioned>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.3fr) minmax(280px, 0.9fr)",
                  gap: 24,
                  alignItems: "center",
                }}
              >
                <div>
                  <h3 style={{ marginTop: 0 }}>What merchants can control</h3>
                  <ul style={{ color: "#475569", lineHeight: 1.8, paddingLeft: 18 }}>
                    <li>Scrolling logo marquee with continuous motion</li>
                    <li>Up to 8 logos with optional outbound links</li>
                    <li>Adjustable heading, logo sizing, and animation speed</li>
                    <li>Responsive behavior across desktop and mobile</li>
                  </ul>

                  <h3 style={{ marginBottom: 8 }}>Setup flow</h3>
                  <ol style={{ color: "#475569", lineHeight: 1.8, paddingLeft: 18 }}>
                    <li>Open Shopify Theme Editor</li>
                    <li>Add the "LogoFlow Marquee" section</li>
                    <li>Upload logos and fine-tune display settings</li>
                    <li>Save, preview, and publish</li>
                  </ol>
                </div>

                <div
                  style={{
                    background:
                      "linear-gradient(145deg, #0F172A 0%, #134E4A 100%)",
                    borderRadius: 24,
                    padding: 22,
                    color: "#FFFFFF",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      opacity: 0.7,
                    }}
                  >
                    Recommended use cases
                  </div>
                  <div style={{ marginTop: 14, fontSize: 24, fontWeight: 700 }}>
                    Brand walls, partner showcases, and trust strips
                  </div>
                  <p style={{ marginTop: 14, marginBottom: 0, lineHeight: 1.7 }}>
                    Use the marquee to feature retailers, certifications, media
                    coverage, suppliers, or strategic partners without changing
                    the underlying storefront behavior.
                  </p>
                </div>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}
