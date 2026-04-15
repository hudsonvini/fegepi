import Image from "next/image";
import styles from "./page.module.scss";
import Hero from "@/components/Hero/Hero";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Hero />

      </div>

    </div>
  );
}
