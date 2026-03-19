// @ts-check
import React, { useEffect, useRef, useState } from "react";
import { Banner, Button, Card, Frame, Layout, Loading, Page } from "@shopify/polaris";
import { withShopQuery } from "../utils/shop";

export default function BillingRequired() {
  const hasAttemptedRedirect = useRef(false);
  const [redirecting, setRedirecting] = useState(false);
  const [banner, setBanner] = useState({ msg: "", status: null });

  function openPricing(auto = false) {
    try {
      setRedirecting(true);
      window.location.assign(withShopQuery("/billing/start"));
    } catch (_error) {
      setRedirecting(false);
      if (auto) {
        setBanner({
          msg: "Unable to open Shopify pricing automatically. Use the button below.",
          status: "warning",
        });
      }
    }
  }

  useEffect(() => {
    if (hasAttemptedRedirect.current) return;
    hasAttemptedRedirect.current = true;
    openPricing(true);
  }, []);

  return (
    <Frame>
      {redirecting && <Loading />}
      <Page
        title="Plan required"
        subtitle="A Shopify managed Pro plan is required before merchants can use the app dashboard."
      >
        {!!banner.msg && <Banner status={banner.status}>{banner.msg}</Banner>}

        <Layout>
          <Layout.Section>
            <Card sectioned>
              <p style={{ marginTop: 0, color: "#475569", lineHeight: 1.7 }}>
                Shopify handles the plan selection and payment approval for this
                app. After the Pro subscription is approved, dashboard access
                unlocks automatically.
              </p>

              <Button primary loading={redirecting} onClick={() => openPricing(false)}>
                Open Shopify pricing
              </Button>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}
