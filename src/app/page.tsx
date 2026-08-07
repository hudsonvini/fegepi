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
import TeamRegistrationHero from "@/components/TeamRegistrationHero/TeamRegistrationHero";
import FeaturedPlayers from "@/components/FeaturedPlayers/FeaturedPlayers";
import { getFeaturedPlayers } from "@/lib/players";

export default async function Home() {
  const [user, content, featuredPlayers] = await Promise.all([
    getCurrentUser(),
    getPublicContent(),
    getFeaturedPlayers(),
  ]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <ManagedHero user={user} events={content.events} slides={content.heroSlides} />
        <PartnersSlider />
      </div>
      <TeamRegistrationHero />
      <GameShowcase />
      <div id="ranking"><GameArea games={content.games} /></div>
      <FeaturedPlayers players={featuredPlayers} />
      <div className={styles.container}>
        {content.gallery ? <ManagedGallery {...content.gallery} /> : <LatestEventGallery />}
      </div>
      <Footer />
    </div>
  );
}

