"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
});

type Clinic = {
  id: number;
  nome: string;
  bairro: string;
  cidade: string;
  estado: string;
  tipo: string;
  imagens: any;
};

export default function Home() {

  const router = useRouter();

  const [premiumClinics, setPremiumClinics] = useState<Clinic[]>([]);

  useEffect(() => {

    async function fetchPremium() {

      const { data } = await supabase
        .from("clinicas")
        .select("*")
        .eq("tipo", "premium");

      console.log("CLINICAS:", data);

      setPremiumClinics(data || []);
    }

    fetchPremium();

  }, []);

  /* ───────────────────────────────────────────── */
  /* IMAGEM CLINICA */
  /* ───────────────────────────────────────────── */

  function getClinicImage(imagens: any) {

    try {

      // ARRAY
      if (Array.isArray(imagens)) {

        const image101 = imagens.find(
          (img: string) =>
            typeof img === "string" &&
            img.includes("1_01")
        );

        return (
          image101 ||
          imagens[0] ||
          "https://images.unsplash.com/photo-1566073771259-6a8506099945"
        );
      }

      // STRING JSON
      if (typeof imagens === "string") {

        try {

          const parsed = JSON.parse(imagens);

          if (Array.isArray(parsed)) {

            const image101 = parsed.find(
              (img: string) =>
                typeof img === "string" &&
                img.includes("1_01")
            );

            return (
              image101 ||
              parsed[0] ||
              "https://images.unsplash.com/photo-1566073771259-6a8506099945"
            );
          }

          return imagens;

        } catch {

          return imagens;
        }
      }

      return "https://images.unsplash.com/photo-1566073771259-6a8506099945";

    } catch {

      return "https://images.unsplash.com/photo-1566073771259-6a8506099945";
    }
  }

  return (
    <>
      <style>{`

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

html,
body{

  background:#050507;
  color:white;

  font-family:
    Inter,
    Arial,
    sans-serif;

  overflow-x:hidden;
}

.page{

  min-height:100vh;

  background:
    radial-gradient(
      circle at top,
      rgba(124,92,191,0.14),
      transparent 30%
    ),
    #050507;
}

/* NAVBAR */

.navbar{

  height:78px;

  padding:0 42px;

  display:flex;
  align-items:center;
  justify-content:space-between;

  border-bottom:
    1px solid rgba(255,255,255,0.05);

  background:
    rgba(0,0,0,0.45);

  backdrop-filter:blur(20px);

  position:sticky;
  top:0;
  z-index:999;
}

.logo{

  display:flex;
  align-items:center;
  gap:14px;

  font-size:28px;
  font-weight:700;
}

.logo span{
  color:#8B5CF6;
}

.nav{

  display:flex;
  gap:34px;
}

.nav a{

  color:#A1A1AA;

  text-decoration:none;

  font-size:14px;

  transition:0.2s;
}

.nav a:hover{
  color:white;
}

/* HERO */

.hero{

  padding-top:70px;

  text-align:center;
}

.hero h1{

  font-size:56px;

  font-weight:700;

  line-height:1.1;

  color:#A78BFA;
}

.hero p{

  margin-top:14px;

  font-size:20px;

  color:#B8B8C7;
}

/* SEARCH */

.search{

  width:620px;
  max-width:90%;

  margin:34px auto 0;

  height:58px;

  border-radius:18px;

  background:
    rgba(20,20,28,0.92);

  border:
    1px solid rgba(255,255,255,0.08);

  display:flex;
  align-items:center;

  padding:0 22px;

  backdrop-filter:blur(18px);
}

.search input{

  flex:1;

  background:none;
  border:none;
  outline:none;

  color:white;

  font-size:16px;
}

.search input::placeholder{
  color:#6B7280;
}

/* MAPA */

.map-wrap{

  width:92%;

  margin:42px auto 0;

  height:540px;

  overflow:hidden;

  border-radius:26px;

  border:
    1px solid rgba(255,255,255,0.07);

  box-shadow:
    0 0 60px rgba(124,92,191,0.10),
    0 20px 70px rgba(0,0,0,0.7);
}

/* PREMIUM */

.premium-section{

  margin-top:70px;

  padding:0 50px;
}

.premium-title{

  text-align:center;

  font-size:40px;

  font-weight:700;

  margin-bottom:34px;
}

.premium-title span{
  color:#EAB308;
}

.premium-card{

  background:#0F0F16;

  border-radius:22px;

  overflow:hidden;

  border:
    1px solid rgba(255,255,255,0.06);

  transition:0.3s;

  cursor:pointer;
}

.premium-card:hover{

  transform:translateY(-6px);

  border-color:
    rgba(234,179,8,0.3);

  box-shadow:
    0 20px 50px rgba(0,0,0,0.5),
    0 0 30px rgba(234,179,8,0.08);
}

.premium-image{

  height:210px;

  width:100%;

  object-fit:cover;
}

.premium-body{
  padding:18px;
}

.premium-badge{

  display:inline-block;

  background:#EAB308;

  color:black;

  font-size:11px;

  font-weight:700;

  padding:6px 10px;

  border-radius:999px;

  margin-bottom:12px;
}

.premium-name{

  font-size:24px;

  font-weight:700;
}

.premium-location{

  margin-top:8px;

  color:#A1A1AA;

  font-size:15px;
}

.premium-rating{

  margin-top:14px;

  color:#FACC15;

  font-size:16px;
}

/* CTA */

.cta{

  width:90%;

  margin:90px auto;

  background:#0B0B12;

  border:
    1px solid rgba(255,255,255,0.07);

  border-radius:30px;

  padding:70px 40px;

  text-align:center;
}

.cta h2{

  font-size:42px;

  margin-bottom:16px;
}

.cta p{

  color:#9CA3AF;

  font-size:18px;
}

.cta button{

  margin-top:34px;

  height:58px;

  padding:0 38px;

  border:none;

  border-radius:14px;

  background:
    linear-gradient(
      135deg,
      #FACC15,
      #EAB308
    );

  color:black;

  font-size:18px;

  font-weight:700;

  cursor:pointer;
}

/* MOBILE */

@media(max-width:900px){

  .hero h1{
    font-size:42px;
  }

  .hero p{
    font-size:18px;
  }

  .map-wrap{
    height:420px;
  }

  .premium-title{
    font-size:34px;
  }

  .cta h2{
    font-size:34px;
  }

  .navbar{
    padding:0 20px;
  }

  .nav{
    gap:18px;
  }
}

`}</style>

      <div className="page">

        {/* NAVBAR */}

        <div className="navbar">

          <div className="logo">
            Privacy <span>Log</span>
          </div>

          <div className="nav">
            <a href="#">Início</a>
            <a href="#">Blog</a>
            <a href="#">Contato</a>
          </div>

        </div>

        {/* HERO */}

        <div className="hero">

          <h1>
            O guia mais discreto do Brasil
          </h1>

          <p>
            Avaliações reais. Experiências reais.
          </p>

          <div className="search">

            <input
              placeholder="Buscar cidade ou região"
            />

          </div>

        </div>

        {/* MAPA */}

        <div className="map-wrap">

          <Map />

        </div>

        {/* PREMIUM */}

        <div className="premium-section">

          <div className="premium-title">
            Destaques <span>Premium</span>
          </div>

          <Swiper
            modules={[Navigation, Autoplay]}
            navigation
            autoplay={{
              delay: 3500,
            }}
            spaceBetween={26}
            slidesPerView={3}
            breakpoints={{
              0: {
                slidesPerView: 1,
              },
              700: {
                slidesPerView: 2,
              },
              1200: {
                slidesPerView: 3,
              },
            }}
          >

            {premiumClinics.map((clinic) => (

              <SwiperSlide key={clinic.id}>

                <div
                  className="premium-card"
                  onClick={() =>
                    router.push(`/clinica/${clinic.id}`)
                  }
                >

                  <img
                    className="premium-image"
                    src={getClinicImage(clinic.imagens)}
                    alt={clinic.nome}
                  />

                  <div className="premium-body">

                    <div className="premium-badge">
                      ⭐ PREMIUM
                    </div>

                    <div className="premium-name">
                      {clinic.nome}
                    </div>

                    <div className="premium-location">
                      {clinic.cidade} - {clinic.estado}
                    </div>

                    <div className="premium-rating">
                      ⭐ 4.9
                    </div>

                  </div>

                </div>

              </SwiperSlide>

            ))}

          </Swiper>

        </div>

        {/* CTA */}

        <div className="cta">

          <h2>
            Quer ver avaliações reais?
          </h2>

          <p>
            Entre na comunidade privada
          </p>

          <button>
            Entrar na Comunidade
          </button>

        </div>

      </div>
    </>
  );
}