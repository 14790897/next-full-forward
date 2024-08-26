// components/Recaptcha.js
"use client";
import { useEffect } from "react";

const Recaptcha = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/enterprise.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div>
      <form action="" method="POST">
        <div
          className="g-recaptcha"
          data-sitekey="6LcHNC8qAAAAAJZHuCvm9cZuol9NHaYReQdpLUdM"
          data-action="LOGIN"
        ></div>
        <br />
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

export default Recaptcha;
