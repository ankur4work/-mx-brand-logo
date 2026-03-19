import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "./shopify.js";



let isProd;

export default async function cancelSubscription(
    session,
    isProdOverride = process.env.isProd === "production"
  ){
  
    isProd = isProdOverride;
  
    const subscriptionId = await getActiveSubsId(session);
    console.log("subscriptionId:" +subscriptionId)
    const status = await appSubscriptionCancel(session, subscriptionId);

    return status;
  
  }


  async function getActiveSubsId(session) {
    const client = new shopify.api.clients.Graphql({ session });
  
      const currentInstallations = await client.query({
        data: RECURRING_PURCHASES_QUERY,
      });
      const subscriptions =
        currentInstallations.body.data.currentAppInstallation.activeSubscriptions;
  
      for (let i = 0, len = subscriptions.length; i < len; i++) {
        console.log("subscription name: ", subscriptions[i].name);
        console.log("Subscription Id: ",subscriptions[i].id);
        return subscriptions[i].id;

      }

  }

  async function appSubscriptionCancel(session, subscriptionId) {
    const client = new shopify.api.clients.Graphql({ session });
  
    const mutationResponse = await client.query({
      data: {
        query: CANCEL_SUBSCRIPTION,
        variables: {
          id: subscriptionId
        },
      },
    });

    if (mutationResponse.body.errors && mutationResponse.body.errors.length) {
      throw new ShopifyGraphqlClient(
        "Error while subscription cancel",
        mutationResponse.body.errors
      );
    }else{
      console.log("Subscription canceled successfully: ", session.shop);
      //console.log("Status: ", mutationResponse.body.data.appSubscriptionCancel.appSubscription.status);
    }

    return  mutationResponse.body.data.appSubscriptionCancel.appSubscription.status;

  }

  const CANCEL_SUBSCRIPTION = `
mutation appSubscriptionCancel($id: ID!) {
  appSubscriptionCancel(id: $id) {
    appSubscription {
      id
      name
      status
    }
    userErrors {
      field
      message
    }
  }
}
`;

const RECURRING_PURCHASES_QUERY = `
query appSubscription {
  currentAppInstallation {
    activeSubscriptions {
      name, id, test
    }
  }
}
`;