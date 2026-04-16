import Footer from "@/components/Footer/Footer";
import GameArea from "@/components/GameArea/GameArea";
import GameShowcase from "@/components/GameShowcase/GameShowcase";
import LatestEventGallery from "@/components/LatestEventGallery/LatestEventGallery";
import styles from "./page.module.scss";
import Hero from "@/components/Hero/Hero";
import PartnersSlider from "@/components/PartnersSlider/PartnersSlider";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Hero />
        <PartnersSlider />
      </div>
      <GameShowcase />
      <GameArea />
      <div className={styles.container}>
        <LatestEventGallery />
      </div>
      <Footer />
    </div>
  );
}
