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
    </div>
  );
}
