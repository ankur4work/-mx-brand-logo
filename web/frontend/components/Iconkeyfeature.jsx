import React from "react";
import { Button, Card, Image, Icon } from '@shopify/polaris';

import { stylesheet } from "../assets";

import { ViewMajor } from '@shopify/polaris-icons';



export function Iconkeyfeature(props) {


   
    return (

        <div className="meta-card-1">
            <Card>
                <div className="meta-card-data-wrapper">
                    <div className="meta-card-data-1">
                        <div className="meta-image-1">
                            <Image source={props.imagespeed} />
                        </div>
                        <div className="meta-product-1">
                            <h1><b>{props.productname}</b></h1>
                        </div>

                    </div>

                    <div className="m-view-similar-button">
                        <Button plain monochrome removeUnderline fullWidth ><Icon source={ViewMajor} /></Button>
                    </div>

                    <div className="meta-card-hovered-data">

                        <div className="meta-card-hovered-data-paragraph-1">
                            <p>{props.description}</p>
                        </div>


                    </div>
                </div>

            </Card>
        </div >

    )


}





