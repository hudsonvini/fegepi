'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowDownRight, ArrowRight } from 'lucide-react'
import styles from './TeamRegistrationHero.module.scss'

export default function TeamRegistrationHero() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const section = sectionRef.current

    if (!section || !('IntersectionObserver' in window)) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.18 },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      className={`${styles.stage} ${isVisible ? styles.isVisible : ''}`}
      aria-labelledby="team-registration-title"
    >
      <div className={styles.decorations} aria-hidden="true">
        <svg className={styles.decorCanvas} viewBox="0 0 1740 720" preserveAspectRatio="none">
          <defs>
            <mask id="team-green-sweep" maskUnits="userSpaceOnUse" x="0" y="-100" width="1740" height="920">
              <path
                className={`${styles.trace} ${styles.traceGreenSweep}`}
                pathLength="1"
                d="M 944 -75 C 855 56 826 197 798 338 C 772 474 729 590 658 742"
              />
            </mask>
            <mask id="team-green-diagonal" maskUnits="userSpaceOnUse" x="0" y="-100" width="1740" height="920">
              <path
                className={`${styles.trace} ${styles.traceGreenDiagonal}`}
                pathLength="1"
                d="M 8 671 L 788 386"
              />
            </mask>
            <mask id="team-yellow-diagonal" maskUnits="userSpaceOnUse" x="0" y="-100" width="1740" height="920">
              <path
                className={`${styles.trace} ${styles.traceYellowDiagonal}`}
                pathLength="1"
                d="M 216 778 L 924 350"
              />
            </mask>
            <mask id="team-yellow-sweep" maskUnits="userSpaceOnUse" x="0" y="-100" width="1740" height="920">
              <path
                className={`${styles.trace} ${styles.traceYellowSweep}`}
                pathLength="1"
                d="M 1080 -28 C 1327 18 1551 112 1796 292"
              />
            </mask>
            <mask id="team-blue-ray" maskUnits="userSpaceOnUse" x="0" y="-100" width="1740" height="920">
              <path
                className={`${styles.trace} ${styles.traceBlueRay}`}
                pathLength="1"
                d="M 1228 316 L 1798 83"
              />
            </mask>
            <mask id="team-blue-ray-small" maskUnits="userSpaceOnUse" x="0" y="-100" width="1740" height="920">
              <path
                className={`${styles.trace} ${styles.traceBlueRaySmall}`}
                pathLength="1"
                d="M 1306 437 L 1798 282"
              />
            </mask>
          </defs>

          <path
            className={styles.greenSweep}
            mask="url(#team-green-sweep)"
            d="M 810 -24 C 730 72 698 188 668 330 C 646 436 614 530 558 636 L 668 696 C 740 570 771 458 796 342 C 825 207 864 91 944 -24 Z"
          />
          <path
            className={styles.greenDiagonal}
            mask="url(#team-green-diagonal)"
            d="M -66 690 L -66 534 L 740 326 L 783 429 Z"
          />
          <path
            className={styles.yellowDiagonal}
            mask="url(#team-yellow-diagonal)"
            d="M 170 758 L 346 758 L 910 392 L 834 322 Z"
          />
          <path
            className={styles.yellowSweep}
            mask="url(#team-yellow-sweep)"
            d="M 1084 -32 C 1316 8 1560 88 1806 222 L 1806 348 C 1557 213 1314 132 1084 84 Z"
          />
          <path
            className={styles.blueStar}
            d="M 1148 47 L 1173 124 L 1254 126 L 1188 174 L 1212 252 L 1148 205 L 1083 252 L 1108 174 L 1042 126 L 1123 124 Z"
          />
          <path
            className={styles.blueRay}
            mask="url(#team-blue-ray)"
            d="M 1230 248 L 1806 35 L 1806 149 L 1268 338 Z"
          />
          <path
            className={styles.blueRaySmall}
            mask="url(#team-blue-ray-small)"
            d="M 1312 386 L 1806 244 L 1806 342 L 1344 468 Z"
          />
          <path
            className={styles.yellowBurst}
            d="M 1586 376 L 1635 413 L 1698 390 L 1675 454 L 1714 504 L 1647 502 L 1611 558 L 1592 494 L 1528 476 L 1583 437 Z"
          />
        </svg>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelSurface} aria-hidden="true" />
        <Image
          src="/images/team-registration-characters-neutral.png"
          alt="Três competidores de esports reunidos e prontos para jogar"
          fill
          priority
          sizes="(max-width: 760px) 100vw, 1500px"
          className={styles.artwork}
        />
        <div className={styles.characterLights} aria-hidden="true" />

        <div className={styles.content}>
          <span className={styles.eyebrow}>
            <i aria-hidden="true" />
            Inscrições abertas
          </span>
          <p className={styles.kicker}>A arena é de vocês</p>
          <h2 id="team-registration-title">
            Seu time pode ser o próximo <strong>campeão</strong>
          </h2>
          <p className={styles.description}>
            Reúna sua line, represente sua cidade e dispute os campeonatos que movimentam
            o cenário gamer do Piauí.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/cadastro">
              Cadastre sua equipe
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link className={styles.secondaryAction} href="#ranking">
              Ver modalidades
              <ArrowDownRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

