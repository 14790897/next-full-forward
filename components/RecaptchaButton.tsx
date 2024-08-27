// components/RecaptchaButton.js
"use client";
//6LdQgi8qAAAAAOre8ZvVReRqnM9u0dim_DcVP3dU  6Lfh9i8qAAAAAHdMMpz3dJjLhmcsckckLeu8yTpj
import Script from "next/script";
import { useState } from "react";

const RecaptchaButton = () => {
  const recaptchaSiteKey = "6Lfh9i8qAAAAAHdMMpz3dJjLhmcsckckLeu8yTpj";
  const recaptchaSrc = `https://www.google.com/recaptcha/enterprise.js?render=${recaptchaSiteKey}`;
  const [token, setToken] = useState("");
  const handleClick = async (e) => {
    e.preventDefault();
    grecaptcha.enterprise.ready(async () => {
      setToken(
        await grecaptcha.enterprise.execute(
          recaptchaSiteKey,
          { action: "LOGIN" }
        )
      );
      console.log("reCAPTCHA token:", token);
    });
  };

  return (
    <>
      <Script src={recaptchaSrc} strategy="afterInteractive" />
      <button onClick={handleClick}>Submit</button>
      <textarea value={token} readOnly />
    </>
  );
};

export default RecaptchaButton;
