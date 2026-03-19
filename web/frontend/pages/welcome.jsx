// @ts-check
import React, { useEffect } from "react";
import { Layout, Loading, Page } from "@shopify/polaris";
import { useNavigate } from "react-router-dom";
import { useAppQuery } from "../hooks";
import { getCurrentHost, getCurrentShop, withShopQuery } from "../utils/shop";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { data, isLoading, isFetching } = useAppQuery({
    url: withShopQuery("/api/hasActiveSubscription"),
    reactQueryOptions: {
      refetchInterval: 2000,
      staleTime: 0,
    },
  });

  useEffect(() => {
    if (isLoading || isFetching) return;

    if (data?.hasActiveSubscription) {
      navigate("/", { replace: true });
      return;
    }

    const params = new URLSearchParams();
    const shop = getCurrentShop();
    const host = getCurrentHost();
    if (shop) params.set("shop", shop);
    if (host) params.set("host", host);

    navigate(`/billing-required${params.toString() ? `?${params.toString()}` : ""}`, {
      replace: true,
    });
  }, [data, isFetching, isLoading, navigate]);

  return (
    <Page title="Finishing setup">
      <Layout>
        <Layout.Section>
          <Loading />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
