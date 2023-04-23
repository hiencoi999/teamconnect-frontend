import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

// https://developers.google.com/identity/gsi/web/reference/js-reference

const Login = ({socket}) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAccessToken } = useAuth();
  const divRef = useRef(null);

  const handleGoogle = async (response) => {
    
    setLoading(true);
    fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ credential: response.credential }),
    })
      .then((res) => {
        setLoading(false);
        return res.json();
      })
      .then((data) => {
        console.log({data})
        if (data?.accessToken) {
          localStorage.setItem("accessToken", data?.accessToken);
          localStorage.setItem("avatar", data?.avatar)
          localStorage.setItem("email", data?.email)
          
          const accessToken = data?.accessToken
          setAccessToken(accessToken)

          navigate('/projects', { replace: true })
        }
      })
      .catch((error) => {
        setError(error?.message);
      });
  };

  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogle,
      });

      google.accounts.id.renderButton(divRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        width: "400",
      });

    }
  }, [divRef.current]);

  return (
    <div style={{background: "#A5C9CA", height: '100vh'}}>
      <header style={{ textAlign: "center" }}>
        <img
          src={require("../../assets/icons.png")}
          alt=""
          style={{
            height: "40vh",
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            padding: "10vh",
          }}
        />
        <h1 style={{ color: "#2C3333" }}>Login with google account</h1>
      </header>
      <main
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          
        }}
      >
        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading ? <div>Loading....</div> : <div id="loginDiv" ref={divRef}></div>}
      </main>
    </div>
  );
};

export default Login;
