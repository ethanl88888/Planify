import React from "react";
import Bar from "./components/Bar";

function Home() {
  // React.useEffect(() => {
  //   fetch("http://localhost:3003")
  //     .then((res) => res.json())
  //     .then((data) => setData(data.message));
  // }, []);

  return (
    <div id="home">
      <Bar/>
    </div>
  );
}

export default Home

