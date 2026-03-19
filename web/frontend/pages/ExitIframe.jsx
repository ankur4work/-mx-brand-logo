import { Loading } from "@shopify/app-bridge-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ExitIframe() {
  const { search } = useLocation();

  useEffect(() => {
    if (!search) return;

    const params = new URLSearchParams(search);
    const redirectUri = params.get("redirectUri");
    if (!redirectUri) return;

    const decodedRedirectUri = decodeURIComponent(redirectUri);

    if (window.top && window.top !== window) {
      window.top.location.replace(decodedRedirectUri);
      return;
    }

    window.location.replace(decodedRedirectUri);
  }, [search]);

  return <Loading />;
}
