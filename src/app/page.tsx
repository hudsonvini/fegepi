import Footer from "@/components/Footer/Footer";
import GameArea from "@/components/GameArea/GameArea";
import GameShowcase from "@/components/GameShowcase/GameShowcase";
import styles from "./page.module.scss";
import PartnersSlider from "@/components/PartnersSlider/PartnersSlider";
import ManagedHero from "@/components/ManagedHero/ManagedHero";
import LatestEventGallery from "@/components/LatestEventGallery/LatestEventGallery";
import ManagedGallery from "@/components/ManagedGallery/ManagedGallery";
import { getCurrentUser } from "@/lib/auth";
import { getPublicContent } from "@/lib/content";

export default async function Home() {
  const [user, content] = await Promise.all([getCurrentUser(), getPublicContent()]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <ManagedHero user={user} events={content.events} slides={content.heroSlides} />
        <PartnersSlider />
      </div>
      <img src="https://esl.com/wp-content/uploads/2024/08/3D-ESL-STATUES-Natalia-768.png" alt="" />
      <GameShowcase />
      <div id="ranking"><GameArea games={content.games} /></div>
      <div className={styles.container}>
        {content.gallery ? <ManagedGallery {...content.gallery} /> : <LatestEventGallery />}
      </div>
      <Footer />
    </div>
  );
}

