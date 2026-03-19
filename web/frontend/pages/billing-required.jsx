// @ts-check
import React, { useEffect, useRef, useState } from "react";
import { Banner, Button, Card, Frame, Layout, Loading, Page } from "@shopify/polaris";
import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useAuthenticatedFetch } from "../hooks";
import { withShopQuery } from "../utils/shop";

export default function BillingRequired() {
  const app = useAppBridge();
  const fetchAuth = useAuthenticatedFetch();
  const redirect = Redirect.create(app);
  const hasAttemptedRedirect = useRef(false);

  const [pricingUrl, setPricingUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [banner, setBanner] = useState({ msg: "", status: null });

  async function openPricing(auto = false) {
    if (!pricingUrl) return;

    try {
      setRedirecting(true);
      if (window.top) {
        window.top.location.href = pricingUrl;
        return;
      }

      redirect.dispatch(Redirect.Action.REMOTE, pricingUrl);
    } catch (_error) {
      if (auto) {
        setBanner({
          msg: "Unable to open Shopify pricing automatically. Use the button below.",
          status: "warning",
        });
      }
    } finally {
      setRedirecting(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetchAuth(withShopQuery("/api/billing-required"));
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data?.error || "Unable to load billing information.");
        }

        setPricingUrl(data?.pricingUrl || "");
      } catch (error) {
        setBanner({
          msg:
            error instanceof Error
              ? error.message
              : "Unable to load billing information.",
          status: "critical",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (loading || !pricingUrl || hasAttemptedRedirect.current) return;
    hasAttemptedRedirect.current = true;
    openPricing(true);
  }, [loading, pricingUrl]);

  return (
    <Frame>
      {(loading || redirecting) && <Loading />}
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

              <Button
                primary
                loading={redirecting}
                disabled={!pricingUrl}
                onClick={() => openPricing(false)}
              >
                Open Shopify pricing
              </Button>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}
