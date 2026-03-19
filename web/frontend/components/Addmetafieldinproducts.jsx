
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import React from 'react';

export const Addmetafieldinproducts = (props) => {
  return (
    <Carousel
    infiniteLoop="true"
    autoPlay="true"
    interval="2000"
    emulateTouch="true"
>

    <div>
        <img src={props.image1} />

    </div>
    <div>
        <img src={props.image2} />

    </div>
    <div>
        <img src={props.image3}  />

    </div>
    <div>
        <img src={props.image4}  />

    </div>
    <div>
        <img src={props.image5} />

    </div>
    <div>
        <img src={props.image6}  />

    </div>
    <div>
        <img src={props.image7}  />

    </div>
    <div>
        <img src={props.image8}  />

    </div>
    <div>
        <img src={props.image9}  />

    </div>

</Carousel>
  );
}

