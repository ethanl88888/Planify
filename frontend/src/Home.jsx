import React from "react";
import Bar from "./components/Bar";
import home_cover from '/home_cover.jpg';
import './css/Home.css';

function Home() {
  // React.useEffect(() => {
  //   fetch("http://localhost:3003")
  //     .then((res) => res.json())
  //     .then((data) => setData(data.message));
  // }, []);

  return (
    <>
      <Bar/>
      <div id="home">
        <div id="home-main">
          <div id="home-main-left">
            <h1>Let's Plan <br /> Your Next Trip.</h1>
            <img src={home_cover} alt="Home Cover Image" />
          </div>
          <div id="home-main-right">

          </div>
        </div>
      </div>
    </>
  );
}

export default Home

