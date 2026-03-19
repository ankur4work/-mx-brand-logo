import { Loading, useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ExitIframe() {
  const app = useAppBridge();
  const { search } = useLocation();

  useEffect(() => {
    if (!app || !search) return;

    if (!search) return;

    const params = new URLSearchParams(search);
    const redirectUri = params.get("redirectUri");
    if (!redirectUri) return;

    const decodedRedirectUri = decodeURIComponent(redirectUri);
    const redirect = Redirect.create(app);
    const currentOrigin = window.location.origin;
    const targetOrigin = new URL(decodedRedirectUri).origin;

    if (targetOrigin === currentOrigin) {
      redirect.dispatch(Redirect.Action.APP, decodedRedirectUri);
      return;
    }

    redirect.dispatch(Redirect.Action.REMOTE, decodedRedirectUri);
  }, [app, search]);

  return <Loading />;
}
