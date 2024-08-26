// components/RecaptchaButton.js
"use client";

import Script from "next/script";

const RecaptchaButton = () => {
  const handleClick = async (e) => {
    e.preventDefault();
    grecaptcha.enterprise.ready(async () => {
      const token = await grecaptcha.enterprise.execute(
        "6LdQgi8qAAAAAOre8ZvVReRqnM9u0dim_DcVP3dU",
        { action: "LOGIN" }
      );
      console.log("reCAPTCHA token:", token);
      // 这里你可以将 token 发送到后端进行验证
    });
  };

  return (
    <>
      <Script
        src="https://www.google.com/recaptcha/enterprise.js?render=6LdQgi8qAAAAAOre8ZvVReRqnM9u0dim_DcVP3dU"
        strategy="afterInteractive"
      />
      <button onClick={handleClick}>Submit</button>
    </>
  );
};

export default RecaptchaButton;
