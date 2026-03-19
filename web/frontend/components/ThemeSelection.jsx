import {  Card,
    Heading,
    TextContainer,
    DisplayText,
    TextStyle, Select,Banner  } from "@shopify/polaris";
  import { useState, useCallback } from "react";
  import { useAppQuery, useAuthenticatedFetch } from "../hooks";
  
  export function ThemeValidate() {
    const [selected, setSelected] = useState("today");
    const [isLoading, setIsLoading] = useState(true);
  
    const {
      data,
      isLoading: isLoadingCount,
    } = useAppQuery({
      url: "/api/themes/get",
      reactQueryOptions: {
        onSuccess: () => {
          setIsLoading(false);
          console.log("successfully fetched themes");        
        },
      },
    });
    
    function handleDismiss(){
      console.log("dismiss clicked");
      document.getElementById('themeCompatibilityBanner').remove();
    }
  
  
    return (
      <div id="themeCompatibilityBanner">
  
  
  
        { isLoadingCount ? "" : 
        data?.supportAppBlock == 'true' ?
          <Banner  title="Published theme Compatibility" status="success" onDismiss={() => { handleDismiss() }}>
            <p>Your current published theme supports App block and this app 🎉🎉</p>
          </Banner>
          :
          <Banner title="Theme supports App Block" status="warning" onDismiss={() => { handleDismiss() }}>
            <p>Your current theme does not support app blocks, please upgrade your theme to Shopify 2.0</p>
          </Banner>
        }
  
  
      </div>
      
    );
  }